const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    date: { type: String, default: '', trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: '', trim: true },
    image: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
