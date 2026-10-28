// controllers/adminController.js
const jwt = require('jsonwebtoken');
const { sessionSecret, isProd } = require('../config/env');
const AdminUser = require('../models/AdminUser');

// Helper to generate token and set cookie
const sendTokenResponse = (res, user) => {
  const token = jwt.sign({ id: user._id }, sessionSecret, { expiresIn: '1d' });

  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return res.status(200).json({
    success: true,
    message: 'Authenticated successfully',
    user: { email: user.email },
  });
};

// @desc    Register a new admin
// @route   POST /api/admin/register
exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await AdminUser.create({ email, password });
    sendTokenResponse(res, user);
  } catch (error) {
    next(error);
  }
};

// @desc    Login admin
// @route   POST /api/admin/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user - IMPORTANT: We must explicitly select '+password' because select is false by default
    const user = await AdminUser.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(res, user);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout admin
// @route   POST /api/admin/logout
exports.logout = (req, res) => {
  res.clearCookie('admin_token');
  res.status(200).json({ success: true, message: 'Logged out' });
};

// @desc    Check if admin is logged in
// @route   GET /api/admin/check
exports.checkAuth = (req, res) => {
  res.status(200).json({ success: true, data: req.admin });
};