// clearAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');

const clearAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all documents in the adminusers collection
    const result = await mongoose.connection.db.collection('adminusers').deleteMany({});
    
    console.log(`🗑️ Deleted ${result.deletedCount} admin user(s).`);
    console.log('You can now register a fresh account.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearAdmin();