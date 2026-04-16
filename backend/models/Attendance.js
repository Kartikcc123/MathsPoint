const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  records: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
