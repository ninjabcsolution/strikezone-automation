const express = require('express');
const lookalikeGenerationService = require('../services/lookalikeGenerationService');
const icpProfileService = require('../services/icpProfileService');

const router = express.Router();

function getActor(req) {
  return req.header('X-Actor') || 'unknown';
}

// GET /api/lookalike/icp-profile
router.get('/icp-profile', async (req, res) => {
  try {
    const profile = await icpProfileService.getTop20Profile();
    res.json({ status: 'success', profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to build ICP profile', message: err.message });
  }
});

// POST /api/lookalike/generate
// Body: { q?: string, page?: number, perPage?: number }
router.post('/generate', async (req, res) => {
  try {
    const actor = getActor(req);
    const q = req.body?.q || undefined;
    const page = req.body?.page ? parseInt(req.body.page, 10) || 1 : 1;
    const perPage = req.body?.perPage ? Math.min(parseInt(req.body.perPage, 10) || 25, 100) : 25;

    const result = await lookalikeGenerationService.generateFromApollo({ q, page, perPage }, actor);
    res.json({ status: 'success', ...result });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: 'Failed to generate look-alikes', message: err.message });
  }
});

module.exports = router;
