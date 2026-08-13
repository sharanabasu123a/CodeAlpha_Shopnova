const Product = require('../models/Product');
const User = require('../models/User');

const SORT_MAP = {
  relevance: { createdAt: -1 },
  popularity: { rating: -1, numReviews: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating: { rating: -1 },
  newest: { createdAt: -1 },
};

// GET /api/products?search=&category=&minPrice=&maxPrice=&brand=&minRating=&discount=&sort=&page=&limit=
const getProducts = async (req, res, next) => {
  try {
    const {
      search, category, minPrice, maxPrice, brand, minRating, discount,
      sort = 'relevance', page = 1, limit = 16,
    } = req.query;

    const query = {};

    if (category && category !== 'All') query.category = category;
    if (search) {
      const terms = search.trim();
      query.$or = [
        { name: { $regex: terms, $options: 'i' } },
        { description: { $regex: terms, $options: 'i' } },
        { brand: { $regex: terms, $options: 'i' } },
      ];
    }

    // price range
    if (minPrice !== undefined && minPrice !== '') query.price = { $gte: Number(minPrice) };
    if (maxPrice !== undefined && maxPrice !== '') {
      query.price = { ...(query.price || {}), $lte: Number(maxPrice) };
    }

    // brand multi-select (comma separated)
    if (brand) {
      const brands = String(brand).split(',').filter(Boolean);
      if (brands.length) query.brand = { $in: brands };
    }

    // minimum customer rating
    if (minRating) query.rating = { $gte: Number(minRating) };

    // minimum discount %
    if (discount) {
      const d = Number(discount);
      query.$expr = {
        $and: [
          { $ne: ['$mrp', null] },
          { $ne: ['$mrp', 0] },
          { $gte: [{ $subtract: [100, { $multiply: [{ $divide: ['$price', '$mrp'] }, 100] }] }, d] },
        ],
      };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10) || 16));
    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    const products = await Product.find(query)
      .sort(SORT_MAP[sort] || SORT_MAP.relevance)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ products, page: pageNum, totalPages, totalCount, limit: limitNum, sort });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/filters?category=&search=  -> brands, price bounds, maxDiscount
const getFilters = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const match = {};
    if (category && category !== 'All') match.category = category;
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const agg = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' },
          brands: { $addToSet: '$brand' },
        },
      },
    ]);

    const brands = await Product.aggregate([
      { $match: match },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      brands: brands.map((b) => ({ name: b._id, count: b.count })),
      priceBounds: {
        min: Math.floor((agg[0]?.min || 0) / 100) * 100,
        max: Math.ceil(((agg[0]?.max || 0) + 1) / 100) * 100,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/product/:id
const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');
    if (!product) return res.status(404).json({ error: { message: 'Product not found', code: 'NOT_FOUND' } });
    res.json(product);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: { message: 'Product not found', code: 'NOT_FOUND' } });
    }
    next(err);
  }
};

// GET /api/products/suggest?q=  -> lightweight autocomplete for the search bar
const getSuggestions = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json({ suggestions: [] });
    const products = await Product.find({
      name: { $regex: q, $options: 'i' },
    })
      .sort({ numReviews: -1, rating: -1 })
      .limit(8)
      .select('name brand price mrp image category rating numReviews');
    res.json({
      suggestions: products.map((p) => ({
        _id: p._id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        mrp: p.mrp,
        image: p.image,
        category: p.category,
        rating: p.rating,
        numReviews: p.numReviews,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/featured
const getFeatured = async (req, res, next) => {
  try {
    const products = await Product.find({ stock: { $gt: 0 } }).sort({ rating: -1 }).limit(8);
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = [
      { name: 'Electronics', icon: 'device' },
      { name: 'Fashion', icon: 'shirt' },
      { name: 'Shoes', icon: 'shoe' },
      { name: 'Watches', icon: 'watch' },
      { name: 'Gaming', icon: 'gamepad' },
    ];
    const counts = await Product.aggregate([{ $group: { _id: '$category', c: { $sum: 1 } } }]);
    const map = {};
    counts.forEach((x) => (map[x._id] = x.c));
    res.json({ categories: categories.map((c) => ({ ...c, count: map[c.name] || 0 })) });
  } catch (err) {
    next(err);
  }
};

const validateProductBody = (body) => {
  const { name, brand, price, mrp, description, category, stock, image } = body;
  if (!name || price === undefined || !description || !category || !image) {
    return 'name, price, description, category and image are required';
  }
  if (isNaN(price) || Number(price) <= 0) return 'Price must be greater than 0';
  if (isNaN(stock) || Number(stock) < 0) return 'Stock must be 0 or more';
  if (mrp !== undefined && (isNaN(mrp) || Number(mrp) < Number(price))) {
    return 'MRP must be a number greater than or equal to price';
  }
  return null;
};

const normalizeProductBody = (body) => {
  const price = Number(body.price);
  const mrp = body.mrp !== undefined && body.mrp !== '' ? Number(body.mrp) : Math.round(price * 1.35);
  return {
    name: body.name.trim(),
    brand: (body.brand || 'Shop Nova').trim(),
    price,
    mrp,
    description: body.description.trim(),
    category: body.category,
    stock: Number(body.stock || 0),
    image: body.image.trim(),
    gallery: Array.isArray(body.gallery) && body.gallery.length ? body.gallery : [body.image.trim()],
    rating: body.rating !== undefined ? Number(body.rating) : 0,
    highlights: Array.isArray(body.highlights) ? body.highlights : [],
    specs: Array.isArray(body.specs) ? body.specs : [],
    seller: (body.seller || 'ShopNovaRetail').trim(),
    offers: Array.isArray(body.offers) ? body.offers : [],
  };
};

// POST /api/product (admin)
const createProduct = async (req, res, next) => {
  try {
    const errMsg = validateProductBody(req.body);
    if (errMsg) return res.status(400).json({ error: { message: errMsg, code: 'VALIDATION' } });
    const product = await Product.create(normalizeProductBody(req.body));
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/product/:id (admin)
const updateProduct = async (req, res, next) => {
  try {
    const errMsg = validateProductBody(req.body);
    if (errMsg) return res.status(400).json({ error: { message: errMsg, code: 'VALIDATION' } });
    const product = await Product.findByIdAndUpdate(req.params.id, normalizeProductBody(req.body), {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: { message: 'Product not found', code: 'NOT_FOUND' } });
    res.json(product);
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: { message: 'Product not found', code: 'NOT_FOUND' } });
    next(err);
  }
};

// DELETE /api/product/:id (admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: { message: 'Product not found', code: 'NOT_FOUND' } });
    res.status(204).end();
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ error: { message: 'Product not found', code: 'NOT_FOUND' } });
    next(err);
  }
};

// POST /api/product/:id/review
const addReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: { message: 'Rating must be between 1 and 5', code: 'VALIDATION' } });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: { message: 'Product not found', code: 'NOT_FOUND' } });

    const user = await User.findById(req.user.userId);
    const existing = product.reviews.find((r) => r.user && String(r.user) === String(req.user.userId));
    if (existing) {
      existing.rating = Number(rating);
      existing.title = title || existing.title;
      existing.comment = comment || existing.comment;
    } else {
      product.reviews.push({
        user: req.user.userId,
        name: user.name,
        rating: Number(rating),
        title: title || '',
        comment: comment || '',
      });
    }

    product.numReviews = product.reviews.length;
    product.rating = Math.round((product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length) * 10) / 10;
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts, getFilters, getSuggestions, getProduct, getFeatured, getCategories,
  createProduct, updateProduct, deleteProduct, addReview,
};