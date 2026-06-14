const Transaction = require('../models/transaction.model');
const Loan        = require('../models/loan.model');
const Repayment   = require('../models/repayment.model');
const Customer    = require('../models/customer.model');
const Account     = require('../models/account.model');
const { successResponse, errorResponse } = require('../utils/response.utils');

// Helper: build branch filter for admin vs. staff
const branchFilter = (req, extra = {}) => {
  const filter = { ...extra };
  if (req.user.role !== 'admin') filter.branch = req.user.branch;
  return filter;
};

// @desc    Financial overview dashboard
// @route   GET /api/reports/overview
// @access  Private
exports.getOverview = async (req, res) => {
  try {
    const filter = branchFilter(req);

    const [
      totalCustomers,
      totalAccounts,
      accountAgg,
      loanAgg,
      pendingLoans,
      overdueLoans,
    ] = await Promise.all([
      Customer.countDocuments(filter),
      Account.countDocuments(filter),
      Account.aggregate([
        { $match: filter },
        { $group: { _id: null, totalSavings: { $sum: '$balance' } } },
      ]),
      Loan.aggregate([
        { $match: { ...filter, status: { $in: ['approved', 'disbursed'] } } },
        { $group: { _id: null, totalOutstanding: { $sum: '$outstandingBalance' }, count: { $sum: 1 } } },
      ]),
      Loan.countDocuments({ ...filter, status: 'pending' }),
      Loan.countDocuments({ ...filter, status: { $in: ['approved', 'disbursed'] }, dueDate: { $lt: new Date() } }),
    ]);

    successResponse(res, {
      totalCustomers,
      totalAccounts,
      totalSavings:      accountAgg[0]?.totalSavings    || 0,
      totalOutstanding:  loanAgg[0]?.totalOutstanding   || 0,
      activeLoans:       loanAgg[0]?.count              || 0,
      pendingLoans,
      overdueLoans,
    });
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Transaction summary (deposits vs withdrawals by date range)
// @route   GET /api/reports/transactions
// @access  Private
exports.getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = branchFilter(req);

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const summary = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id:        '$type',
          totalAmount: { $sum: '$amount' },
          count:       { $sum: 1 },
        },
      },
    ]);

    const result = { deposits: { total: 0, count: 0 }, withdrawals: { total: 0, count: 0 } };
    summary.forEach((s) => {
      if (s._id === 'deposit')    result.deposits    = { total: s.totalAmount, count: s.count };
      if (s._id === 'withdrawal') result.withdrawals = { total: s.totalAmount, count: s.count };
    });
    result.netFlow = result.deposits.total - result.withdrawals.total;

    successResponse(res, result);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Loan portfolio report
// @route   GET /api/reports/loans
// @access  Private
exports.getLoanReport = async (req, res) => {
  try {
    const filter = branchFilter(req);

    const byStatus = await Loan.aggregate([
      { $match: filter },
      {
        $group: {
          _id:             '$status',
          count:           { $sum: 1 },
          totalAmount:     { $sum: '$amount' },
          totalOutstanding: { $sum: '$outstandingBalance' },
        },
      },
    ]);

    const totalDisbursed = await Loan.aggregate([
      { $match: { ...filter, status: { $in: ['disbursed', 'closed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalRepaid = await Repayment.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    successResponse(res, {
      byStatus,
      totalDisbursed: totalDisbursed[0]?.total || 0,
      totalRepaid:    totalRepaid[0]?.total    || 0,
    });
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Customer statement (transactions + repayments for a customer)
// @route   GET /api/reports/statement/:customerId
// @access  Private
exports.getCustomerStatement = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate)   dateFilter.$lte = new Date(endDate);

    const txFilter  = { customer: req.params.customerId };
    const repFilter = { customer: req.params.customerId };
    if (Object.keys(dateFilter).length) {
      txFilter.createdAt  = dateFilter;
      repFilter.createdAt = dateFilter;
    }

    const [customer, transactions, repayments, accounts, loans] = await Promise.all([
      Customer.findById(req.params.customerId).populate('branch', 'name code'),
      Transaction.find(txFilter).sort('-createdAt'),
      Repayment.find(repFilter).populate('loan', 'loanNumber').sort('-createdAt'),
      Account.find({ customer: req.params.customerId }),
      Loan.find({ customer: req.params.customerId }).sort('-createdAt'),
    ]);

    if (!customer) return errorResponse(res, 'Customer not found', 404);

    successResponse(res, { customer, accounts, loans, transactions, repayments });
  } catch (err) {
    errorResponse(res, err.message);
  }
};
