const AuditLog = require('../models/auditLog.model');

// Automatically log POST/PUT/PATCH/DELETE actions
const auditLog = (action) => async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = async (body) => {
    if (res.statusCode < 400 && req.user) {
      try {
        await AuditLog.create({
          user:       req.user._id,
          action,
          resource:   req.originalUrl,
          resourceId: req.params.id || body?.data?._id || null,
          details:    { method: req.method, body: req.body },
          ip:         req.ip,
          branch:     req.user.branch,
        });
      } catch (err) {
        console.error('Audit log error:', err.message);
      }
    }
    originalJson(body);
  };

  next();
};

module.exports = auditLog;
