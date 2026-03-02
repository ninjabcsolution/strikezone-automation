const express = require('express');
const winbackService = require('../services/winbackService');
const { optionalAuth, getUserIdFilter } = require('../middleware/auth');

const router = express.Router();

// Apply optional auth to all winback routes for user data isolation
router.use(optionalAuth);

function getActor(req) {
  return req.user?.email || req.header('X-Actor') || 'unknown';
}

// POST /api/winback/generate
// Body: { inactiveDays?: number, limit?: number }
router.post('/generate', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const inactiveDays = req.body?.inactiveDays ? parseInt(req.body.inactiveDays, 10) || 180 : 180;
    const limit = req.body?.limit ? Math.min(parseInt(req.body.limit, 10) || 200, 1000) : 200;
    const result = await winbackService.generate({ inactiveDays, limit }, actor, userId);
    res.json({ status: 'success', ...result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate win-back targets', message: err.message });
  }
});

module.exports = router;
