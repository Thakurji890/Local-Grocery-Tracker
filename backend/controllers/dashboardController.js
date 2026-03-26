const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's stats
    const [todayBills, monthBills, totalProducts, lowStockProducts, totalCustomers] = await Promise.all([
      Bill.find({ createdAt: { $gte: startOfDay, $lte: endOfDay }, status: 'completed' }),
      Bill.find({ createdAt: { $gte: startOfMonth }, status: 'completed' }),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
      Customer.countDocuments(),
    ]);

    const todayRevenue = todayBills.reduce((s, b) => s + b.grandTotal, 0);
    const todayGst = todayBills.reduce((s, b) => s + b.totalGst, 0);
    const todayItemsSold = todayBills.reduce((s, b) => s + b.items.reduce((is, i) => is + i.quantity, 0), 0);

    const monthRevenue = monthBills.reduce((s, b) => s + b.grandTotal, 0);
    const monthGst = monthBills.reduce((s, b) => s + b.totalGst, 0);

    // Revenue trend for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      last7Days.push({ start, end, label: start.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }) });
    }

    const revenueData = await Promise.all(
      last7Days.map(async ({ start, end, label }) => {
        const bills = await Bill.find({ createdAt: { $gte: start, $lte: end }, status: 'completed' });
        return {
          date: label,
          revenue: bills.reduce((s, b) => s + b.grandTotal, 0),
          bills: bills.length,
          gst: bills.reduce((s, b) => s + b.totalGst, 0),
        };
      })
    );

    // Payment mode breakdown (today)
    const paymentBreakdown = todayBills.reduce((acc, bill) => {
      acc[bill.paymentMode] = (acc[bill.paymentMode] || 0) + bill.grandTotal;
      return acc;
    }, {});

    // Top selling products (this month)
    const topProducts = await Bill.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: 'completed' } },
      { $unwind: '$items' },
      { $group: { _id: '$items.productName', totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.totalAmount' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      today: {
        bills: todayBills.length,
        revenue: parseFloat(todayRevenue.toFixed(2)),
        gstCollected: parseFloat(todayGst.toFixed(2)),
        itemsSold: todayItemsSold,
      },
      month: {
        bills: monthBills.length,
        revenue: parseFloat(monthRevenue.toFixed(2)),
        gstCollected: parseFloat(monthGst.toFixed(2)),
      },
      inventory: { totalProducts, lowStockProducts },
      totalCustomers,
      revenueData,
      paymentBreakdown,
      topProducts,
    });
  } catch (error) {
    next(error);
  }
};
