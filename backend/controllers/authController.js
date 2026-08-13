const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET || 'dev_secret_change_me', {
    expiresIn: '7d',
  });

// POST /api/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: { message: 'All fields are required', code: 'VALIDATION' } });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: { message: 'Please provide a valid email', code: 'VALIDATION' } });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: { message: 'Password must be at least 8 characters', code: 'VALIDATION' } });
    }
    if (!/^[0-9+\-\s]{10,15}$/.test(phone)) {
      return res.status(400).json({ error: { message: 'Please provide a valid phone number', code: 'VALIDATION' } });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ error: { message: 'An account with this email already exists', code: 'CONFLICT' } });
    }

    const user = await User.create({ name, email: email.toLowerCase(), phone, password });
    const token = signToken(user._id, user.role);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

// POST /api/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: { message: 'Email and password are required', code: 'VALIDATION' } });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' } });
    }

    const token = signToken(user._id, user.role);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

// GET /api/profile
const profile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: { message: 'User not found', code: 'NOT_FOUND' } });
    res.json(user.toSafeJSON());
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: { message: 'User not found', code: 'NOT_FOUND' } });

    if (name) user.name = name;
    if (phone) {
      if (!/^[0-9+\-\s]{10,15}$/.test(phone)) {
        return res.status(400).json({ error: { message: 'Please provide a valid phone number', code: 'VALIDATION' } });
      }
      user.phone = phone;
    }
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: { message: 'Password must be at least 8 characters', code: 'VALIDATION' } });
      }
      user.password = password;
    }
    await user.save();
    res.json(user.toSafeJSON());
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, profile, updateProfile };