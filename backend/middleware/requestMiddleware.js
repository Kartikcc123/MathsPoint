const { AppError } = require('../utils/api');

const attachRequestContext = (req, _res, next) => {
  const idempotencyKey = req.headers['idempotency-key'] || req.body?.clientRequestId || null;

  req.requestContext = {
    idempotencyKey: typeof idempotencyKey === 'string' ? idempotencyKey.trim() : null,
    receivedAt: new Date(),
  };

  next();
};

const requireJsonBody = (req, _res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') {
    return next();
  }

  if (!req.is('application/json') && !req.is('multipart/form-data')) {
    return next(new AppError(415, 'Unsupported content type.', { code: 'UNSUPPORTED_MEDIA_TYPE' }));
  }

  return next();
};

module.exports = {
  attachRequestContext,
  requireJsonBody,
};
