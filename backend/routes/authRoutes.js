const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { register, login, profile, updateProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts, please try again later', code: 'RATE_LIMITED' } },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', authMiddleware, profile);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;