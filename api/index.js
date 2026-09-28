// Vercel serverless entry — reuses the existing Express app.
// Database connection is established on cold start and cached across
// invocations (standard mongoose serverless pattern).
require('dotenv').config();

const mongoose = require('mongoose');
const { app } = require('../server/src/server');

let connPromise = null;

const ensureConn = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connPromise) {
    connPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        connPromise = null; // allow retry on next invocation
        throw err;
      });
  }
  return connPromise;
};

module.exports = async (req, res) => {
  try {
    await ensureConn();
  } catch (err) {
    console.error(`MongoDB connect failed: ${err.message}`);
    // App still responds — routes fall back to bundled content / memory store
  }
  return app(req, res);
};
