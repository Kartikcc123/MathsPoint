const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Partial'], default: 'Unpaid' },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  month: { type: String, required: true }, // e.g., "January 2024"
  receiptUrl: { type: String },
  paymentMethod: { type: String, enum: ['UPI', 'Net Banking'] },
  paymentReference: { type: String, trim: true },
  paymentNote: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
