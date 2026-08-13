const router = require('express').Router();
const { getStats, getAllOrders, getOrderDetail, updateOrderStatus } = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware, adminOnly);
router.get('/stats', getStats);
router.get('/orders', getAllOrders);
router.get('/order/:id', getOrderDetail);
router.put('/order/:id/status', updateOrderStatus);

module.exports = router;