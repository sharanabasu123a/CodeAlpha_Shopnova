const router = require('express').Router();
const {
  getProducts,
  getFilters,
  getSuggestions,
  getProduct,
  getFeatured,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} = require('../controllers/productController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/products', getProducts);
router.get('/products/suggest', getSuggestions);
router.get('/products/filters', getFilters);
router.get('/products/featured', getFeatured);
router.get('/products/categories', getCategories);
router.get('/product/:id', getProduct);
router.post('/product', authMiddleware, adminOnly, createProduct);
router.put('/product/:id', authMiddleware, adminOnly, updateProduct);
router.delete('/product/:id', authMiddleware, adminOnly, deleteProduct);
router.post('/product/:id/review', authMiddleware, addReview);

module.exports = router;