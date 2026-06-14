const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action:     { type: String, required: true },
    resource:   { type: String, required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    details:    { type: mongoose.Schema.Types.Mixed },
    ip:         { type: String },
    branch:     { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  },
  { timestamps: true }
);

// Audit logs are read-only — block updates and deletes
auditLogSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany'], function () {
  throw new Error('Audit logs are immutable');
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
