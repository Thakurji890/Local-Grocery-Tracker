const express = require('express');
const { getGSTR1, getSalesReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.use(authorize('admin', 'authority'));

router.get('/gstr1', getGSTR1);
router.get('/sales', getSalesReport);

module.exports = router;
