const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  subject: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['Notes', 'Assignment', 'Video', 'PYQ'], default: 'Notes' },
  moduleName: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

courseMaterialSchema.index({ course: 1, createdAt: -1 });
courseMaterialSchema.index({ publishedBy: 1, createdAt: -1 });

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);
