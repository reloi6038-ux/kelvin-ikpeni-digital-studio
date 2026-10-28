// routes/adminRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { login, register, logout, checkAuth } = require('../controllers/adminController');
const { getMessages, markAsRead, deleteMessage } = require('../controllers/contactController');
const { loginLimiter } = require('../middleware/security');
const { protect } = require('../middleware/auth');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ success: false, message: errors.array()[0].msg });
};

const authValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

router.post('/register', authValidation, validate, register);
router.post('/login', loginLimiter, authValidation, validate, login);
router.post('/logout', protect, logout);
router.get('/check', protect, checkAuth);

// Inbox Routes
router.get('/messages', protect, getMessages);
router.patch('/messages/:id', protect, markAsRead);
router.delete('/messages/:id', protect, deleteMessage);

module.exports = router;