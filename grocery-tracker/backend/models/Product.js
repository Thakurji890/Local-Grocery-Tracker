const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  gstRate: { type: Number, enum: [0, 5, 12, 18], required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  barcode: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
