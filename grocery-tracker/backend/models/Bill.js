const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }, // price per unit BEFORE GST
  gstRate: { type: Number, required: true },
  cgst: { type: Number, required: true }, // computed cgst (amount, not percentage)
  sgst: { type: Number, required: true }, // computed sgst
  total: { type: Number, required: true } // item total including GST
});

const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [billItemSchema],
  subTotal: { type: Number, required: true }, // Total before GST
  cgstTotal: { type: Number, required: true },
  sgstTotal: { type: Number, required: true },
  grandTotal: { type: Number, required: true }, // Final paying amount
  paymentMethod: { type: String, enum: ['Cash', 'UPI'], default: 'Cash' }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
