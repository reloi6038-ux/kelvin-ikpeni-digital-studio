// middleware/notFound.js
const path = require('path');

function notFound(req, res, next) {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API route not found' });
  }
  
  // For browser requests, send the branded 404 page if it exists.
  const page = path.join(__dirname, '..', 'public', '404.html');
  return res.status(404).sendFile(page, (err) => {
    if (err) return next(err); // Passes any file-read errors to the errorHandler
  });
}

module.exports = notFound;