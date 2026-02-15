const { pool } = require('../config/database');
const auditLogService = require('./auditLogService');

function normalizeDomain(domain) {
  if (!domain) return null;
  let d = String(domain).trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '');
  d = d.replace(/^www\./, '');
  d = d.split('/')[0];
  return d || null;
}

function normalizeKey(key) {
  if (key === null || key === undefined) return '';
  return String(key)
    .replace(/^\uFEFF/, '') // strip BOM
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeRecordKeys(record) {
  const out = {};
  for (const [k, v] of Object.entries(record || {})) {
    out[normalizeKey(k)] = v;
  }
  return out;
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const s = String(value)
    .trim()
    .replace(/[$,%]/g, '')
    .replace(/,/g, '');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function parseReasonCodes(value) {
  if (!value) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    // Common separators: | ; •
    const parts = value
      .split(/\||;|•/g)
      .map((p) => p.trim())
      .filter(Boolean);
    return parts.length ? parts : null;
  }
  return null;
}

class PowerBIImportService {
  async importTargets({ records, actor }) {
    if (!Array.isArray(records)) {
      const err = new Error('records must be an array');
      err.statusCode = 400;
      throw err;
    }

    let inserted = 0;
    let updated = 0;
    const errors = [];

    for (const r of records) {
      try {
        const nr = normalizeRecordKeys(r);

        const companyName =
          nr.company_name ||
          nr.company ||
          nr.name ||
          nr.account_name ||
          nr.organization_name ||
          null;
        if (!companyName) {
          throw new Error('Missing company_name');
        }

        const domain = normalizeDomain(
          nr.domain ||
            nr.company_domain ||
            nr.website ||
            nr.website_url ||
            nr.primary_domain ||
            nr.company_website ||
            null
        );
        const industry = nr.industry || null;
        const naics = nr.naics || null;
        const city = nr.city || null;
        const state = nr.state || nr.state_region || null;
        const country = nr.country || null;
        const employeeCount = toNumber(nr.employee_count ?? nr.employeeCount ?? nr.estimated_num_employees ?? null);
        const annualRevenue = toNumber(nr.annual_revenue ?? nr.annualRevenue ?? null);

        // Allow Power BI to provide its own segment/tier/scores if present.
        const segment = nr.segment || nr.segment_name || nr.tier_segment || null;
        const tier = nr.tier || null;
        const similarityScore = toNumber(nr.similarity_score ?? nr.similarityScore ?? null);
        const opportunityScore = toNumber(nr.opportunity_score ?? nr.opportunityScore ?? null);
        const reasonCodes = parseReasonCodes(nr.reason_codes || nr.reasonCodes || null);

        // Dedupe: if Power BI provides a stable ID, use it; otherwise fallback to domain.
        const externalId = nr.target_id || nr.account_id || nr.company_id || nr.customer_id || domain;
        if (!externalId) {
          throw new Error('Missing a stable identifier (target_id/account_id/domain)');
        }

        const result = await pool.query(
          `INSERT INTO lookalike_targets (
            company_name, domain, industry, naics, city, state, country,
            employee_count, annual_revenue,
            similarity_score, opportunity_score, tier, reason_codes,
            source, source_external_id, external_data, status, notes, updated_by, segment
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,
            $8,$9,
            $10,$11,$12,$13,
            $14,$15,$16,$17,$18,$19,$20
          )
          ON CONFLICT (source, source_external_id)
          WHERE source_external_id IS NOT NULL
          DO UPDATE SET
            company_name = EXCLUDED.company_name,
            domain = EXCLUDED.domain,
            industry = EXCLUDED.industry,
            naics = EXCLUDED.naics,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            country = EXCLUDED.country,
            employee_count = EXCLUDED.employee_count,
            annual_revenue = EXCLUDED.annual_revenue,
            similarity_score = COALESCE(EXCLUDED.similarity_score, lookalike_targets.similarity_score),
            opportunity_score = COALESCE(EXCLUDED.opportunity_score, lookalike_targets.opportunity_score),
            tier = COALESCE(EXCLUDED.tier, lookalike_targets.tier),
            reason_codes = COALESCE(EXCLUDED.reason_codes, lookalike_targets.reason_codes),
            external_data = EXCLUDED.external_data,
            segment = COALESCE(EXCLUDED.segment, lookalike_targets.segment),
            updated_at = CURRENT_TIMESTAMP,
            updated_by = EXCLUDED.updated_by
          RETURNING target_id, (xmax = 0) AS inserted`,
          [
            companyName,
            domain,
            industry,
            naics,
            city,
            state,
            country,
            employeeCount,
            annualRevenue,
            similarityScore,
            opportunityScore,
            tier,
            reasonCodes,
            'powerbi',
            String(externalId),
            r,
            'pending_review',
            nr.notes || null,
            actor || null,
            segment,
          ]
        );

        if (result.rows[0]?.inserted) inserted += 1;
        else updated += 1;
      } catch (err) {
        errors.push({ record: r, error: err.message });
      }
    }

    await auditLogService.log({
      actor,
      action: 'powerbi.import.targets',
      entityType: 'lookalike_targets',
      details: { inserted, updated, failed: errors.length },
    });

    return { inserted, updated, failed: errors.length, errors: errors.slice(0, 50) };
  }
}

module.exports = new PowerBIImportService();
