const mongoose = require('mongoose');

// Valid GST slabs in India
const GST_RATES = [0, 5, 12, 18, 28];

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Name too long'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['Grains & Pulses', 'Dairy', 'Beverages', 'Snacks', 'Spices', 'Oils & Ghee',
           'Personal Care', 'Cleaning', 'Vegetables', 'Fruits', 'Packaged Food', 'Other'],
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values (not all products have barcodes)
    trim: true,
  },
  mrp: {
    type: Number,
    required: [true, 'MRP is required'],
    min: [0, 'MRP cannot be negative'],
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Price cannot be negative'],
  },
  gstRate: {
    type: Number,
    required: true,
    enum: { values: GST_RATES, message: `GST rate must be one of: ${GST_RATES.join(', ')}` },
    default: 0,
  },
  // GST is inclusive in price for most kirana items
  priceIncludesGst: {
    type: Boolean,
    default: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'L', 'ml', 'pcs', 'pack', 'dozen', 'box'],
    default: 'pcs',
  },
  description: { type: String, maxlength: 500 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Virtual: is stock low?
productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold;
});

// Virtual: base price (price before GST for GST-inclusive items)
productSchema.virtual('basePrice').get(function () {
  if (this.priceIncludesGst && this.gstRate > 0) {
    return parseFloat((this.sellingPrice / (1 + this.gstRate / 100)).toFixed(2));
  }
  return this.sellingPrice;
});

// Indexes for fast search
productSchema.index({ name: 'text', barcode: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ isActive: 1 });

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
