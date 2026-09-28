const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    period: { type: String, required: true, trim: true },
    location: { type: String, default: 'Addis Ababa, Ethiopia', trim: true },
    points: { type: [String], default: [] },
    link: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Experience', experienceSchema);
