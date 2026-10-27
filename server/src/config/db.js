const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('================================================================');
    console.error('[Database Error] Failed to connect to MongoDB!');
    console.error(`Attempted URI: ${uri}`);
    console.error(`Error Details: ${error.message}`);
    console.error('----------------------------------------------------------------');
    console.error('To resolve this issue:');
    console.error('1. If running locally, ensure MongoDB service is started:');
    console.error('   Windows: Run "net start MongoDB" in administrative command prompt');
    console.error('   Or start mongod manually: mongod --dbpath <data_folder>');
    console.error('2. If using MongoDB Atlas:');
    console.error('   Update MONGO_URI in server/.env with your cloud connection string:');
    console.error('   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/imovies');
    console.error('================================================================');
    // If not in test environment, we still let caller decide or exit
    if (process.env.NODE_ENV !== 'test') {
      // Do not silently proceed; throw or return null
      return null;
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed.');
  } catch (err) {
    console.error('[Database Error] Error closing MongoDB connection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
