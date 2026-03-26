const Bill = require('../models/Bill');

// GET /api/reports/gstr1?month=2024-03
exports.getGSTR1 = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ success: false, message: 'month parameter required (YYYY-MM)' });

    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59);

    const bills = await Bill.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed',
    });

    // GSTR-1 Summary: Aggregate by GST rate
    const gstSummary = {};

    bills.forEach(bill => {
      bill.items.forEach(item => {
        const rate = item.gstRate;
        if (!gstSummary[rate]) {
          gstSummary[rate] = { gstRate: rate, taxableValue: 0, cgst: 0, sgst: 0, totalGst: 0, totalValue: 0 };
        }
        gstSummary[rate].taxableValue += item.baseAmount;
        gstSummary[rate].cgst += item.cgstAmount;
        gstSummary[rate].sgst += item.sgstAmount;
        gstSummary[rate].totalGst += item.gstAmount;
        gstSummary[rate].totalValue += item.totalAmount;
      });
    });

    if (req.query.format === 'csv') {
      // Generate GSTR-1 CSV
      let csv = 'Bill No,Date,Customer Name,Phone,GSTIN,Taxable Amount,CGST Rate,CGST Amount,SGST Rate,SGST Amount,Total GST,Grand Total,Payment Mode\n';

      bills.forEach(bill => {
        const date = bill.createdAt.toLocaleDateString('en-IN');
        csv += `${bill.billNumber},${date},${bill.customerName || 'Walk-in'},${bill.customerPhone || ''},${bill.storeGstin || ''},${bill.subtotal},${bill.totalCgst / bill.totalGst * bill.totalGst / 2 || 0},${bill.totalCgst},${bill.totalSgst / bill.totalGst * bill.totalGst / 2 || 0},${bill.totalSgst},${bill.totalGst},${bill.grandTotal},${bill.paymentMode}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=GSTR1_${month}.csv`);
      return res.send(csv);
    }

    res.json({
      success: true,
      month,
      totalBills: bills.length,
      totalRevenue: bills.reduce((s, b) => s + b.grandTotal, 0),
      totalGst: bills.reduce((s, b) => s + b.totalGst, 0),
      gstSummary: Object.values(gstSummary),
      bills: bills.map(b => ({
        billNumber: b.billNumber,
        date: b.createdAt,
        customerName: b.customerName || 'Walk-in',
        grandTotal: b.grandTotal,
        totalGst: b.totalGst,
        paymentMode: b.paymentMode,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/sales?startDate=&endDate=
exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { status: 'completed' };

    if (startDate) filter.createdAt = { $gte: new Date(startDate) };
    if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };

    const bills = await Bill.find(filter).sort('-createdAt');

    const totalRevenue = bills.reduce((s, b) => s + b.grandTotal, 0);
    const totalGst = bills.reduce((s, b) => s + b.totalGst, 0);
    const totalDiscount = bills.reduce((s, b) => s + (b.billDiscountAmount + b.totalDiscount), 0);

    res.json({ success: true, totalBills: bills.length, totalRevenue, totalGst, totalDiscount, bills });
  } catch (error) {
    next(error);
  }
};
