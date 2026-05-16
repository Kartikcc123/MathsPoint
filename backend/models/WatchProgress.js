const mongoose = require('mongoose');

const watchProgressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  lastWatchedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  watchDuration: { type: Number, default: 0 }, // total seconds watched
}, { timestamps: true });

// One progress record per student per lesson
watchProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });
watchProgressSchema.index({ student: 1, course: 1 });

module.exports = mongoose.model('WatchProgress', watchProgressSchema);
