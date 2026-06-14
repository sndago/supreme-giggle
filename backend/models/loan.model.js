const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    loanNumber:   { type: String, unique: true },
    customer:     { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    branch:       { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    amount:       { type: Number, required: true, min: 1 },
    interestRate: { type: Number, required: true, min: 0 },  // annual %
    durationMonths: { type: Number, required: true, min: 1 },
    purpose:      { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'disbursed', 'closed'],
      default: 'pending',
    },
    // Calculated on approval
    monthlyPayment:  { type: Number },
    totalRepayable:  { type: Number },
    totalInterest:   { type: Number },
    outstandingBalance: { type: Number, default: 0 },
    // Dates
    approvedAt:  { type: Date },
    rejectedAt:  { type: Date },
    disbursedAt: { type: Date },
    dueDate:     { type: Date },
    closedAt:    { type: Date },
    // Staff
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// Auto-generate loan number
loanSchema.pre('save', async function () {
  if (!this.isNew) return;
  const count = await mongoose.model('Loan').countDocuments();
  this.loanNumber = `LN-${Date.now()}-${String(count + 1).padStart(5, '0')}`;
});

module.exports = mongoose.model('Loan', loanSchema);
