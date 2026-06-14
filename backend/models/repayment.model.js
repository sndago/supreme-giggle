const mongoose = require('mongoose');

const repaymentSchema = new mongoose.Schema(
  {
    reference:  { type: String, unique: true },
    loan:       { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    customer:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    branch:     { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    amount:     { type: Number, required: true, min: 0.01 },
    principal:  { type: Number, required: true },   // portion covering principal
    interest:   { type: Number, required: true },   // portion covering interest
    penalty:    { type: Number, default: 0 },       // late payment penalty
    balanceBefore:    { type: Number, required: true },
    balanceAfter:     { type: Number, required: true },
    paymentMethod:    { type: String, enum: ['cash', 'bank_transfer', 'mobile_money'], default: 'cash' },
    isLate:           { type: Boolean, default: false },
    daysLate:         { type: Number, default: 0 },
    processedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

repaymentSchema.pre('save', async function () {
  if (!this.isNew) return;
  const count = await mongoose.model('Repayment').countDocuments();
  this.reference = `REP-${Date.now()}-${String(count + 1).padStart(5, '0')}`;
});

module.exports = mongoose.model('Repayment', repaymentSchema);
