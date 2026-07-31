const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  materialId: {
    type: String, // Storing as String to accommodate various IDs (e.g., CourseMaterial _id or videoUrl)
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reports: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
