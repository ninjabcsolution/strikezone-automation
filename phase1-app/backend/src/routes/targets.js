const express = require('express');
const targetsService = require('../services/targetsService');
const { optionalAuth, getUserIdFilter } = require('../middleware/auth');

const router = express.Router();

// Apply optional auth to all targets routes for user data isolation
router.use(optionalAuth);

function getActor(req) {
  return req.user?.email || req.header('X-Actor') || 'unknown';
}

// GET /api/targets?status=&tier=&q=&limit=&offset=&page=
router.get('/', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const status = req.query.status || undefined;
    const tier = req.query.tier || undefined;
    const source = req.query.source || undefined;
    const segment = req.query.segment || undefined;
    const q = req.query.q || undefined;
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit, 10) || 20, 500) : 20;
    const page = req.query.page ? parseInt(req.query.page, 10) || 1 : 1;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : (page - 1) * limit;

    const result = await targetsService.listTargets({ status, tier, source, segment, q, limit, offset, userId });
    res.json({ 
      status: 'success', 
      targets: result.rows, 
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list targets', message: err.message });
  }
});

// GET /api/targets/export.csv
router.get('/export.csv', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const status = req.query.status || undefined;
    const tier = req.query.tier || undefined;
    const source = req.query.source || undefined;
    const segment = req.query.segment || undefined;
    const q = req.query.q || undefined;

    const csv = await targetsService.exportTargetsCsv({ status, tier, source, segment, q, userId });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="targets.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV', message: err.message });
  }
});

// POST /api/targets
// Body: { company_name, domain?, industry?, state?, employee_count?, annual_revenue?, notes? }
router.post('/', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const created = await targetsService.createTarget(req.body || {}, actor, userId);
    res.status(201).json({ status: 'success', target: created });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: 'Failed to create target', message: err.message });
  }
});

// GET /api/targets/:id
router.get('/:id', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const targetId = parseInt(req.params.id, 10);
    const target = await targetsService.getTarget(targetId, userId);
    if (!target) return res.status(404).json({ error: 'Target not found' });
    res.json({ status: 'success', target });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch target', message: err.message });
  }
});

// PATCH /api/targets/:id
router.patch('/:id', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const targetId = parseInt(req.params.id, 10);
    const updated = await targetsService.updateTarget(targetId, req.body || {}, actor, userId);
    res.json({ status: 'success', target: updated });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: 'Failed to update target', message: err.message });
  }
});

// POST /api/targets/:id/approve
router.post('/:id/approve', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const targetId = parseInt(req.params.id, 10);
    const { action, notes } = req.body || {};
    const updated = await targetsService.approveTarget(targetId, { action, notes }, actor, userId);
    res.json({ status: 'success', target: updated });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: 'Failed to approve target', message: err.message });
  }
});

// GET /api/targets/:id/approvals
router.get('/:id/approvals', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const targetId = parseInt(req.params.id, 10);
    const approvals = await targetsService.listApprovals(targetId, userId);
    res.json({ status: 'success', approvals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch approvals', message: err.message });
  }
});

module.exports = router;
