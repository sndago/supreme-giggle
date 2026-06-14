const User = require('../models/user.model');
const { sendTokenResponse } = require('../utils/jwt.utils');
const { successResponse, errorResponse } = require('../utils/response.utils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Admin only
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, branch } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return errorResponse(res, 'Email already registered', 400);

    const user = await User.create({ name, email, password, role, branch });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return errorResponse(res, 'Please provide email and password', 400);

    const user = await User.findOne({ email }).select('+password').populate('branch', 'name code');
    if (!user || !(await user.matchPassword(password)))
      return errorResponse(res, 'Invalid credentials', 401);

    if (!user.isActive)
      return errorResponse(res, 'Account is deactivated. Contact admin.', 403);

    sendTokenResponse(user, 200, res);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('branch', 'name code');
    successResponse(res, user);
  } catch (err) {
    errorResponse(res, err.message);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword)))
      return errorResponse(res, 'Current password is incorrect', 400);

    user.password = newPassword;
    await user.save();
    successResponse(res, null, 'Password updated successfully');
  } catch (err) {
    errorResponse(res, err.message);
  }
};
