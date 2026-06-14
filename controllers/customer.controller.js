const Customer = require('../models/customer.model');
const Account  = require('../models/account.model');
const Loan     = require('../models/loan.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create({
      ...req.body,
      createdBy: req.user._id,
      // Staff can only create customers in their own branch
      branch: req.user.role === 'admin' ? req.body.branch : req.user.branch,
    });
    successResponse(res, customer, 'Customer created', 201);
  } catch (err) {
    if (err.code === 11000) return errorResponse(res, 'ID number already registered', 400);
    errorResponse(res, err.message);
  }
};

// @desc    Get all customers (with optional search/filter)
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, branch } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    // Staff see only their branch
    if (req.user.role !== 'admin') filter.branch = req.user.branch;
    else if (branch) filter.branch = branch;

    if (search) {
      filter.$or = [
        { firstName:      { $regex: search, $options: 'i' } },
        { lastName:       { $regex: search, $options: 'i' } },
        { phone:          { $regex: search, $options: 'i' } },
        { customerNumber: { $regex: search, $options: 'i' } },
        { idNumber:       { $regex: search, $options: 'i' } },
      ];
    }

    const total     = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .populate('branch', 'name code')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    paginatedResponse(res, customers, total, page, limit);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('branch', 'name code')
      .populate('createdBy', 'name');
    if (!customer) return errorResponse(res, 'Customer not found', 404);
    successResponse(res, customer);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    // Protect sensitive fields
    delete req.body.customerNumber;
    delete req.body.createdBy;

    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!customer) return errorResponse(res, 'Customer not found', 404);
    successResponse(res, customer, 'Customer updated');
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Deactivate customer (soft delete)
// @route   DELETE /api/customers/:id
// @access  Admin
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!customer) return errorResponse(res, 'Customer not found', 404);
    successResponse(res, null, 'Customer deactivated');
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get customer accounts + loans summary
// @route   GET /api/customers/:id/summary
// @access  Private
exports.getCustomerSummary = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('branch', 'name code');
    if (!customer) return errorResponse(res, 'Customer not found', 404);

    const accounts = await Account.find({ customer: req.params.id });
    const loans    = await Loan.find({ customer: req.params.id });

    const totalSavings      = accounts.reduce((s, a) => s + a.balance, 0);
    const activeLoans       = loans.filter((l) => ['approved', 'disbursed'].includes(l.status));
    const totalOutstanding  = activeLoans.reduce((s, l) => s + l.outstandingBalance, 0);

    successResponse(res, {
      customer,
      accounts,
      loans,
      summary: {
        totalSavings,
        totalAccounts: accounts.length,
        totalLoans:    loans.length,
        activeLoans:   activeLoans.length,
        totalOutstanding,
      },
    });
  } catch (err) {
    errorResponse(res, err.message);
  }
};
