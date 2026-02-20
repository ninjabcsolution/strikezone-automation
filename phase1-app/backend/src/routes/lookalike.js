const express = require('express');
const lookalikeGenerationService = require('../services/lookalikeGenerationService');
const icpProfileService = require('../services/icpProfileService');

const router = express.Router();

function getActor(req) {
  return req.header('X-Actor') || 'unknown';
}

// GET /api/lookalike/providers - List available lookalike providers
router.get('/providers', (req, res) => {
  const available = lookalikeGenerationService.getAvailableProviders();
  const defaultProvider = lookalikeGenerationService.getDefaultProvider();
  res.json({
    status: 'success',
    providers: available,
    default: defaultProvider,
    descriptions: {
      zoominfo: 'AI-powered lookalike modeling + intent data + technographics (recommended)',
      sixsense: 'Predictive analytics + buying stage signals + intent keywords',
      apollo: 'Basic firmographic search (limited to company attributes)',
    },
  });
});

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
// Body: { provider?: string, filters?: object, page?: number, perPage?: number, useIntent?: boolean }
// 
// Provider options: 'zoominfo', 'sixsense', 'apollo' (auto-selects best if not specified)
// 
// filters for zoominfo/sixsense:
//   - industries: string[]
//   - employeeRanges: string[] (e.g., ['50-200', '200-500'])
//   - revenueRanges: string[] (e.g., ['10M-50M', '50M-100M'])
//   - states: string[]
//   - countries: string[]
//   
// filters for intent-based (useIntent: true):
//   - topics/keywords: string[] (intent topics to track)
//   - minIntentScore: number (default 70)
//   - minBuyingStage: string ('Awareness', 'Consideration', 'Decision', 'Purchase')
router.post('/generate', async (req, res) => {
  try {
    const actor = getActor(req);
    const {
      provider,
      filters = {},
      page = 1,
      perPage = 25,
      useIntent = false,
      q, // Legacy Apollo search term
    } = req.body;

    // Support legacy 'q' param by adding to filters
    if (q && !filters.q) filters.q = q;

    const result = await lookalikeGenerationService.generate(
      {
        provider,
        filters,
        page: parseInt(page, 10) || 1,
        perPage: Math.min(parseInt(perPage, 10) || 25, 100),
        useIntent,
      },
      actor
    );

    res.json({ status: 'success', ...result });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: 'Failed to generate look-alikes', message: err.message });
  }
});

// POST /api/lookalike/generate/intent - Convenience endpoint for intent-based generation
// Body: { provider?: string, keywords: string[], minBuyingStage?: string, page?: number, perPage?: number }
router.post('/generate/intent', async (req, res) => {
  try {
    const actor = getActor(req);
    const {
      provider,
      keywords = [],
      topics = [],
      minBuyingStage = 'Consideration',
      minIntentScore = 70,
      industries = [],
      page = 1,
      perPage = 25,
    } = req.body;

    if (!keywords.length && !topics.length) {
      return res.status(400).json({ error: 'keywords or topics array is required for intent-based search' });
    }

    const result = await lookalikeGenerationService.generate(
      {
        provider,
        filters: {
          keywords: keywords.length ? keywords : topics,
          topics: topics.length ? topics : keywords,
          minBuyingStage,
          minIntentScore,
          industries,
        },
        page: parseInt(page, 10) || 1,
        perPage: Math.min(parseInt(perPage, 10) || 25, 100),
        useIntent: true,
      },
      actor
    );

    res.json({ status: 'success', ...result });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: 'Failed to generate intent-based look-alikes', message: err.message });
  }
});

// GET /api/lookalike/seed-companies - Preview the seed companies used for lookalike modeling
router.get('/seed-companies', async (req, res) => {
  try {
    const seeds = await lookalikeGenerationService.getSeedCompanies();
    res.json({
      status: 'success',
      count: seeds.length,
      seedCompanies: seeds,
      note: 'These are your top customers used as the basis for finding lookalike companies',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get seed companies', message: err.message });
  }
});

module.exports = router;
