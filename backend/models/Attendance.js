const mongoose = require('mongoose');
const { attendanceDateToUtcDate, normalizeAttendanceDateInput } = require('../utils/date');

const attendanceSchema = new mongoose.Schema({
  attendanceDate: { type: String, required: true },
  date: { type: Date, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  records: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
  }],
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  correctionReason: { type: String, trim: true, default: '' },
  revision: { type: Number, default: 1 },
  lastRequestId: { type: String, trim: true },
  lastPayloadHash: { type: String, trim: true },
  auditLog: [{
    action: { type: String, enum: ['created', 'updated'], required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, default: Date.now },
    correctionReason: { type: String, trim: true, default: '' },
    requestId: { type: String, trim: true },
    payloadHash: { type: String, trim: true },
  }],
}, { timestamps: true });

attendanceSchema.pre('validate', function (next) {
  const normalized = normalizeAttendanceDateInput(this.attendanceDate || this.date);
  if (!normalized) {
    return next(new Error('Invalid attendance date.'));
  }

  this.attendanceDate = normalized;
  this.date = attendanceDateToUtcDate(normalized);
  return next();
});

attendanceSchema.index({ course: 1, attendanceDate: 1 }, { unique: true });
attendanceSchema.index({ course: 1, date: -1 });
attendanceSchema.index({ 'records.studentId': 1, attendanceDate: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
