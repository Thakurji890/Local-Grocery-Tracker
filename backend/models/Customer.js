const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String, required: true, unique: true },
  purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bill' }]
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
