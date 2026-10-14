require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const portfolioRoutes = require('./routes/portfolio');
const messageRoutes = require('./routes/messages');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow configured client origin(s) + any same-origin request
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptionsDelegate = (req, cb) => {
  const options = { exposedHeaders: ['X-Store-Mode'] };
  const origin = req.headers.origin;
  // curl / serverless health checks send no Origin header
  if (!origin || origins.includes(origin)) {
    return cb(null, { ...options, origin: true });
  }
  // Same-origin requests (single-domain deploys, e.g. Vercel) are always allowed:
  // the Origin host matches the Host the request was sent to.
  try {
    if (req.headers.host && new URL(origin).host === req.headers.host) {
      return cb(null, { ...options, origin: true });
    }
  } catch {}
  // Not allowed: respond without CORS headers (browser will block)
  cb(null, { ...options, origin: false });
};

app.use(cors(corsOptionsDelegate));

app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// API routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/messages', messageRoutes);

// Serve the built React app in production (single-origin deploy)
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/build');
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

// Treat PORT=0/empty as unset so the API always lands on a real port
const PORT = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

// Only auto-start when run directly (not when imported by the seeder/tests)
if (require.main === module) {
  start();
}

module.exports = { app, start };
