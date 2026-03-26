const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name too long'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    unique: true,
    sparse: true,
  },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  totalPurchases: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastVisit: { type: Date },
  bills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bill' }],
}, { timestamps: true });

customerSchema.index({ phone: 1 });
customerSchema.index({ name: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
