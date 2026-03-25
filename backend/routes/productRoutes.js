const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, adminOrAuthority } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getProducts)
  .post(protect, adminOrAuthority, createProduct);

router.route('/:id')
  .get(protect, getProductById)
  .put(protect, adminOrAuthority, updateProduct)
  .delete(protect, adminOrAuthority, deleteProduct);

module.exports = router;
