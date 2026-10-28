// middleware/auth.js
const jwt = require('jsonwebtoken');
const { sessionSecret } = require('../config/env');

exports.protect = (req, res, next) => {
  // Get token from HTTP-only cookie
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, sessionSecret);
    req.admin = decoded; // Add admin info to the request
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Session expired or invalid.' });
  }
};