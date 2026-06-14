const mongoose = require('mongoose');
const Loan     = require('../models/loan.model');
const Customer = require('../models/customer.model');
const notify   = require('../services/notification.service');
const { calculateLoanSchedule } = require('../utils/loan.utils');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

// @desc    Create loan application
// @route   POST /api/loans
// @access  Private
exports.createLoan = async (req, res) => {
  try {
    const { customerId, amount, interestRate, durationMonths, purpose } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) return errorResponse(res, 'Customer not found', 404);

    // Check for existing active loan
    const activeLoan = await Loan.findOne({
      customer: customerId,
      status:   { $in: ['pending', 'approved', 'disbursed'] },
    });
    if (activeLoan) return errorResponse(res, 'Customer already has an active loan', 400);

    const loan = await Loan.create({
      customer:       customerId,
      branch:         customer.branch,
      amount,
      interestRate,
      durationMonths,
      purpose,
      createdBy:      req.user._id,
    });

    successResponse(res, loan, 'Loan application submitted', 201);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private
exports.getLoans = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, branch, customerId } = req.query;
    const skip   = (page - 1) * limit;
    const filter = {};

    if (req.user.role !== 'admin') filter.branch = req.user.branch;
    else if (branch) filter.branch = branch;

    if (status)     filter.status   = status;
    if (customerId) filter.customer = customerId;

    const total = await Loan.countDocuments(filter);
    const loans = await Loan.find(filter)
      .populate('customer', 'firstName lastName customerNumber phone')
      .populate('branch',   'name code')
      .populate('approvedBy', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    paginatedResponse(res, loans, total, page, limit);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get single loan
// @route   GET /api/loans/:id
// @access  Private
exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('customer', 'firstName lastName customerNumber phone email')
      .populate('branch',   'name code')
      .populate('createdBy',  'name')
      .populate('approvedBy', 'name')
      .populate('rejectedBy', 'name');
    if (!loan) return errorResponse(res, 'Loan not found', 404);
    successResponse(res, loan);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Approve loan
// @route   PUT /api/loans/:id/approve
// @access  Admin
exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return errorResponse(res, 'Loan not found', 404);
    if (loan.status !== 'pending') return errorResponse(res, `Cannot approve a loan with status: ${loan.status}`, 400);

    // Calculate schedule on approval
    const schedule = calculateLoanSchedule(loan.amount, loan.interestRate, loan.durationMonths);

    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + loan.durationMonths);

    loan.status             = 'approved';
    loan.approvedAt         = new Date();
    loan.approvedBy         = req.user._id;
    loan.monthlyPayment     = schedule.monthlyPayment;
    loan.totalRepayable     = schedule.totalRepayable;
    loan.totalInterest      = schedule.totalInterest;
    loan.outstandingBalance = schedule.totalRepayable;
    loan.dueDate            = dueDate;
    await loan.save();

    const customer = await Customer.findById(loan.customer);
    if (customer) notify.loanApproved(customer, loan);

    successResponse(res, loan, 'Loan approved');
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Reject loan
// @route   PUT /api/loans/:id/reject
// @access  Admin
exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return errorResponse(res, 'Loan not found', 404);
    if (loan.status !== 'pending') return errorResponse(res, `Cannot reject a loan with status: ${loan.status}`, 400);

    loan.status          = 'rejected';
    loan.rejectedAt      = new Date();
    loan.rejectedBy      = req.user._id;
    loan.rejectionReason = req.body.reason || '';
    await loan.save();

    const customer = await Customer.findById(loan.customer);
    if (customer) notify.loanRejected(customer, loan);

    successResponse(res, loan, 'Loan rejected');
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Disburse loan (mark as disbursed)
// @route   PUT /api/loans/:id/disburse
// @access  Admin
exports.disburseLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return errorResponse(res, 'Loan not found', 404);
    if (loan.status !== 'approved') return errorResponse(res, 'Only approved loans can be disbursed', 400);

    loan.status      = 'disbursed';
    loan.disbursedAt = new Date();
    await loan.save();

    successResponse(res, loan, 'Loan disbursed');
  } catch (err) {
    errorResponse(res, err.message);
  }
};
