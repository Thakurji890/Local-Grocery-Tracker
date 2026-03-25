const Bill = require('../models/Bill');
const Product = require('../models/Product');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Admin/Authority)
exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const billsToday = await Bill.find({ createdAt: { $gte: today } });
    
    const todaysRevenue = billsToday.reduce((acc, bill) => acc + bill.grandTotal, 0);
    const todaysGST = billsToday.reduce((acc, bill) => acc + bill.cgstTotal + bill.sgstTotal, 0);
    const totalBillsToday = billsToday.length;

    const allProducts = await Product.find({});
    const lowStockItems = allProducts.filter(p => p.stockQuantity < 10).length;

    res.json({
      todaysRevenue,
      todaysGST,
      totalBillsToday,
      lowStockItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
