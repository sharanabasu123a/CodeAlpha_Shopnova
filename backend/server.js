require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const { seed } = require('./utils/seed');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
  })
);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Local image uploads (used when Cloudinary is not configured or as fallback)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', uploadRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let memoryUsed = false;

const start = async () => {
  const { memory } = await connectDB();
  memoryUsed = memory;

  if (memory || process.env.SEED_ON_START === 'true') {
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[seed] Empty database — seeding sample catalog + demo accounts...');
      await seed();
    } else {
      console.log(`[seed] Database already has ${count} products — skipping.`);
    }
  }

  app.listen(PORT, () => {
    console.log(`[server] Shop Nova API running on http://localhost:${PORT}`);
    if (memoryUsed) {
      console.log('[server] Running with an in-memory database (data resets on restart).');
    }
  });
};

start().catch((err) => {
  console.error('[server] Failed to start:', err.message);
  process.exit(1);
});