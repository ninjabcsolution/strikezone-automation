const express = require('express');
const router = express.Router();
const top20Service = require('../services/top20Service');
const { optionalAuth, getUserIdFilter } = require('../middleware/auth');

// Apply optional auth to all routes - user_id will be used for data isolation
router.use(optionalAuth);

// Calculate customer metrics (Top 20% by margin) - filtered by user
router.post('/calculate', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const stats = await top20Service.calculateCustomerMetrics(userId);
    res.json({ status: 'success', message: 'Customer metrics calculated', stats, userId });
  } catch (error) {
    console.error('Calculate metrics error:', error);
    res.status(500).json({ error: 'Failed to calculate metrics', message: error.message });
  }
});

// Calculate 3-Year CAGR for all customers - filtered by user
router.post('/calculate-cagr', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const result = await top20Service.calculateCAGR(userId);
    res.json({ 
      status: 'success', 
      message: 'CAGR calculated successfully',
      ...result,
      userId
    });
  } catch (error) {
    console.error('Calculate CAGR error:', error);
    res.status(500).json({ error: 'Failed to calculate CAGR', message: error.message });
  }
});

// Calculate all metrics (Top 20% by margin + CAGR) - filtered by user
router.post('/calculate-all', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const stats = await top20Service.calculateCustomerMetrics(userId);
    const cagrResult = await top20Service.calculateCAGR(userId);
    res.json({ 
      status: 'success', 
      message: 'All metrics calculated',
      stats,
      cagr: cagrResult,
      userId
    });
  } catch (error) {
    console.error('Calculate all error:', error);
    res.status(500).json({ error: 'Failed to calculate metrics', message: error.message });
  }
});

// Get CAGR analysis data - filtered by user
router.get('/cagr-analysis', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const topOnly = req.query.topOnly === 'true';
    const consistentOnly = req.query.consistentOnly === 'true';
    const limit = parseInt(req.query.limit) || 100;
    
    const data = await top20Service.getCAGRAnalysis({ topOnly, consistentOnly, limit, userId });
    res.json({ status: 'success', ...data, userId });
  } catch (error) {
    console.error('Get CAGR analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch CAGR analysis', message: error.message });
  }
});

// Get Top 20% vs 80% Comparison - filtered by user
router.get('/top20-comparison', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const rankBy = req.query.rankBy || 'margin'; // 'margin' or 'cagr'
    const comparison = await top20Service.getTop20Comparison(rankBy, userId);
    res.json({ status: 'success', ...comparison, userId });
  } catch (error) {
    console.error('Get comparison error:', error);
    res.status(500).json({ error: 'Failed to fetch comparison', message: error.message });
  }
});

// Get Top 20% customers - filtered by user
router.get('/top20', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const limit = parseInt(req.query.limit) || 24;
    const customers = await top20Service.getTop20Customers(limit, userId);
    const stats = await top20Service.getTop20Stats(userId);
    res.json({ status: 'success', stats, customers, userId });
  } catch (error) {
    console.error('Get Top 20% error:', error);
    res.status(500).json({ error: 'Failed to fetch Top 20%', message: error.message });
  }
});

// Get stats - filtered by user
router.get('/stats', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const stats = await top20Service.getTop20Stats(userId);
    res.json({ status: 'success', stats, userId });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
  }
});

module.exports = router;
