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

// A warm connection resolves instantly, so this only ever delays a request when
// the database is still connecting or unreachable. Keep it short: the routes
// serve the complete bundled profile / in-memory store on their own, so waiting
// longer buys nothing but latency (measured: production never reaches Atlas, so
// a long grace was ~1s of pure dead time on every cold start). The connect
// continues in the background either way and is picked up on later requests.
const CONNECT_GRACE_MS = 300;

const withGrace = (promise) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(resolve, CONNECT_GRACE_MS))]);

module.exports = async (req, res) => {
  await withGrace(ensureConn());
  return app(req, res);
};
