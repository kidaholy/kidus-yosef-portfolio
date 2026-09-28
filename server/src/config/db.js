const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kidus_portfolio';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    console.warn('⚠️  Running without persistence — the API will serve fallback content and accept messages in memory.');
    return null;
  }
};

module.exports = connectDB;
