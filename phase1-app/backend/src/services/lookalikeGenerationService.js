const { pool } = require('../config/database');
const apolloService = require('./apolloService');
const zoominfoService = require('./zoominfoService');
const sixsenseService = require('./sixsenseService');
const icpProfileService = require('./icpProfileService');
const scoringService = require('./scoringService');
const auditLogService = require('./auditLogService');

function pickFirst(arr) {
  return Array.isArray(arr) && arr.length ? arr[0] : null;
}

/**
 * Multi-provider Lookalike Generation Service
 * 
 * Supports:
 * - Apollo (basic firmographic search)
 * - ZoomInfo (AI-powered lookalikes + intent + technographics)
 * - 6sense (predictive analytics + intent signals + buying stage)
 * 
 * Provider selection:
 * 1. Explicit provider param
 * 2. Environment default: LOOKALIKE_PROVIDER
 * 3. First configured provider (zoominfo > sixsense > apollo)
 */
class LookalikeGenerationService {
  /**
   * Get available/configured providers
   */
  getAvailableProviders() {
    const providers = [];
    if (zoominfoService.isConfigured()) providers.push('zoominfo');
    if (sixsenseService.isConfigured()) providers.push('sixsense');
    if (apolloService.getApiKey()) providers.push('apollo');
    return providers;
  }

  /**
   * Get the default provider based on config
   */
  getDefaultProvider() {
    const envDefault = process.env.LOOKALIKE_PROVIDER?.toLowerCase();
    const available = this.getAvailableProviders();
    
    if (envDefault && available.includes(envDefault)) return envDefault;
    
    // Preference order: zoominfo > sixsense > apollo
    if (available.includes('zoominfo')) return 'zoominfo';
    if (available.includes('sixsense')) return 'sixsense';
    if (available.includes('apollo')) return 'apollo';
    
    return null;
  }

  /**
   * Unified lookalike generation - auto-selects best provider
   */
  async generate({ provider, filters = {}, page = 1, perPage = 25, useIntent = false }, actor) {
    const selectedProvider = provider || this.getDefaultProvider();
    
    if (!selectedProvider) {
      throw new Error('No lookalike provider configured. Set ZOOMINFO_API_KEY, SIXSENSE_API_KEY, or APOLLO_API_KEY');
    }

    // Get seed companies (Top 20 customers)
    const seedCompanies = await this.getSeedCompanies();

    switch (selectedProvider) {
      case 'zoominfo':
        return useIntent
          ? this.generateFromZoomInfoIntent({ filters, page, perPage }, actor)
          : this.generateFromZoomInfo({ seedCompanies, filters, page, perPage }, actor);
      
      case 'sixsense':
        return this.generateFromSixsense({ seedCompanies, filters, page, perPage, useIntent }, actor);
      
      case 'apollo':
      default:
        return this.generateFromApollo({ q: filters.q, page, perPage }, actor);
    }
  }

  /**
   * Get Top 20 seed companies for lookalike modeling
   */
  async getSeedCompanies() {
    const result = await pool.query(`
      SELECT DISTINCT c.customer_id, c.company_name, c.industry, c.state, c.city, c.country,
             cm.annual_revenue, cm.order_count as employee_count
      FROM customers c
      LEFT JOIN customer_metrics cm ON c.customer_id = cm.customer_id
      ORDER BY cm.annual_revenue DESC NULLS LAST
      LIMIT 20
    `);
    return result.rows;
  }

  /**
   * Generate lookalikes using ZoomInfo's AI-powered similarity search
   */
  async generateFromZoomInfo({ seedCompanies, filters = {}, page = 1, perPage = 25 }, actor) {
    const data = await zoominfoService.searchSimilarCompanies({ seedCompanies, filters, page, perPage }, actor);
    
    let inserted = 0, updated = 0;
    const icp = await icpProfileService.getTop20Profile();

    for (const company of data.companies) {
      const mapped = zoominfoService.mapToStandardFormat(company);
      const score = scoringService.scoreTarget({ target: mapped, icpProfile: icp });

      const result = await this.upsertLookalikeTarget({
        ...mapped,
        similarity_score: score.similarityScore,
        opportunity_score: score.opportunityScore,
        tier: score.tier,
        reason_codes: score.reasonCodes,
      });

      if (result.inserted) inserted++; else updated++;
    }

    await auditLogService.log({
      actor,
      action: 'lookalike.generate.zoominfo',
      entityType: 'lookalike_targets',
      details: { page, perPage, inserted, updated, seedCount: seedCompanies.length },
    });

    return { provider: 'zoominfo', inserted, updated, totalFetched: data.companies.length, pagination: data.pagination };
  }

  /**
   * Generate lookalikes using ZoomInfo Intent Data
   */
  async generateFromZoomInfoIntent({ filters = {}, page = 1, perPage = 25 }, actor) {
    const { topics = [], industries = [], minIntentScore = 70 } = filters;
    
    const data = await zoominfoService.searchWithIntent({ topics, industries, minIntentScore, page, perPage }, actor);
    
    let inserted = 0, updated = 0;
    const icp = await icpProfileService.getTop20Profile();

    for (const company of data.companies) {
      const mapped = zoominfoService.mapToStandardFormat(company);
      // Boost score based on intent signals
      const baseScore = scoringService.scoreTarget({ target: mapped, icpProfile: icp });
      const intentBoost = Math.min(20, (company.intentSignals?.length || 0) * 5);

      const result = await this.upsertLookalikeTarget({
        ...mapped,
        similarity_score: Math.min(100, baseScore.similarityScore + intentBoost),
        opportunity_score: Math.min(100, baseScore.opportunityScore + intentBoost),
        tier: baseScore.tier,
        reason_codes: [...baseScore.reasonCodes, 'HIGH_INTENT'],
      });

      if (result.inserted) inserted++; else updated++;
    }

    await auditLogService.log({
      actor,
      action: 'lookalike.generate.zoominfo_intent',
      entityType: 'lookalike_targets',
      details: { topics, inserted, updated },
    });

    return { provider: 'zoominfo_intent', inserted, updated, totalFetched: data.companies.length, pagination: data.pagination };
  }

  /**
   * Generate lookalikes using 6sense AI-powered predictive modeling
   */
  async generateFromSixsense({ seedCompanies, filters = {}, page = 1, perPage = 25, useIntent = false }, actor) {
    const seedDomains = seedCompanies
      .map(c => c.domain || c.company_name?.toLowerCase().replace(/\s+/g, '') + '.com')
      .filter(Boolean);

    let accounts = [];
    let pagination = {};

    if (useIntent && filters.keywords?.length) {
      // Use intent-based search
      const data = await sixsenseService.searchIntentAccounts({
        keywords: filters.keywords,
        minBuyingStage: filters.minBuyingStage || 'Consideration',
        page,
        perPage,
      }, actor);
      accounts = data.accounts;
      pagination = data.pagination;
    } else {
      // Use lookalike modeling
      const data = await sixsenseService.findLookalikes({
        seedAccountDomains: seedDomains,
        filters,
        limit: perPage,
      }, actor);
      accounts = data.lookalikes;
      pagination = { page: 1, perPage, totalResults: data.lookalikes.length };
    }

    let inserted = 0, updated = 0;
    const icp = await icpProfileService.getTop20Profile();

    for (const account of accounts) {
      const mapped = sixsenseService.mapToStandardFormat(account);
      
      // Parse ranges to numeric for scoring
      mapped.employee_count = sixsenseService.parseEmployeeRange(mapped.employee_range);
      mapped.annual_revenue = sixsenseService.parseRevenueRange(mapped.revenue_range);

      const baseScore = scoringService.scoreTarget({ target: mapped, icpProfile: icp });
      
      // Boost based on buying stage and intent
      const stageBoost = { 'Purchase': 20, 'Decision': 15, 'Consideration': 10, 'Awareness': 5 };
      const intentBoost = stageBoost[mapped.buying_stage] || 0;
      const predictiveBoost = mapped.predictive_score ? Math.round(mapped.predictive_score / 5) : 0;

      const reasonCodes = [...baseScore.reasonCodes];
      if (mapped.buying_stage && mapped.buying_stage !== 'Awareness') {
        reasonCodes.push(`BUYING_STAGE_${mapped.buying_stage.toUpperCase()}`);
      }
      if (mapped.intent_score > 70) reasonCodes.push('HIGH_INTENT');

      const result = await this.upsertLookalikeTarget({
        ...mapped,
        similarity_score: Math.min(100, baseScore.similarityScore + intentBoost + predictiveBoost),
        opportunity_score: Math.min(100, baseScore.opportunityScore + intentBoost + predictiveBoost),
        tier: baseScore.tier,
        reason_codes: reasonCodes,
      });

      if (result.inserted) inserted++; else updated++;
    }

    await auditLogService.log({
      actor,
      action: useIntent ? 'lookalike.generate.sixsense_intent' : 'lookalike.generate.sixsense',
      entityType: 'lookalike_targets',
      details: { page, perPage, inserted, updated, seedCount: seedDomains.length },
    });

    return { provider: useIntent ? 'sixsense_intent' : 'sixsense', inserted, updated, totalFetched: accounts.length, pagination };
  }

  /**
   * Helper: Upsert a lookalike target record
   */
  async upsertLookalikeTarget(target) {
    const result = await pool.query(
      `INSERT INTO lookalike_targets (
          company_name, domain, industry, naics, city, state, country,
          employee_count, annual_revenue,
          similarity_score, opportunity_score, tier, reason_codes,
          source, source_external_id, external_data, status
       ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
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
        target.company_name,
        target.domain,
        target.industry,
        target.naics,
        target.city,
        target.state,
        target.country,
        target.employee_count,
        target.annual_revenue,
        target.similarity_score,
        target.opportunity_score,
        target.tier,
        target.reason_codes,
        target.source,
        target.source_external_id,
        target.external_data,
        'pending_review',
      ]
    );
    return { inserted: result.rows[0]?.inserted, targetId: result.rows[0]?.target_id };
  }

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
