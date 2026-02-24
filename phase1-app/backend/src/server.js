const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const analyticsRoutes = require('./routes/analytics');
const targetsRoutes = require('./routes/targets');
const lookalikeRoutes = require('./routes/lookalike');
const powerbiRoutes = require('./routes/powerbi');
const icpRoutes = require('./routes/icp');
const winbackRoutes = require('./routes/winback');
const enrichmentRoutes = require('./routes/enrichment');
const messagingRoutes = require('./routes/messaging');
const authRoutes = require('./routes/auth');
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5002;

app.disable('x-powered-by');

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5000',
  'http://localhost:5001',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

const envCors = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowAllCors = envCors.includes('*');
const allowedCorsOrigins = envCors.length ? envCors : DEFAULT_CORS_ORIGINS;

app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser clients (curl/postman) with no Origin header
    if (!origin) return cb(null, true);
    if (allowAllCors) return cb(null, true);
    if (allowedCorsOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Actor', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/targets', targetsRoutes);
app.use('/api/lookalike', lookalikeRoutes);
app.use('/api/powerbi', powerbiRoutes);
app.use('/api/icp', icpRoutes);
app.use('/api/winback', winbackRoutes);
app.use('/api/enrichment', enrichmentRoutes);
app.use('/api/messaging', messagingRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (String(err.message || '').startsWith('CORS blocked for origin:')) {
    return res.status(403).json({ error: 'CORS blocked', message: err.message });
  }
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on port ${PORT} (all interfaces)`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
});
