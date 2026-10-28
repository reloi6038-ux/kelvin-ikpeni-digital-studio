// middleware/errorHandler.js
const path = require('path');
const { isProd } = require('../config/env');

// Express requires 4 arguments for error handling middleware.
// Even if 'next' is unused, it MUST be in the signature.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const message = status === 500 && isProd
    ? 'Internal server error'
    : err.message || 'Something went wrong';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message);
    if (!isProd) console.error(err.stack);
  }

  // If it's an API route OR we're in development, return JSON
  if (req.originalUrl.startsWith('/api/') || !isProd) {
    return res.status(status).json({
      success: false,
      message,
      ...(isProd ? {} : { stack: err.stack }),
    });
  }

  // For browser requests in production, serve the branded 500 page
  if (status === 500) {
    return res.status(500).sendFile(path.join(__dirname, '..', 'public', '500.html'));
  }

  // Fallback for any other status code in production
  res.status(status).send(`<h1>Error ${status}</h1><p>${message}</p>`);
}

module.exports = errorHandler;