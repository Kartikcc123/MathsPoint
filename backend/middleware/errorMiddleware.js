const { AppError, sendErrorResponse } = require('../utils/api');

const notFound = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.originalUrl}`, { code: 'ROUTE_NOT_FOUND' }));
};

const errorHandler = (error, _req, res, _next) => {
  sendErrorResponse(res, error);
};

module.exports = {
  notFound,
  errorHandler,
};
