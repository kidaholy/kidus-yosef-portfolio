const mongoose = require('mongoose');

const skillGroupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    items: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkillGroup', skillGroupSchema);
