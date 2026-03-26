const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { processBillItems } = require('../utils/gstCalculator');
const logger = require('../utils/logger');

// POST /api/bills — Create a new bill
exports.createBill = async (req, res, next) => {
  try {
    const { items, customerName, customerPhone, paymentMode, billDiscountPercent, amountPaid, upiTransactionId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Bill must have at least one item.' });
    }

    // Fetch all products and validate stock
    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });

    const productMap = {};
    products.forEach(p => { productMap[p._id.toString()] = p; });

    // Build enriched items with product data
    const enrichedItems = [];
    const stockUpdates = [];

    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        return res.status(400).json({ success: false, message: `Product ${item.productId} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      enrichedItems.push({
        product: product._id,
        productName: product.name,
        barcode: product.barcode,
        category: product.category,
        quantity: item.quantity,
        unit: product.unit,
        mrp: product.mrp,
        sellingPrice: item.sellingPrice || product.sellingPrice,
        discountPercent: item.discountPercent || 0,
        gstRate: product.gstRate,
        priceIncludesGst: product.priceIncludesGst,
      });

      stockUpdates.push({ id: product._id, quantity: item.quantity });
    }

    // Calculate GST breakups
    const calculated = processBillItems(enrichedItems, billDiscountPercent || 0);

    // Handle customer
    let customerId = null;
    if (customerPhone) {
      let customer = await Customer.findOne({ phone: customerPhone });
      if (!customer) {
        customer = await Customer.create({ name: customerName, phone: customerPhone });
      }
      customerId = customer._id;
    }

    // Create the bill
    const bill = await Bill.create({
      items: calculated.items,
      customer: customerId,
      customerName,
      customerPhone,
      subtotal: calculated.subtotal,
      totalDiscount: calculated.totalItemDiscount,
      billDiscountPercent: billDiscountPercent || 0,
      billDiscountAmount: calculated.billDiscountAmount,
      totalCgst: calculated.totalCgst,
      totalSgst: calculated.totalSgst,
      totalGst: calculated.totalGst,
      grandTotal: calculated.grandTotal,
      roundOff: calculated.roundOff,
      paymentMode,
      amountPaid: amountPaid || calculated.grandTotal,
      changeReturned: Math.max(0, (amountPaid || calculated.grandTotal) - calculated.grandTotal),
      upiTransactionId,
      createdBy: req.user._id,
      staffName: req.user.name,
      storeGstin: process.env.STORE_GSTIN,
    });

    // Deduct stock for all items (bulk update)
    await Promise.all(
      stockUpdates.map(({ id, quantity }) =>
        Product.findByIdAndUpdate(id, { $inc: { stock: -quantity } })
      )
    );

    // Update customer stats
    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        $inc: { totalPurchases: 1, totalSpent: calculated.grandTotal },
        lastVisit: new Date(),
        $push: { bills: bill._id },
      });
    }

    logger.info(`Bill created: ${bill.billNumber} | ₹${bill.grandTotal} | ${paymentMode}`);

    res.status(201).json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

// GET /api/bills — List bills with filters and pagination
exports.getBills = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, paymentMode, status, search } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    if (paymentMode) filter.paymentMode = paymentMode;
    if (status) filter.status = status;
    if (search) filter.billNumber = { $regex: search, $options: 'i' };

    // Staff can only see their own bills
    if (req.user.role === 'staff') {
      filter.createdBy = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .populate('customer', 'name phone')
        .populate('createdBy', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit)),
      Bill.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: bills.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      bills,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bills/:id
exports.getBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('createdBy', 'name email');

    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

// POST /api/bills/:id/cancel
exports.cancelBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    if (bill.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Bill already cancelled.' });
    }

    bill.status = 'cancelled';
    bill.cancelReason = req.body.reason || 'No reason provided';
    await bill.save();

    // Restore stock
    await Promise.all(
      bill.items.map(item =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
      )
    );

    logger.info(`Bill cancelled: ${bill.billNumber}`);
    res.json({ success: true, message: 'Bill cancelled and stock restored', bill });
  } catch (error) {
    next(error);
  }
};
