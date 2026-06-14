const mongoose   = require('mongoose');
const Loan       = require('../models/loan.model');
const Repayment  = require('../models/repayment.model');
const Customer   = require('../models/customer.model');
const notify     = require('../services/notification.service');
const { calculatePenalty, splitRepayment } = require('../utils/loan.utils');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

// @desc    Record a repayment
// @route   POST /api/repayments
// @access  Private
exports.createRepayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { loanId, amount, paymentMethod } = req.body;
    if (!amount || amount <= 0) return errorResponse(res, 'Invalid amount', 400);

    const loan = await Loan.findById(loanId).session(session);
    if (!loan) return errorResponse(res, 'Loan not found', 404);
    if (!['approved', 'disbursed'].includes(loan.status))
      return errorResponse(res, 'Loan is not active', 400);
    if (loan.outstandingBalance <= 0)
      return errorResponse(res, 'Loan is already fully repaid', 400);

    // Clamp amount to outstanding balance
    const payAmount  = Math.min(amount, loan.outstandingBalance);

    // Check for late payment
    const today      = new Date();
    const isLate     = loan.dueDate && today > loan.dueDate;
    const daysLate   = isLate ? Math.floor((today - loan.dueDate) / 86400000) : 0;
    const penalty    = isLate ? calculatePenalty(loan.outstandingBalance, daysLate) : 0;

    // Interest paid first, then principal
    const totalInterestRemaining = loan.totalInterest - (loan.totalRepayable - loan.amount - (loan.totalInterest - (loan.outstandingBalance - (loan.totalRepayable - loan.outstandingBalance))));
    const { interest, principal } = splitRepayment(payAmount, loan.outstandingBalance, Math.max(0, totalInterestRemaining));

    const balanceBefore          = loan.outstandingBalance;
    loan.outstandingBalance      = parseFloat((loan.outstandingBalance - payAmount).toFixed(2));
    if (loan.outstandingBalance <= 0) {
      loan.outstandingBalance = 0;
      loan.status  = 'closed';
      loan.closedAt = new Date();
    }
    await loan.save({ session });

    const repayment = await Repayment.create(
      [{
        loan:          loanId,
        customer:      loan.customer,
        branch:        loan.branch,
        amount:        payAmount,
        principal,
        interest,
        penalty,
        balanceBefore,
        balanceAfter:  loan.outstandingBalance,
        paymentMethod: paymentMethod || 'cash',
        isLate,
        daysLate,
        processedBy:   req.user._id,
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    Customer.findById(loan.customer).then((customer) => {
      if (customer) notify.repayment(customer, repayment[0], loan.outstandingBalance);
    });

    successResponse(res, repayment[0], 'Repayment recorded', 201);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    errorResponse(res, err.message);
  }
};

// @desc    Get all repayments
// @route   GET /api/repayments
// @access  Private
exports.getRepayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, loanId, branch, startDate, endDate } = req.query;
    const skip   = (page - 1) * limit;
    const filter = {};

    if (req.user.role !== 'admin') filter.branch = req.user.branch;
    else if (branch) filter.branch = branch;

    if (loanId) filter.loan = loanId;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const total      = await Repayment.countDocuments(filter);
    const repayments = await Repayment.find(filter)
      .populate('loan',     'loanNumber amount')
      .populate('customer', 'firstName lastName customerNumber')
      .populate('processedBy', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    paginatedResponse(res, repayments, total, page, limit);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get repayments for a loan
// @route   GET /api/repayments/loan/:loanId
// @access  Private
exports.getRepaymentsByLoan = async (req, res) => {
  try {
    const repayments = await Repayment.find({ loan: req.params.loanId })
      .populate('processedBy', 'name')
      .sort('-createdAt');
    successResponse(res, repayments);
  } catch (err) {
    errorResponse(res, err.message);
  }
};
