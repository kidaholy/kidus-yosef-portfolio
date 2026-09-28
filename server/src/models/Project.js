const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    num: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    tech: { type: String, required: true, trim: true },
    category: { type: String, default: 'MERN', trim: true },
    image: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
