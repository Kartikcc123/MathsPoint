const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subjects: [{ type: String }],
  feeAmount: { type: Number, required: true },
  duration: { type: String },
  thumbnail: { type: String },
  chapters: {
    type: Map,
    of: [String],
    default: () => new Map(),
  },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);