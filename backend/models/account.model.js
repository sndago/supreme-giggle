const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, unique: true }, // auto-generated
    customer:  { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    branch:    { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    type:      { type: String, enum: ['savings', 'current'], default: 'savings' },
    balance:   { type: Number, default: 0, min: 0 },
    currency:  { type: String, default: 'GHS' },
    isActive:  { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate account number
accountSchema.pre('save', async function () {
  if (!this.isNew) return;
  const count = await mongoose.model('Account').countDocuments();
  this.accountNumber = `ACC-${String(count + 1).padStart(7, '0')}`;
});

module.exports = mongoose.model('Account', accountSchema);
