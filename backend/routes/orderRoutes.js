const router = require('express').Router();
const { createOrder, getOrders, getOrder } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.post('/order', createOrder);
router.get('/orders', getOrders);
router.get('/order/:id', getOrder);

module.exports = router;