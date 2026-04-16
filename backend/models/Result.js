const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examName: { type: String, required: true },
  date: { type: Date, required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  subject: { type: String, required: true },
  remarks: { type: String },
  reportCardUrl: { type: String }, // URL to download the report card
  published: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
