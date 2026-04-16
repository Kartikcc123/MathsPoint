const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subjects: [{ type: String }],
  feeAmount: { type: Number, required: true },
  duration: { type: String }, // e.g., "1 Year", "6 Months"
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
