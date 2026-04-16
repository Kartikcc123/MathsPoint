const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['Notes', 'Assignment', 'Video', 'Link', 'Practice Set'], default: 'Notes' },
  moduleName: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('CourseMaterial', courseMaterialSchema);
