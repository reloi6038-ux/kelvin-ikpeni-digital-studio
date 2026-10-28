// config/database.js
// Handles the connection to MongoDB Atlas.
const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  try {
    if (!mongoUri) {
      throw new Error('MONGODB_URI is missing from environment variables.');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure so Render knows the deploy failed.
    process.exit(1);
  }
}

module.exports = connectDB;