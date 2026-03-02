const express = require('express');
const lookalikeGenerationService = require('../services/lookalikeGenerationService');
const icpProfileService = require('../services/icpProfileService');
const { optionalAuth, getUserIdFilter } = require('../middleware/auth');

const router = express.Router();

// Apply optional auth to all lookalike routes for user data isolation
router.use(optionalAuth);

function getActor(req) {
  return req.user?.email || req.header('X-Actor') || 'unknown';
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
    const userId = getUserIdFilter(req);
    const profile = await icpProfileService.getTop20Profile(userId);
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
    const userId = getUserIdFilter(req);
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

    let result;
    try {
      result = await lookalikeGenerationService.generate(
        {
          provider,
          filters,
          page: parseInt(page, 10) || 1,
          perPage: Math.min(parseInt(perPage, 10) || 25, 100),
          useIntent,
        },
        actor,
        userId
      );
    } catch (apiErr) {
      // If API fails (no key, 402, etc), fall back to demo mode
      const isNoApiKey = apiErr.message?.includes('API_KEY is not set');
      const isPlanLimit = apiErr.statusCode === 402 || apiErr.message?.includes('free plan');
      
      if (isNoApiKey || isPlanLimit) {
        console.log('API unavailable - falling back to demo mode:', apiErr.message);
        result = await lookalikeGenerationService.generateDemoData(
          { page: parseInt(page, 10) || 1, perPage: Math.min(parseInt(perPage, 10) || 25, 100) },
          actor,
          userId
        );
        result.fallbackReason = isNoApiKey 
          ? 'No API key configured - using demo data' 
          : 'API requires paid plan - using demo data';
      } else {
        throw apiErr;
      }
    }

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
    const userId = getUserIdFilter(req);
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
      actor,
      userId
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
    const userId = getUserIdFilter(req);
    const seeds = await lookalikeGenerationService.getSeedCompanies(userId);
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
