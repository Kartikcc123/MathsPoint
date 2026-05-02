const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  subject: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  program: { type: String, trim: true },
  status: {
    type: String,
    enum: ['New', 'Reviewed'],
    default: 'New',
  },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
