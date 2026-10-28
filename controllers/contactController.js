// controllers/contactController.js
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');

exports.submitContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;
    const ipHash = crypto.createHash('sha256').update(req.ip || 'unknown').digest('hex').slice(0, 16);

    const newMessage = await ContactMessage.create({
      name, email, subject, message, ipHash, userAgent: req.get('User-Agent') || 'Unknown',
    });

    res.status(201).json({ success: true, message: 'Message sent successfully!', data: { id: newMessage._id } });
  } catch (error) { next(error); }
};

// --- ADMIN INBOX FUNCTIONS ---

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) { next(error); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.status(200).json({ success: true, data: msg });
  } catch (error) { next(error); }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};