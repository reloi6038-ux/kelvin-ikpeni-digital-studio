// server.js — Express entry point.
require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/database');
const { port, nodeEnv, isProd, validateEnv } = require('./config/env');
const { helmetMiddleware, sanitize } = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Validate environment variables before starting
validateEnv();

const app = express();

// Trust Render's reverse proxy so rate-limit & secure cookies work correctly.
app.set('trust proxy', 1);

// --- Global Middleware ---
app.use(helmetMiddleware);
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser()); // Required for Admin Auth
app.use(sanitize);
if (!isProd) app.use(morgan('dev'));

// --- Static Frontend Serving ---
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir, {
  extensions: ['html'],
  maxAge: isProd ? '7d' : 0,
}));

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', env: nodeEnv, timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// --- Error Handling (Must be the very last middleware) ---
app.use(notFound);
app.use(errorHandler);

// --- Database Connection & Server Start ---
if (require.main === module) {
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port} [${nodeEnv}]`);
    });
  });
}

module.exports = app;