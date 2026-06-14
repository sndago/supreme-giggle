const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    reference:  { type: String, unique: true },           // auto-generated
    account:    { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    customer:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    branch:     { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    type:       { type: String, enum: ['deposit', 'withdrawal'], required: true },
    amount:     { type: Number, required: true, min: 0.01 },
    balanceBefore: { type: Number, required: true },
    balanceAfter:  { type: Number, required: true },
    description: { type: String, trim: true },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate reference
transactionSchema.pre('save', async function () {
  if (!this.isNew) return;
  const count = await mongoose.model('Transaction').countDocuments();
  const prefix = this.type === 'deposit' ? 'DEP' : 'WDR';
  this.reference = `${prefix}-${Date.now()}-${String(count + 1).padStart(5, '0')}`;
});

module.exports = mongoose.model('Transaction', transactionSchema);
