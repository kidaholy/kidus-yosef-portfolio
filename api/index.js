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
        console.error(`MongoDB connect failed: ${err.message}`);
        connPromise = null; // allow retry on the next invocation
      });
  }
  return connPromise;
};

// A warm connection resolves instantly, so this only ever delays a genuine cold
// start — and never by more than a moment. Routes fall back to the bundled
// profile / in-memory store, so the first response is never held hostage to a
// slow database (which was the cause of a multi-second empty first paint).
const CONNECT_GRACE_MS = 1200;

const withGrace = (promise) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(resolve, CONNECT_GRACE_MS))]);

module.exports = async (req, res) => {
  await withGrace(ensureConn());
  return app(req, res);
};
