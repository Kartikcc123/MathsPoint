const mongoose = require('mongoose');

const freeStudyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  section: {
    type: String,
    enum: ['Reference Books', 'NCERT Solutions', 'Notes'],
    required: true,
  },
  classLabel: { type: String, default: '', trim: true },
  fileUrl: { type: String, required: true, trim: true },
  fileName: { type: String, required: true, trim: true },
  mimeType: { type: String, default: '', trim: true },
  publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

freeStudyMaterialSchema.index({ section: 1, createdAt: -1 });
freeStudyMaterialSchema.index({ publishedBy: 1, createdAt: -1 });

module.exports = mongoose.model('FreeStudyMaterial', freeStudyMaterialSchema);
