const express = require('express');
const router = express.Router();
const top20Service = require('../services/top20Service');

router.post('/calculate', async (req, res) => {
  try {
    const stats = await top20Service.calculateCustomerMetrics();
    res.json({ status: 'success', message: 'Customer metrics calculated', stats });
  } catch (error) {
    console.error('Calculate metrics error:', error);
    res.status(500).json({ error: 'Failed to calculate metrics', message: error.message });
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
