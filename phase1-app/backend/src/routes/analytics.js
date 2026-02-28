const express = require('express');
const router = express.Router();
const top20Service = require('../services/top20Service');

// Calculate customer metrics (Top 20% by margin)
router.post('/calculate', async (req, res) => {
  try {
    const stats = await top20Service.calculateCustomerMetrics();
    res.json({ status: 'success', message: 'Customer metrics calculated', stats });
  } catch (error) {
    console.error('Calculate metrics error:', error);
    res.status(500).json({ error: 'Failed to calculate metrics', message: error.message });
  }
});

// Calculate 3-Year CAGR for all customers
router.post('/calculate-cagr', async (req, res) => {
  try {
    const result = await top20Service.calculateCAGR();
    res.json({ 
      status: 'success', 
      message: 'CAGR calculated successfully',
      ...result
    });
  } catch (error) {
    console.error('Calculate CAGR error:', error);
    res.status(500).json({ error: 'Failed to calculate CAGR', message: error.message });
  }
});

// Calculate all metrics (Top 20% by margin + CAGR)
router.post('/calculate-all', async (req, res) => {
  try {
    const stats = await top20Service.calculateCustomerMetrics();
    const cagrResult = await top20Service.calculateCAGR();
    res.json({ 
      status: 'success', 
      message: 'All metrics calculated',
      stats,
      cagr: cagrResult
    });
  } catch (error) {
    console.error('Calculate all error:', error);
    res.status(500).json({ error: 'Failed to calculate metrics', message: error.message });
  }
});

// Get CAGR analysis data
router.get('/cagr-analysis', async (req, res) => {
  try {
    const topOnly = req.query.topOnly === 'true';
    const consistentOnly = req.query.consistentOnly === 'true';
    const limit = parseInt(req.query.limit) || 100;
    
    const data = await top20Service.getCAGRAnalysis({ topOnly, consistentOnly, limit });
    res.json({ status: 'success', ...data });
  } catch (error) {
    console.error('Get CAGR analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch CAGR analysis', message: error.message });
  }
});

// Get Top 20% vs 80% Comparison
router.get('/top20-comparison', async (req, res) => {
  try {
    const rankBy = req.query.rankBy || 'margin'; // 'margin' or 'cagr'
    const comparison = await top20Service.getTop20Comparison(rankBy);
    res.json({ status: 'success', ...comparison });
  } catch (error) {
    console.error('Get comparison error:', error);
    res.status(500).json({ error: 'Failed to fetch comparison', message: error.message });
  }
});

router.get('/top20', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 24;
    const customers = await top20Service.getTop20Customers(limit);
    const stats = await top20Service.getTop20Stats();
    res.json({ status: 'success', stats, customers });
  } catch (error) {
    console.error('Get Top 20% error:', error);
    res.status(500).json({ error: 'Failed to fetch Top 20%', message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await top20Service.getTop20Stats();
    res.json({ status: 'success', stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
  }
});

module.exports = router;
