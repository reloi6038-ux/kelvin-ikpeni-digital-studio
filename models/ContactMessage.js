// models/ContactMessage.js
const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    ipHash: { type: String },
    userAgent: { type: String, default: '' },
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' }, // Inbox status
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);