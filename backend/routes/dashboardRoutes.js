const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController');
const { protect, adminOrAuthority } = require('../middlewares/authMiddleware');

router.get('/stats', protect, adminOrAuthority, getStats);

module.exports = router;
