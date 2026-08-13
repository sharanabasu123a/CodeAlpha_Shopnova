const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [orderCount, revenue, todayOrders, userCount, productCount, lowStock, allOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      stats: {
        orderCount,
        revenue: revenue[0]?.total || 0,
        todayOrders,
        userCount,
        productCount,
        lowStock,
      },
      recentOrders: allOrders,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/orders?status=
const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    const orders = await Order.find(query).sort({ createdAt: -1 }).populate('userId', 'name email phone');
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/order/:id
const getOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email phone');
    if (!order) return res.status(404).json({ error: { message: 'Order not found', code: 'NOT_FOUND' } });
    res.json(order);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: { message: 'Order not found', code: 'NOT_FOUND' } });
    next(err);
  }
};

// PUT /api/admin/order/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: { message: 'Invalid status', code: 'VALIDATION' } });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: { message: 'Order not found', code: 'NOT_FOUND' } });
    res.json(order);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: { message: 'Order not found', code: 'NOT_FOUND' } });
    next(err);
  }
};

module.exports = { getStats, getAllOrders, getOrderDetail, updateOrderStatus };