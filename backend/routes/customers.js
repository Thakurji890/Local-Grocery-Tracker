const express = require('express');
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/customers — search by phone or name
router.get('/', async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { phone: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort('-lastVisit').skip(skip).limit(parseInt(limit)),
      Customer.countDocuments(filter),
    ]);
    res.json({ success: true, count: customers.length, total, customers });
  } catch (err) { next(err); }
});

// GET /api/customers/:id with bill history
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).populate({
      path: 'bills',
      select: 'billNumber grandTotal paymentMode createdAt status',
      options: { sort: { createdAt: -1 }, limit: 20 },
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, customer });
  } catch (err) { next(err); }
});

module.exports = router;
