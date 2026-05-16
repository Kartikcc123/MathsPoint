const DeviceSession = require('../models/DeviceSession');
const { AppError, sendErrorResponse } = require('../utils/api');

const MAX_DEVICES = Number(process.env.MAX_DEVICES_PER_USER) || 2;

// @desc    Register a device session on login
// @route   POST /api/session/register
// @access  Private
const registerDevice = async (req, res) => {
  try {
    const { deviceId, deviceInfo } = req.body;
    const userId = req.user._id;

    if (!deviceId) {
      throw new AppError(400, 'Device ID is required.', { code: 'SESSION_MISSING_DEVICE_ID' });
    }

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';

    // Check if this device already has an active session
    let existingSession = await DeviceSession.findOne({
      user: userId,
      deviceId,
      isActive: true,
    });

    if (existingSession) {
      existingSession.lastActiveAt = new Date();
      existingSession.ipAddress = ipAddress;
      existingSession.deviceInfo = deviceInfo || existingSession.deviceInfo;
      await existingSession.save();

      return res.json({
        sessionToken: existingSession.sessionToken,
        message: 'Session refreshed.',
      });
    }

    // Count active sessions
    const activeSessions = await DeviceSession.find({ user: userId, isActive: true })
      .sort({ lastActiveAt: 1 });

    // If at max, terminate the oldest session
    if (activeSessions.length >= MAX_DEVICES) {
      const sessionsToKill = activeSessions.slice(0, activeSessions.length - MAX_DEVICES + 1);
      for (const session of sessionsToKill) {
        session.isActive = false;
        await session.save();
      }
    }

    // Create new session
    const sessionToken = DeviceSession.generateSessionToken();
    const newSession = await DeviceSession.create({
      user: userId,
      deviceId,
      deviceInfo: deviceInfo || 'Unknown device',
      ipAddress,
      sessionToken,
      lastActiveAt: new Date(),
    });

    res.status(201).json({
      sessionToken: newSession.sessionToken,
      message: 'Device registered.',
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to register device.');
  }
};

// @desc    Get active sessions for the current user
// @route   GET /api/session/active
// @access  Private
const getActiveSessions = async (req, res) => {
  try {
    const sessions = await DeviceSession.find({
      user: req.user._id,
      isActive: true,
    })
      .select('deviceId deviceInfo ipAddress lastActiveAt createdAt')
      .sort({ lastActiveAt: -1 });

    res.json({
      sessions,
      maxDevices: MAX_DEVICES,
    });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to load sessions.');
  }
};

// @desc    Terminate a specific session
// @route   DELETE /api/session/:sessionId
// @access  Private
const terminateSession = async (req, res) => {
  try {
    const session = await DeviceSession.findOne({
      _id: req.params.sessionId,
      user: req.user._id,
    });

    if (!session) {
      throw new AppError(404, 'Session not found.', { code: 'SESSION_NOT_FOUND' });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: 'Session terminated.' });
  } catch (error) {
    sendErrorResponse(res, error, 'Failed to terminate session.');
  }
};

// @desc    Validate session middleware (for lesson endpoints)
const validateSession = async (req, res, next) => {
  try {
    const sessionToken = req.headers['x-session-token'];

    // Session validation is optional — if no token, skip (for non-lesson routes)
    if (!sessionToken) {
      return next();
    }

    const session = await DeviceSession.findOne({
      sessionToken,
      user: req.user._id,
      isActive: true,
    });

    if (!session) {
      return res.status(401).json({
        message: 'Session expired or terminated. Please login again.',
        code: 'SESSION_INVALID',
      });
    }

    // Update last active
    session.lastActiveAt = new Date();
    await session.save();

    req.deviceSession = session;
    return next();
  } catch (error) {
    return next();
  }
};

// @desc    Cleanup stale sessions (inactive > 24h)
const cleanupStaleSessions = async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const result = await DeviceSession.updateMany(
    { isActive: true, lastActiveAt: { $lt: cutoff } },
    { $set: { isActive: false } }
  );
  return result.modifiedCount;
};

module.exports = {
  registerDevice,
  getActiveSessions,
  terminateSession,
  validateSession,
  cleanupStaleSessions,
};
