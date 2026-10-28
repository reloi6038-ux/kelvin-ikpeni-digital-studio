// Centralizes environment access and validation.
// Fail fast if required variables are missing in production.
const requiredInProd = ['MONGODB_URI', 'SESSION_SECRET'];

function validateEnv() {
  if (process.env.NODE_ENV === 'production') {
    const missing = requiredInProd.filter((k) => !process.env[k]);
    if (missing.length) {
      throw new Error(`Missing required env vars: ${missing.join(', ')}`);
    }
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  mongoUri: process.env.MONGODB_URI || '',
  sessionSecret: process.env.SESSION_SECRET || 'insecure-dev-secret',
  siteBaseUrl: process.env.SITE_BASE_URL || 'http://localhost:3000',
  validateEnv,
};