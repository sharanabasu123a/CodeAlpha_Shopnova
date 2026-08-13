const Cart = require('../models/Cart');
const Product = require('../models/Product');

const expandCart = async (cartItems) => {
  const items = await Promise.all(
    cartItems.map(async (line) => {
      const product = await Product.findById(line.productId).lean();
      if (!product) return null;
      return {
        _id: line._id,
        productId: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        mrp: product.mrp,
        image: product.image,
        category: product.category,
        stock: product.stock,
        quantity: line.quantity,
        subtotal: product.price * line.quantity,
      };
    })
  );
  return items.filter(Boolean);
};

const cartResponse = async (userId) => {
  const items = await expandCart(await Cart.find({ userId }));
  const total = items.reduce((s, i) => s + i.subtotal, 0);
  return { items, total };
};

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    res.json(await cartResponse(req.user.userId));
  } catch (err) {
    next(err);
  }
};

// POST /api/cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ error: { message: 'productId is required', code: 'VALIDATION' } });

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ error: { message: 'Product not found', code: 'NOT_FOUND' } });
    if (product.stock === 0) {
      return res.status(400).json({ error: { message: 'This product is out of stock', code: 'OUT_OF_STOCK' } });
    }

    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
    const existing = await Cart.findOne({ userId: req.user.userId, productId });

    if (existing) {
      existing.quantity = Math.min(existing.quantity + qtyToAdd, product.stock);
      await existing.save();
    } else {
      await Cart.create({ userId: req.user.userId, productId, quantity: Math.min(qtyToAdd, product.stock) });
    }

    res.status(201).json(await cartResponse(req.user.userId));
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/:id  { quantity }
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const line = await Cart.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!line) return res.status(404).json({ error: { message: 'Cart item not found', code: 'NOT_FOUND' } });

    const product = await Product.findById(line.productId);
    const nextQty = parseInt(quantity, 10);
    if (isNaN(nextQty) || nextQty < 1) {
      return res.status(400).json({ error: { message: 'Quantity must be at least 1', code: 'VALIDATION' } });
    }
    line.quantity = Math.min(nextQty, product.stock);
    await line.save();
    res.json(await cartResponse(req.user.userId));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:id
const removeCartItem = async (req, res, next) => {
  try {
    const line = await Cart.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!line) return res.status(404).json({ error: { message: 'Cart item not found', code: 'NOT_FOUND' } });
    res.json(await cartResponse(req.user.userId));
  } catch (err) {
    next(err);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };