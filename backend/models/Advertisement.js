const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: function() { return this.type === 'text-card'; },
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  buttonText: {
    type: String,
    trim: true,
  },
  redirectLink: {
    type: String,
    trim: true,
  },
  priority: {
    type: Number,
    default: 0, // Higher number = higher priority
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'scheduled'],
    default: 'active',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  type: {
    type: String,
    enum: ['image', 'text-card'],
    default: 'image',
  },
  backgroundColor: {
    type: String, // E.g. hex code or tailwind gradient class
    default: 'bg-gradient-to-r from-blue-500 to-purple-600',
  },
  originalImage: {
    type: String,
  },
  desktopImage: {
    type: String,
  },
  tabletImage: {
    type: String,
  },
  mobileImage: {
    type: String,
  },
  thumbnailImage: {
    type: String,
  },
  impressions: {
    type: Number,
    default: 0,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Advertisement', advertisementSchema);
