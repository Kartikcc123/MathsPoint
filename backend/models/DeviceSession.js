const mongoose = require('mongoose');
const crypto = require('crypto');

const deviceSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  deviceId: { type: String, required: true },
  deviceInfo: { type: String, default: 'Unknown device' },
  ipAddress: { type: String, default: '' },
  lastActiveAt: { type: Date, default: Date.now },
  sessionToken: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true });

deviceSessionSchema.index({ user: 1, isActive: 1 });
deviceSessionSchema.index({ user: 1, deviceId: 1 });

// Generate a unique session token
deviceSessionSchema.statics.generateSessionToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('DeviceSession', deviceSessionSchema);
