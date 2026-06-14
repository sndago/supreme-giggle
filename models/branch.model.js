const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true, unique: true },
    code:    { type: String, required: true, unique: true, uppercase: true },
    address: { type: String, trim: true },
    phone:   { type: String, trim: true },
    email:   { type: String, lowercase: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Branch', branchSchema);
