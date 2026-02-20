const express = require('express');
const icpTraitsService = require('../services/icpTraitsService');
const icpProfileService = require('../services/icpProfileService');

const router = express.Router();

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  let s = Array.isArray(v) ? v.join('|') : String(v);

  // Prevent CSV/Excel formula injection.
  if (!Number.isFinite(v) && /^[=+\-@]/.test(s.trim())) {
    s = `'${s}`;
  }
  if (/[\n\r",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function getActor(req) {
  return req.header('X-Actor') || 'unknown';
}

// POST /api/icp/calculate
router.post('/calculate', async (req, res) => {
  try {
    const actor = getActor(req);
    const result = await icpTraitsService.calculateTraits(actor);
    res.json({ status: 'success', ...result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate ICP traits', message: err.message });
  }
});

// GET /api/icp/traits?category=&name=&limit=
router.get('/traits', async (req, res) => {
  try {
    const category = req.query.category || undefined;
    const name = req.query.name || undefined;
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10) || 50, 200) : 50;
    const traits = await icpTraitsService.listTraits({ category, name, limit });
    res.json({ status: 'success', traits });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ICP traits', message: err.message });
  }
});

// GET /api/icp/summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await icpTraitsService.summary();
    res.json({ status: 'success', summary });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ICP summary', message: err.message });
  }
});

// GET /api/icp/export.csv
router.get('/export.csv', async (req, res) => {
  try {
    const category = req.query.category || undefined;
    const name = req.query.name || undefined;
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10) || 500, 5000) : 500;

    const traits = await icpTraitsService.listTraits({ category, name, limit });

    const headers = [
      'trait_category',
      'trait_name',
      'trait_value',
      'top20_frequency',
      'others_frequency',
      'lift',
      'importance_score',
      'created_at',
    ];

    const lines = [];
    lines.push(headers.join(','));
    for (const t of traits) {
      lines.push(headers.map((h) => csvEscape(t[h])).join(','));
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="icp_traits.csv"');
    res.send(lines.join('\n'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export ICP traits', message: err.message });
  }
});

// GET /api/icp/export.md (1-page explainable ICP summary)
router.get('/export.md', async (req, res) => {
  try {
    const summary = await icpTraitsService.summary();

    const table = (rows) => {
      const hdr = '| Trait | Top20% | Others | Lift | Importance |\n|---|---:|---:|---:|---:|';
      const body = (rows || [])
        .map((r) => {
          const top = r.top20_frequency;
          const oth = r.others_frequency;
          const lift = r.lift;
          const imp = r.importance_score;
          return `| ${r.trait_value} | ${top}% | ${oth}% | ${lift} | ${imp} |`;
        })
        .join('\n');
      return `${hdr}\n${body}`;
    };

    const md = [
      '# ICP Summary (Auto-Extracted)',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Top Industries',
      table(summary.industries),
      '',
      '## Top States',
      table(summary.states),
      '',
      '## Top NAICS',
      table(summary.naics),
      '',
      '## Top Product Categories',
      table(summary.productCategories),
      '',
    ].join('\n');

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="icp_summary.md"');
    res.send(md);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export ICP summary', message: err.message });
  }
});

// GET /api/icp/external-filters
// Returns values ready to paste into Apollo/LinkedIn filters (vendor-agnostic).
router.get('/external-filters', async (req, res) => {
  try {
    const topN = req.query.topN ? Math.min(parseInt(req.query.topN, 10) || 10, 50) : 10;
    const minLift = req.query.minLift ? parseFloat(req.query.minLift) : 1.1;

    const summary = await icpTraitsService.summary();
    const profile = await icpProfileService.getTop20Profile();

    const pick = (rows) =>
      (rows || [])
        .filter((r) => (r.lift !== null ? parseFloat(r.lift) >= minLift : false))
        .slice(0, topN)
        .map((r) => r.trait_value);

    const industries = pick(summary.industries);
    const states = pick(summary.states);
    const naics = pick(summary.naics);

    res.json({
      status: 'success',
      filters: {
        industries,
        states,
        naics,
        employeeCountRange: profile.employeeCount,
        annualRevenueRange: profile.annualRevenue,
      },
      notes: [
        'These are vendor-agnostic filter values derived from Top 20% vs Others lift analysis.',
        'Use them in Apollo/LinkedIn UI filters, or map them to API filter fields based on your Apollo plan/docs.',
      ],
      apolloSuggestedRequest: {
        endpoint: 'POST https://api.apollo.io/v1/mixed_companies/search',
        headers: { 'X-Api-Key': '<APOLLO_API_KEY>' },
        bodyExample: {
          page: 1,
          per_page: 25,
          // NOTE: exact filter keys may vary by Apollo plan/API.
          organization_industries: industries,
          organization_locations: states,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to build external filters', message: err.message });
  }
});

module.exports = router;
