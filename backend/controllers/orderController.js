const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// POST /api/order
const createOrder = async (req, res, next) => {
  try {
    const { address, paymentMethod } = req.body;

    if (!address?.line1 || !address?.city || !address?.state || !address?.pincode) {
      return res.status(422).json({ error: { message: 'Please provide a complete address (line, city, state, pincode)', code: 'INCOMPLETE_ADDRESS' } });
    }
    if (!address.phone || !/^[0-9+\-\s]{10,15}$/.test(address.phone)) {
      return res.status(422).json({ error: { message: 'Please provide a valid phone number', code: 'INVALID_PHONE' } });
    }
    if (!['COD', 'UPI', 'Card'].includes(paymentMethod)) {
      return res.status(400).json({ error: { message: 'Please select a payment method', code: 'VALIDATION' } });
    }

    const cartItems = await Cart.find({ userId: req.user.userId }).populate('productId');
    if (cartItems.length === 0) {
      return res.status(400).json({ error: { message: 'Your cart is empty', code: 'EMPTY_CART' } });
    }

    // Re-validate stock and build snapshot line items. totalPrice computed server-side.
    const products = [];
    let totalPrice = 0;
    for (const line of cartItems) {
      const product = line.productId;
      if (!product) {
        await line.deleteOne();
        continue;
      }
      if (product.stock < line.quantity) {
        return res.status(400).json({
          error: { message: `"${product.name}" no longer has enough stock in-hand`, code: 'OUT_OF_STOCK' },
        });
      }
      products.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        quantity: line.quantity,
        price: product.price,
      });
      totalPrice += product.price * line.quantity;
    }

    if (products.length === 0) {
      return res.status(400).json({ error: { message: 'Your cart is empty', code: 'EMPTY_CART' } });
    }

    // Decrement stock atomically (guarded against negative stock).
    for (const line of cartItems) {
      const product = line.productId;
      await Product.updateOne({ _id: product._id, stock: { $gte: line.quantity } }, { $inc: { stock: -line.quantity } });
    }

    const order = await Order.create({
      userId: req.user.userId,
      products,
      address: {
        line1: address.line1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
      },
      paymentMethod,
      status: 'Pending',
      totalPrice,
    });

    await Cart.deleteMany({ userId: req.user.userId });

    res.status(201).json({
      orderId: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/order/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!order) return res.status(404).json({ error: { message: 'Order not found', code: 'NOT_FOUND' } });
    res.json(order);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: { message: 'Order not found', code: 'NOT_FOUND' } });
    next(err);
  }
};

module.exports = { createOrder, getOrders, getOrder };