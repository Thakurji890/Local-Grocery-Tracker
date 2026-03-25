const express = require('express');
const router = express.Router();
const { createBill, getBills } = require('../controllers/billController');
const { protect, adminOrAuthority } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createBill)
  .get(protect, adminOrAuthority, getBills);

module.exports = router;
