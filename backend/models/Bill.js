const mongoose = require('mongoose');

// Individual line item in a bill
const billItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true }, // Snapshot at time of billing
  barcode: { type: String },
  category: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true }, // Per unit selling price
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  discountAmount: { type: Number, default: 0 },
  gstRate: { type: Number, required: true },    // e.g. 18 (for 18%)
  cgstRate: { type: Number },                    // Half of gstRate
  sgstRate: { type: Number },                    // Half of gstRate
  baseAmount: { type: Number, required: true },  // Price before GST
  gstAmount: { type: Number, required: true },
  cgstAmount: { type: Number },
  sgstAmount: { type: Number },
  totalAmount: { type: Number, required: true }, // Final line total
}, { _id: false });

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    unique: true,
    required: true,
  },
  items: [billItemSchema],
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, trim: true },
  customerPhone: { type: String, trim: true },

  // Totals
  subtotal: { type: Number, required: true },         // Sum of base amounts
  totalDiscount: { type: Number, default: 0 },
  billDiscountPercent: { type: Number, default: 0 },  // Overall bill discount
  billDiscountAmount: { type: Number, default: 0 },
  totalCgst: { type: Number, default: 0 },
  totalSgst: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },       // Final amount to pay
  roundOff: { type: Number, default: 0 },

  // Payment
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'card', 'credit'],
    required: true,
  },
  amountPaid: { type: Number },
  changeReturned: { type: Number, default: 0 },
  upiTransactionId: { type: String },

  // Status
  status: {
    type: String,
    enum: ['completed', 'cancelled', 'refunded'],
    default: 'completed',
  },
  cancelReason: { type: String },

  // Staff
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staffName: { type: String },

  // Store GSTIN snapshot
  storeGstin: { type: String },

  // Receipt sent?
  receiptSentWhatsapp: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-generate bill number: BILL-YYYYMMDD-XXXX
billSchema.pre('validate', async function (next) {
  if (!this.billNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Bill').countDocuments();
    this.billNumber = `BILL-${dateStr}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes for queries and reports
billSchema.index({ createdAt: -1 });
billSchema.index({ billNumber: 1 });
billSchema.index({ customer: 1 });
billSchema.index({ 'createdBy': 1 });
billSchema.index({ status: 1 });
billSchema.index({ paymentMode: 1 });

module.exports = mongoose.model('Bill', billSchema);
