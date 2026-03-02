/**
 * Messaging Routes for Phase 4B
 * 
 * Endpoints for:
 * - Message template management
 * - AI message generation (single and batch)
 * - Message approval workflow
 * - Export approved messages
 */

const express = require('express');
const messagingService = require('../services/messagingService');
const openaiService = require('../services/openaiService');
const { optionalAuth, getUserIdFilter } = require('../middleware/auth');

const router = express.Router();

// Apply optional auth to all messaging routes for user data isolation
router.use(optionalAuth);

function getActor(req) {
  return req.user?.email || req.header('X-Actor') || 'api';
}

// ========================================
// Configuration Status
// ========================================

// GET /api/messaging/status - Check OpenAI configuration
router.get('/status', (req, res) => {
  res.json({
    openai: {
      configured: openaiService.isConfigured(),
      model: openaiService.defaultModel,
    },
  });
});

// ========================================
// Template Management
// ========================================

// GET /api/messaging/templates - List all templates
router.get('/templates', async (req, res) => {
  try {
    const { type, active } = req.query;
    const templates = await messagingService.getTemplates({
      type,
      isActive: active === 'false' ? false : active === 'all' ? null : true,
    });
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messaging/templates/:id - Get single template
router.get('/templates/:id', async (req, res) => {
  try {
    const template = await messagingService.getTemplateById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messaging/templates - Create new template
router.post('/templates', async (req, res) => {
  try {
    const { name, type, subjectTemplate, bodyTemplate, tone } = req.body;
    
    if (!name || !type || !bodyTemplate) {
      return res.status(400).json({ error: 'name, type, and bodyTemplate are required' });
    }

    const template = await messagingService.createTemplate({
      name, type, subjectTemplate, bodyTemplate, tone,
    });
    res.status(201).json({ template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/messaging/templates/:id - Update template
router.put('/templates/:id', async (req, res) => {
  try {
    const template = await messagingService.updateTemplate(req.params.id, req.body);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// Message Generation
// ========================================

// POST /api/messaging/generate - Generate message for single contact
router.post('/generate', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const { contactId, templateId, messageType, tone, customInstructions } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: 'contactId is required' });
    }

    const message = await messagingService.generateMessage({
      contactId,
      templateId,
      messageType,
      tone,
      customInstructions,
    }, actor, userId);

    res.status(201).json({ message });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/messaging/generate/batch - Generate messages for multiple contacts
router.post('/generate/batch', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const { contactIds, templateId, messageType, tone, customInstructions } = req.body;

    if (!contactIds || !contactIds.length) {
      return res.status(400).json({ error: 'contactIds array is required' });
    }

    if (contactIds.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 contacts per batch' });
    }

    const result = await messagingService.generateBatch({
      contactIds,
      templateId,
      messageType,
      tone,
      customInstructions,
    }, actor, userId);

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// Bulk Operations (must come before :id routes)
// ========================================

// POST /api/messaging/messages/bulk/approve - Bulk approve messages
router.post('/messages/bulk/approve', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const result = await messagingService.bulkApprove(ids, actor, actor, userId);
    res.json({ approved: result.length, ids: result.map(r => r.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messaging/messages/bulk/reject - Bulk reject messages
router.post('/messages/bulk/reject', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const { ids, reason } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const result = await messagingService.bulkReject(ids, reason || 'Bulk rejected', actor, actor, userId);
    res.json({ rejected: result.length, ids: result.map(r => r.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// Message Retrieval
// ========================================

// GET /api/messaging/messages - List messages with filters
router.get('/messages', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const { status, type, contactId, limit: limitStr, page: pageStr } = req.query;
    const limit = limitStr ? Math.min(parseInt(limitStr, 10) || 20, 100) : 20;
    const page = pageStr ? parseInt(pageStr, 10) || 1 : 1;
    const offset = (page - 1) * limit;

    const result = await messagingService.getMessages({
      status,
      messageType: type,
      contactId: contactId ? parseInt(contactId, 10) : undefined,
      limit,
      offset,
      userId,
    });
    
    res.json({ 
      messages: result.rows || result,
      pagination: result.pagination || {
        total: (result.rows || result).length,
        page,
        limit,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messaging/messages/stats - Get message approval stats
router.get('/messages/stats', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const stats = await messagingService.getMessageStats(userId);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messaging/messages/:id - Get single message
router.get('/messages/:id', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const message = await messagingService.getMessageById(req.params.id, userId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// Message Approval Workflow
// ========================================

// POST /api/messaging/messages/:id/approve - Approve a message
router.post('/messages/:id/approve', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const message = await messagingService.approveMessage(
      req.params.id,
      actor,
      actor,
      userId
    );
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messaging/messages/:id/reject - Reject a message
router.post('/messages/:id/reject', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const { reason } = req.body;
    
    const message = await messagingService.rejectMessage(
      req.params.id,
      reason || 'No reason provided',
      actor,
      actor,
      userId
    );
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messaging/messages/:id/edit - Edit and approve a message
router.post('/messages/:id/edit', async (req, res) => {
  try {
    const actor = getActor(req);
    const userId = getUserIdFilter(req);
    const { body, subject } = req.body;

    if (!body) {
      return res.status(400).json({ error: 'body is required' });
    }

    const message = await messagingService.editAndApprove(
      req.params.id,
      body,
      subject,
      actor,
      actor,
      userId
    );
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// Generation Runs
// ========================================

// GET /api/messaging/runs - List generation runs
router.get('/runs', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const { limit } = req.query;
    const runs = await messagingService.getGenerationRuns({
      limit: limit ? parseInt(limit, 10) : 20,
      userId,
    });
    res.json({ runs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// Export
// ========================================

// GET /api/messaging/export - Export approved messages as CSV
router.get('/export', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const { type } = req.query;
    const messages = await messagingService.exportApprovedMessages({
      messageType: type,
      userId,
    });

    const headers = ['Contact Name', 'Email', 'Company', 'Subject', 'Body', 'Type', 'Approved At'];
    const rows = messages.map(m => [
      m.contact_name || '',
      m.contact_email || '',
      m.company_name || '',
      m.subject || '',
      (m.edited_body || m.body || '').replace(/\n/g, ' '),
      m.message_type || '',
      m.approved_at ? new Date(m.approved_at).toISOString() : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="approved_messages.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messaging/export/json - Export approved messages as JSON
router.get('/export/json', async (req, res) => {
  try {
    const userId = getUserIdFilter(req);
    const { type } = req.query;
    const messages = await messagingService.exportApprovedMessages({
      messageType: type,
      userId,
    });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
