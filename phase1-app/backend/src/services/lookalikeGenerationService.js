const { pool } = require('../config/database');
const apolloService = require('./apolloService');
const icpProfileService = require('./icpProfileService');
const scoringService = require('./scoringService');
const auditLogService = require('./auditLogService');

function pickFirst(arr) {
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

class LookalikeGenerationService {
  async generateFromApollo({ q, page = 1, perPage = 25 }, actor) {
    const icp = await icpProfileService.getTop20Profile();

    // Basic auto-derived filters from ICP:
    // - Focus the search on top industries & top states.
    const industryValues = icp.industries.map((i) => i.value).slice(0, 5);
    const stateValues = icp.states.map((s) => s.value).slice(0, 5);

    const filters = {};
    // Apollo accepts various filter keys; for MVP we pass 'organization_locations' and 'organization_industries'
    // This may need adjustment per your Apollo plan/fields.
    if (industryValues.length) {
      filters.organization_industries = industryValues;
    }
    if (stateValues.length) {
      filters.organization_locations = stateValues;
    }

    const data = await apolloService.searchCompanies({ q, page, perPage, filters }, actor);

    const orgs = data?.organizations || data?.companies || data?.accounts || [];
    let inserted = 0;
    let updated = 0;

    // Insert results (dedupe by source+source_external_id)
    for (const org of orgs) {
      const externalId = org?.id || org?.organization_id || null;
      const companyName = org?.name || org?.organization_name || '';
      const domain = org?.website_url || org?.primary_domain || org?.domain || null;

      const city = org?.primary_location?.city || null;
      const state = org?.primary_location?.state || null;
      const country = org?.primary_location?.country || null;

      const industry = pickFirst(org?.industries) || org?.industry || null;
      const naics = org?.naics || null;

      // Apollo often returns estimated_num_employees / annual_revenue
      const employeeCount = org?.estimated_num_employees ? Number(org.estimated_num_employees) : null;
      const annualRevenue = org?.annual_revenue ? Number(org.annual_revenue) : null;

      const target = {
        company_name: companyName,
        domain,
        industry,
        naics,
        city,
        state,
        country,
        employee_count: Number.isFinite(employeeCount) ? employeeCount : null,
        annual_revenue: Number.isFinite(annualRevenue) ? annualRevenue : null,
      };

      const score = scoringService.scoreTarget({ target, icpProfile: icp });

      const row = {
        ...target,
        similarity_score: score.similarityScore,
        opportunity_score: score.opportunityScore,
        tier: score.tier,
        reason_codes: score.reasonCodes,
        source: 'apollo',
        source_external_id: externalId,
        external_data: org,
        status: 'pending_review',
      };

      const result = await pool.query(
        `INSERT INTO lookalike_targets (
            company_name, domain, industry, naics, city, state, country,
            employee_count, annual_revenue,
            similarity_score, opportunity_score, tier, reason_codes,
            source, source_external_id, external_data, status
         ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,
            $8,$9,
            $10,$11,$12,$13,
            $14,$15,$16,$17
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
            similarity_score = EXCLUDED.similarity_score,
            opportunity_score = EXCLUDED.opportunity_score,
            tier = EXCLUDED.tier,
            reason_codes = EXCLUDED.reason_codes,
            external_data = EXCLUDED.external_data,
            updated_at = CURRENT_TIMESTAMP
         RETURNING target_id, (xmax = 0) AS inserted`,
        [
          row.company_name,
          row.domain,
          row.industry,
          row.naics,
          row.city,
          row.state,
          row.country,
          row.employee_count,
          row.annual_revenue,
          row.similarity_score,
          row.opportunity_score,
          row.tier,
          row.reason_codes,
          row.source,
          row.source_external_id,
          row.external_data,
          row.status,
        ]
      );

      if (result.rows[0]?.inserted) inserted += 1;
      else updated += 1;
    }

    await auditLogService.log({
      actor,
      action: 'lookalike.generate.apollo',
      entityType: 'lookalike_targets',
      details: { q, page, perPage, inserted, updated },
    });

    return { inserted, updated, totalFetched: orgs.length, icpProfile: icp };
  }
}

module.exports = new LookalikeGenerationService();
