const mongoose    = require('mongoose');
const Account     = require('../models/account.model');
const Transaction = require('../models/transaction.model');
const Customer    = require('../models/customer.model');
const notify      = require('../services/notification.service');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

// ── Deposit ────────────────────────────────────────────────────────────────
// @route   POST /api/transactions/deposit
// @access  Private
exports.deposit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { accountId, amount, description } = req.body;
    if (!amount || amount <= 0) return errorResponse(res, 'Invalid amount', 400);

    const account = await Account.findById(accountId).session(session);
    if (!account)        return errorResponse(res, 'Account not found', 404);
    if (!account.isActive) return errorResponse(res, 'Account is inactive', 400);

    const balanceBefore = account.balance;
    account.balance     = parseFloat((account.balance + amount).toFixed(2));
    await account.save({ session });

    const transaction = await Transaction.create(
      [{
        account,
        customer:     account.customer,
        branch:       account.branch,
        type:         'deposit',
        amount,
        balanceBefore,
        balanceAfter: account.balance,
        description,
        processedBy:  req.user._id,
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Send notifications async — don't await to keep response fast
    Customer.findById(account.customer).then((customer) => {
      if (customer) {
        notify.deposit(customer, amount, account.balance, transaction[0].reference);
      }
    });

    successResponse(res, transaction[0], 'Deposit successful', 201);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    errorResponse(res, err.message);
  }
};

// ── Withdrawal ─────────────────────────────────────────────────────────────
// @route   POST /api/transactions/withdraw
// @access  Private
exports.withdraw = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { accountId, amount, description } = req.body;
    if (!amount || amount <= 0) return errorResponse(res, 'Invalid amount', 400);

    const account = await Account.findById(accountId).session(session);
    if (!account)           return errorResponse(res, 'Account not found', 404);
    if (!account.isActive)  return errorResponse(res, 'Account is inactive', 400);
    if (account.balance < amount) return errorResponse(res, 'Insufficient funds', 400);

    const balanceBefore = account.balance;
    account.balance     = parseFloat((account.balance - amount).toFixed(2));
    await account.save({ session });

    const transaction = await Transaction.create(
      [{
        account,
        customer:     account.customer,
        branch:       account.branch,
        type:         'withdrawal',
        amount,
        balanceBefore,
        balanceAfter: account.balance,
        description,
        processedBy:  req.user._id,
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    Customer.findById(account.customer).then((customer) => {
      if (customer) {
        notify.withdrawal(customer, amount, account.balance, transaction[0].reference);
      }
    });

    successResponse(res, transaction[0], 'Withdrawal successful', 201);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    errorResponse(res, err.message);
  }
};

// ── Get transactions ───────────────────────────────────────────────────────
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, accountId, type, branch, startDate, endDate } = req.query;
    const skip   = (page - 1) * limit;
    const filter = {};

    if (req.user.role !== 'admin') filter.branch = req.user.branch;
    else if (branch) filter.branch = branch;

    if (accountId) filter.account = accountId;
    if (type)      filter.type    = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const total        = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('account', 'accountNumber type')
      .populate('customer', 'firstName lastName customerNumber')
      .populate('processedBy', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    paginatedResponse(res, transactions, total, page, limit);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @route   GET /api/transactions/:id
exports.getTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id)
      .populate('account', 'accountNumber type')
      .populate('customer', 'firstName lastName customerNumber phone')
      .populate('branch', 'name code')
      .populate('processedBy', 'name');
    if (!tx) return errorResponse(res, 'Transaction not found', 404);
    successResponse(res, tx);
  } catch (err) {
    errorResponse(res, err.message);
  }
};
