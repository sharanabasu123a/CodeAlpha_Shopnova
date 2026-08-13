const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: { message: 'Not authorized — token missing', code: 'UNAUTHORIZED' } });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: { message: 'Not authorized — user no longer exists', code: 'UNAUTHORIZED' } });
    }
    req.user = { userId: user._id, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Session expired, please log in again', code: 'INVALID_TOKEN' } });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: { message: 'You don\'t have access to this page.', code: 'FORBIDDEN' } });
};

module.exports = { authMiddleware, adminOnly };