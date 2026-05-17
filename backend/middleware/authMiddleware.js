const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/api');

const protect = async (req, res, next) => {
  let token;

  // 1. Bearer token from Authorization header (normal API calls)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Token from query param (for embed/stream endpoints where headers can't be sent)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password').populate('course linkedStudents taughtCourses');

      if (!req.user) {
        return next(new AppError(401, 'Not authorized, user not found.', { code: 'AUTH_USER_NOT_FOUND' }));
      }

      return next();
    } catch (error) {
      return next(new AppError(401, 'Not authorized, token failed.', { code: 'AUTH_TOKEN_FAILED' }));
    }
  }

  return next(new AppError(401, 'Not authorized, no token.', { code: 'AUTH_TOKEN_MISSING' }));
};

const authorizeRoles = (...roles) => (req, _res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }

  return next(new AppError(403, 'You do not have permission to perform this action.', {
    code: 'AUTH_FORBIDDEN',
    details: { requiredRoles: roles },
  }));
};

const admin = authorizeRoles('admin');
const attendanceManager = authorizeRoles('admin', 'teacher');

module.exports = {
  protect,
  admin,
  attendanceManager,
  authorizeRoles,
};
