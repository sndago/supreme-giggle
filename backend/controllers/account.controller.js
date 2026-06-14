const Account  = require('../models/account.model');
const Customer = require('../models/customer.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

// @desc    Create account for a customer
// @route   POST /api/accounts
// @access  Private
exports.createAccount = async (req, res) => {
  try {
    const { customerId, type, currency } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) return errorResponse(res, 'Customer not found', 404);

    const account = await Account.create({
      customer:  customerId,
      branch:    customer.branch,
      type:      type || 'savings',
      currency:  currency || 'GHS',
      createdBy: req.user._id,
    });

    successResponse(res, account, 'Account created', 201);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get all accounts
// @route   GET /api/accounts
// @access  Private
exports.getAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 20, branch } = req.query;
    const skip   = (page - 1) * limit;
    const filter = {};

    if (req.user.role !== 'admin') filter.branch = req.user.branch;
    else if (branch) filter.branch = branch;

    const total    = await Account.countDocuments(filter);
    const accounts = await Account.find(filter)
      .populate('customer', 'firstName lastName customerNumber phone')
      .populate('branch', 'name code')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    paginatedResponse(res, accounts, total, page, limit);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private
exports.getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id)
      .populate('customer', 'firstName lastName customerNumber phone email')
      .populate('branch', 'name code');
    if (!account) return errorResponse(res, 'Account not found', 404);
    successResponse(res, account);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get accounts by customer
// @route   GET /api/accounts/customer/:customerId
// @access  Private
exports.getAccountsByCustomer = async (req, res) => {
  try {
    const accounts = await Account.find({ customer: req.params.customerId })
      .populate('branch', 'name code');
    successResponse(res, accounts);
  } catch (err) {
    errorResponse(res, err.message);
  }
};
