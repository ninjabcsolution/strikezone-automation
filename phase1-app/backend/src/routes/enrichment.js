const express = require('express');
const pool = require('../config/database');
const apolloService = require('../services/apolloService');

const router = express.Router();

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

// POST /api/enrichment/run - Start an enrichment run for approved lookalike companies
router.post('/run', async (req, res) => {
  const client = await pool.connect();
  try {
    const { companyIds, titles = [], seniorities = [], maxContactsPerCompany = 5 } = req.body;

    // Get approved lookalike companies with domains
    let companiesQuery = `
      SELECT lc.id, lc.company_name, lc.domain
      FROM lookalike_companies lc
      WHERE lc.approval_status = 'approved' AND lc.domain IS NOT NULL
    `;
    const params = [];
    if (companyIds && companyIds.length) {
      companiesQuery += ` AND lc.id = ANY($1)`;
      params.push(companyIds);
    }
    companiesQuery += ' LIMIT 100';

    const companiesRes = await client.query(companiesQuery, params);
    const companies = companiesRes.rows;

    if (!companies.length) {
      return res.status(400).json({ error: 'No approved companies with domains found' });
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
              enrichment_run_id, lookalike_company_id, apollo_id,
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
    const { runId, companyId, limit = 100, offset = 0 } = req.query;

    let query = `SELECT * FROM enriched_contacts WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (runId) {
      query += ` AND enrichment_run_id = $${paramIndex++}`;
      params.push(runId);
    }
    if (companyId) {
      query += ` AND lookalike_company_id = $${paramIndex++}`;
      params.push(companyId);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await pool.query(query, params);
    res.json({ contacts: result.rows });
  } catch (err) {
    console.error('List contacts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/enrichment/contacts/export - Export enriched contacts as CSV
router.get('/contacts/export', async (req, res) => {
  try {
    const { runId, companyId } = req.query;

    let query = `SELECT ec.*, lc.company_name as target_company
      FROM enriched_contacts ec
      LEFT JOIN lookalike_companies lc ON ec.lookalike_company_id = lc.id
      WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (runId) {
      query += ` AND ec.enrichment_run_id = $${paramIndex++}`;
      params.push(runId);
    }
    if (companyId) {
      query += ` AND ec.lookalike_company_id = $${paramIndex++}`;
      params.push(companyId);
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
