const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      branch: user.branch,
    },
  });
};

module.exports = { generateToken, sendTokenResponse };
