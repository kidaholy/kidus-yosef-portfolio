const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 4000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
