const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Create new bill (POS Checkout)
// @route   POST /api/bills
// @access  Private (Staff/Admin)
exports.createBill = async (req, res) => {
  const { customerPhone, customerName, items, paymentMethod } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No items in the bill' });
  }

  try {
    let subTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let grandTotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product ${item.name} not found` });
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      // GST Calculation Logic
      const itemSubtotal = product.price * item.quantity;
      const gstAmount = (itemSubtotal * product.gstRate) / 100;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      const itemTotal = itemSubtotal + gstAmount;

      subTotal += itemSubtotal;
      cgstTotal += cgst;
      sgstTotal += sgst;
      grandTotal += itemTotal;

      processedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        gstRate: product.gstRate,
        cgst,
        sgst,
        total: itemTotal
      });

      product.stockQuantity -= item.quantity;
      await product.save();
    }

    let customerId = null;
    if (customerPhone) {
      let customer = await Customer.findOne({ phone: customerPhone });
      if (!customer) {
        customer = new Customer({ phone: customerPhone, name: customerName });
      }
      const savedCustomer = await customer.save();
      customerId = savedCustomer._id;
    }

    const billNumber = `INV-${Date.now()}`;
    const bill = new Bill({
      billNumber,
      cashier: req.user._id,
      customer: customerId,
      items: processedItems,
      subTotal,
      cgstTotal,
      sgstTotal,
      grandTotal,
      paymentMethod
    });

    const createdBill = await bill.save();

    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, { $push: { purchaseHistory: createdBill._id } });
    }

    res.status(201).json(createdBill);
  } catch (error) {
    res.status(500).json({ message: 'Error processing bill', error: error.message });
  }
};

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private (Admin/Authority)
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find({}).populate('cashier', 'name').populate('customer', 'name phone').sort('-createdAt');
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
