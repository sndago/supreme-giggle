const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customerNumber: { type: String, unique: true }, // auto-generated
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, required: true, trim: true },
    email:      { type: String, lowercase: true, trim: true },
    phone:      { type: String, required: true, trim: true },
    idType:     { type: String, enum: ['national_id', 'passport', 'drivers_license'], required: true },
    idNumber:   { type: String, required: true, unique: true },
    address:    { type: String, trim: true },
    dateOfBirth: { type: Date },
    branch:     { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive:   { type: Boolean, default: true },
    // Notification preferences
    notifyBySMS:   { type: Boolean, default: true },
    notifyByEmail: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate customer number before save
customerSchema.pre('save', async function () {
  if (!this.isNew) return;
  const count = await mongoose.model('Customer').countDocuments();
  this.customerNumber = `KNA-${String(count + 1).padStart(5, '0')}`;
});

// Virtual: full name
customerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

customerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Customer', customerSchema);
