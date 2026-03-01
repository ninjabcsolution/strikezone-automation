const express = require('express');
const { pool } = require('../config/database');
const apolloService = require('../services/apolloService');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Apply optional auth to all enrichment routes for user data isolation
router.use(optionalAuth);

// POST /api/enrichment/search-people - Search for contacts at specified domains
router.post('/search-people', async (req, res) => {
  try {
    const { organizationDomains = [], titles = [], seniorities = [], page = 1, perPage = 10 } = req.body;

    if (!organizationDomains.length) {
      return res.status(400).json({ error: 'organizationDomains array is required' });
    }

    const result = await apolloService.searchPeople(
      { organizationDomains, titles, seniorities, page, perPage },
      'api'
    );

    res.json({
      people: result.people || [],
      pagination: result.pagination || { page, per_page: perPage, total_entries: 0 },
    });
  } catch (err) {
    console.error('People search error:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/enrichment/enrich-person - Enrich a single person by email or LinkedIn
router.post('/enrich-person', async (req, res) => {
  try {
    const { email, linkedinUrl } = req.body;

    if (!email && !linkedinUrl) {
      return res.status(400).json({ error: 'email or linkedinUrl is required' });
    }

    const result = await apolloService.enrichPerson({ email, linkedinUrl }, 'api');
    res.json({ person: result.person || null });
  } catch (err) {
    console.error('Person enrichment error:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/enrichment/run - Start an enrichment run for approved lookalike targets
router.post('/run', async (req, res) => {
  const client = await pool.connect();
  try {
    const { targetIds, titles = [], seniorities = [], maxContactsPerCompany = 5 } = req.body;

    // Get approved lookalike targets with domains
    let companiesQuery = `
      SELECT lt.target_id as id, lt.company_name, lt.domain
      FROM lookalike_targets lt
      WHERE lt.status = 'approved' AND lt.domain IS NOT NULL
    `;
    const params = [];
    if (targetIds && targetIds.length) {
      companiesQuery += ` AND lt.target_id = ANY($1)`;
      params.push(targetIds);
    }
    companiesQuery += ' LIMIT 100';

    const companiesRes = await client.query(companiesQuery, params);
    const companies = companiesRes.rows;

    if (!companies.length) {
      return res.status(400).json({ error: 'No approved targets with domains found. Approve some targets first in the Approval Portal.' });
    }

    // Create enrichment run
    const runRes = await client.query(
      `INSERT INTO enrichment_runs (status, total_contacts, started_at) VALUES ('running', 0, NOW()) RETURNING id`
    );
    const runId = runRes.rows[0].id;

    let enrichedCount = 0;
    let failedCount = 0;

    for (const company of companies) {
      try {
        const searchResult = await apolloService.searchPeople(
          {
            organizationDomains: [company.domain],
            titles,
            seniorities,
            page: 1,
            perPage: maxContactsPerCompany,
          },
          'enrichment_run'
        );

        const people = searchResult.people || [];
        for (const person of people) {
          await client.query(
            `INSERT INTO enriched_contacts (
              enrichment_run_id, target_id, apollo_id,
              first_name, last_name, full_name, email, email_status,
              title, seniority, departments, linkedin_url, phone,
              company_name, company_domain, raw_data
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [
              runId,
              company.id,
              person.id,
              person.first_name,
              person.last_name,
              person.name,
              person.email,
              person.email_status,
              person.title,
              person.seniority,
              person.departments || [],
              person.linkedin_url,
              person.phone_numbers?.[0]?.sanitized_number || null,
              person.organization?.name || company.company_name,
              company.domain,
              JSON.stringify(person),
            ]
          );
          enrichedCount++;
        }
      } catch (companyErr) {
        console.error(`Failed to enrich contacts for ${company.company_name}:`, companyErr.message);
        failedCount++;
      }
    }

    // Update run status
    await client.query(
      `UPDATE enrichment_runs SET status = 'completed', enriched_count = $1, failed_count = $2, completed_at = NOW() WHERE id = $3`,
      [enrichedCount, failedCount, runId]
    );

    res.json({ runId, enrichedCount, failedCount, companiesProcessed: companies.length });
  } catch (err) {
    console.error('Enrichment run error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/enrichment/runs - List enrichment runs
router.get('/runs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM enrichment_runs ORDER BY created_at DESC LIMIT 50`
    );
    res.json({ runs: result.rows });
  } catch (err) {
    console.error('List runs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/enrichment/contacts - List enriched contacts
router.get('/contacts', async (req, res) => {
  try {
    const { runId, companyId, targetId, limit: limitStr, page: pageStr } = req.query;
    const limit = limitStr ? Math.min(parseInt(limitStr, 10) || 20, 100) : 20;
    const page = pageStr ? parseInt(pageStr, 10) || 1 : 1;
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];
    let paramIndex = 1;

    if (runId) {
      whereClause += ` AND enrichment_run_id = $${paramIndex++}`;
      params.push(runId);
    }
    if (companyId || targetId) {
      whereClause += ` AND target_id = $${paramIndex++}`;
      params.push(companyId || targetId);
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM enriched_contacts WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get paginated results
    const query = `SELECT * FROM enriched_contacts WHERE ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    const totalPages = Math.ceil(total / limit);
    
    res.json({ 
      contacts: result.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('List contacts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/enrichment/contacts/export - Export enriched contacts as CSV
router.get('/contacts/export', async (req, res) => {
  try {
    const { runId, companyId, targetId } = req.query;

    let query = `SELECT ec.*, lt.company_name as target_company
      FROM enriched_contacts ec
      LEFT JOIN lookalike_targets lt ON ec.target_id = lt.target_id
      WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (runId) {
      query += ` AND ec.enrichment_run_id = $${paramIndex++}`;
      params.push(runId);
    }
    if (companyId || targetId) {
      query += ` AND ec.target_id = $${paramIndex++}`;
      params.push(companyId || targetId);
    }
    query += ` ORDER BY ec.created_at DESC`;

    const result = await pool.query(query, params);

    const headers = ['Full Name', 'Email', 'Title', 'Company', 'Domain', 'Phone', 'LinkedIn'];
    const rows = result.rows.map((c) => [
      c.full_name || '',
      c.email || '',
      c.title || '',
      c.company_name || '',
      c.company_domain || '',
      c.phone || '',
      c.linkedin_url || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="enriched_contacts.csv"');
    res.send(csvContent);
  } catch (err) {
    console.error('Export contacts error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
