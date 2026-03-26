const express = require('express');
const { createBill, getBills, getBill, cancelBill } = require('../controllers/billController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createBill);
router.get('/', getBills);
router.get('/:id', getBill);
router.post('/:id/cancel', authorize('admin', 'authority'), cancelBill);

module.exports = router;
