const AuditLog = require('../models/auditLog.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');

// @desc    Get audit logs
// @route   GET /api/audit
// @access  Admin
exports.getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, action, branch, startDate, endDate } = req.query;
    const skip   = (page - 1) * limit;
    const filter = {};

    if (userId) filter.user   = userId;
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (branch) filter.branch = branch;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate)   filter.createdAt.$lte = new Date(endDate);
    }

    const total = await AuditLog.countDocuments(filter);
    const logs  = await AuditLog.find(filter)
      .populate('user',   'name email role')
      .populate('branch', 'name code')
      .skip(skip)
      .limit(parseInt(limit))
      .sort('-createdAt');

    paginatedResponse(res, logs, total, page, limit);
  } catch (err) {
    errorResponse(res, err.message);
  }
};
