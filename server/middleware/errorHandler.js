import { env } from '../config/env.js';

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal Server Error',
  };

  if (env.nodeEnv !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
