#!/bin/bash

# Backend database config
cat > phase1-app/backend/src/config/database.js << 'DBEOF'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'strikezone_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = { pool };
DBEOF

# Backend server
cat > phase1-app/backend/src/server.js << 'SRVEOF'
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const analyticsRoutes = require('./routes/analytics');
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

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
  console.log(\`✓ Server running on port \${PORT}\`);
  console.log(\`✓ Health check: http://localhost:\${PORT}/api/health\`);
});
SRVEOF

echo "✓ Backend files created"
