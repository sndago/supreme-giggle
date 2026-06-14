const Branch = require('../models/branch.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

// @desc    Create branch
// @route   POST /api/branches
// @access  Admin
exports.createBranch = async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    successResponse(res, branch, 'Branch created', 201);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private
exports.getBranches = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip  = (page - 1) * limit;
    const total = await Branch.countDocuments();
    const branches = await Branch.find()
      .populate('manager', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('name');
    paginatedResponse(res, branches, total, page, limit);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Private
exports.getBranch = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('manager', 'name email');
    if (!branch) return errorResponse(res, 'Branch not found', 404);
    successResponse(res, branch);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Admin
exports.updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!branch) return errorResponse(res, 'Branch not found', 404);
    successResponse(res, branch, 'Branch updated');
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Deactivate branch
// @route   DELETE /api/branches/:id
// @access  Admin
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!branch) return errorResponse(res, 'Branch not found', 404);
    successResponse(res, null, 'Branch deactivated');
  } catch (err) {
    errorResponse(res, err.message);
  }
};
