const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  subject: { type: String, default: '' },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  moduleTitle: { type: String, default: '', trim: true },
  order: { type: Number, default: 0 },
  encryptedVideoId: { type: String, required: true },
  videoIV: { type: String, required: true },
  duration: { type: Number, default: 0 }, // seconds
  thumbnail: { type: String, default: '' },
  isPublished: { type: Boolean, default: false },
  isFree: { type: Boolean, default: false },
}, { timestamps: true });

lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ course: 1, moduleTitle: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
