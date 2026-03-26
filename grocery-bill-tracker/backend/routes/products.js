const express = require('express');
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getByBarcode, getCategories,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All product routes require auth

router.get('/categories', getCategories);
router.get('/barcode/:barcode', getByBarcode);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authorize('admin', 'staff'), createProduct);
router.put('/:id', authorize('admin', 'staff'), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

module.exports = router;
