const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  target: { type: String, enum: ['All', 'Student', 'Parent'], default: 'All' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If targeted to a specific student
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
