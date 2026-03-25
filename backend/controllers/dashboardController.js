const Bill = require('../models/Bill');
const Product = require('../models/Product');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private (Admin/Authority)
exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allBills = await Bill.find({});
    
    const totalRevenue = allBills.reduce((acc, bill) => acc + bill.grandTotal, 0);
    const gstCollected = allBills.reduce((acc, bill) => acc + bill.cgstTotal + bill.sgstTotal, 0);
    const totalBills = allBills.length;
    const itemsSold = allBills.reduce((acc, bill) => acc + bill.items.reduce((sum, item) => sum + item.quantity, 0), 0);

    const allProducts = await Product.find({});
    const lowStockItems = allProducts.filter(p => p.stockQuantity < 10);

    res.json({
      totalRevenue,
      gstCollected,
      totalBills,
      itemsSold,
      lowStockItems
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
