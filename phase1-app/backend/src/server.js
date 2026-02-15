const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const analyticsRoutes = require('./routes/analytics');
const targetsRoutes = require('./routes/targets');
const lookalikeRoutes = require('./routes/lookalike');
const powerbiRoutes = require('./routes/powerbi');
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Actor'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/targets', targetsRoutes);
app.use('/api/lookalike', lookalikeRoutes);
app.use('/api/powerbi', powerbiRoutes);

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
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
});
