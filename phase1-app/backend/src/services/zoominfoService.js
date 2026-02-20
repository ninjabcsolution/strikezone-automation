/**
 * ZoomInfo API Integration for Lookalike Company Generation
 * 
 * ZoomInfo provides:
 * - True AI-powered lookalike modeling via Company Search with similarity filters
 * - Intent data signals
 * - Technographic data (tech stack)
 * - Firmographic + organizational data
 * - Company relationships and hierarchies
 * 
 * API Docs: https://api.zoominfo.com/docs
 * Authentication: OAuth2 or API Key (varies by plan)
 */

const auditLogService = require('./auditLogService');

class ZoomInfoService {
  constructor() {
    this.baseUrl = process.env.ZOOMINFO_API_URL || 'https://api.zoominfo.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  getCredentials() {
    return {
      clientId: process.env.ZOOMINFO_CLIENT_ID,
      clientSecret: process.env.ZOOMINFO_CLIENT_SECRET,
      apiKey: process.env.ZOOMINFO_API_KEY,
    };
  }

  isConfigured() {
    const { clientId, clientSecret, apiKey } = this.getCredentials();
    return !!(apiKey || (clientId && clientSecret));
  }

  async authenticate() {
    const { clientId, clientSecret, apiKey } = this.getCredentials();

    // If using API key auth (simpler)
    if (apiKey) {
      this.accessToken = apiKey;
      this.tokenExpiry = Date.now() + 3600000; // Assume 1hr validity
      return;
    }

    // OAuth2 client credentials flow
    if (!clientId || !clientSecret) {
      throw new Error('ZOOMINFO_CLIENT_ID and ZOOMINFO_CLIENT_SECRET are required');
    }

    const resp = await fetch(`${this.baseUrl}/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: clientId,
        password: clientSecret,
      }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok || !data.jwt) {
      throw new Error(data.message || 'ZoomInfo authentication failed');
    }

    this.accessToken = data.jwt;
    this.tokenExpiry = Date.now() + (data.expiresIn || 3600) * 1000;
  }

  async getToken() {
    if (!this.accessToken || Date.now() >= (this.tokenExpiry || 0)) {
      await this.authenticate();
    }
    return this.accessToken;
  }

  /**
   * Search for similar companies based on seed company characteristics
   * Uses ZoomInfo's Company Search with advanced filters
   */
  async searchSimilarCompanies({ seedCompanies, filters = {}, page = 1, perPage = 25 }, actor) {
    if (!this.isConfigured()) {
      throw new Error('ZoomInfo API is not configured. Set ZOOMINFO_API_KEY or ZOOMINFO_CLIENT_ID/SECRET');
    }

    const token = await this.getToken();

    // Build search criteria from seed companies' common attributes
    const searchCriteria = this.buildSimilarityFilters(seedCompanies, filters);

    const resp = await fetch(`${this.baseUrl}/search/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...searchCriteria,
        page,
        rpp: perPage, // results per page
        outputFields: [
          'companyId', 'companyName', 'website', 'primaryIndustry', 'subIndustry',
          'employeeCount', 'revenue', 'revenueRange', 'city', 'state', 'country',
          'naicsCode', 'sicCode', 'techStack', 'intentSignals', 'companyStatus',
          'foundedYear', 'linkedinUrl', 'description', 'parentCompanyId'
        ],
      }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      await auditLogService.log({
        actor,
        action: 'zoominfo.search.failed',
        entityType: 'zoominfo',
        details: { status: resp.status, error: data },
      });
      throw new Error(data.message || `ZoomInfo search failed (${resp.status})`);
    }

    await auditLogService.log({
      actor,
      action: 'zoominfo.search.success',
      entityType: 'zoominfo',
      details: { page, perPage, resultsCount: data.data?.length || 0 },
    });

    return {
      companies: data.data || [],
      pagination: {
        page,
        perPage,
        totalResults: data.totalResults || 0,
        totalPages: Math.ceil((data.totalResults || 0) / perPage),
      },
    };
  }

  /**
   * Get companies with active buying intent signals
   * Premium feature - requires Intent Data package
   */
  async searchWithIntent({ topics = [], industries = [], minIntentScore = 70, page = 1, perPage = 25 }, actor) {
    if (!this.isConfigured()) {
      throw new Error('ZoomInfo API is not configured');
    }

    const token = await this.getToken();

    const resp = await fetch(`${this.baseUrl}/intent/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        intentTopics: topics,
        industries,
        minCompositeScore: minIntentScore,
        page,
        rpp: perPage,
      }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      await auditLogService.log({
        actor,
        action: 'zoominfo.intent.failed',
        entityType: 'zoominfo',
        details: { status: resp.status, error: data },
      });
      throw new Error(data.message || `ZoomInfo intent search failed (${resp.status})`);
    }

    await auditLogService.log({
      actor,
      action: 'zoominfo.intent.success',
      entityType: 'zoominfo',
      details: { topics, resultsCount: data.data?.length || 0 },
    });

    return {
      companies: data.data || [],
      pagination: { page, perPage, totalResults: data.totalResults || 0 },
    };
  }

  /**
   * Build similarity filters from seed companies
   * Extracts common characteristics to find lookalikes
   */
  buildSimilarityFilters(seedCompanies, userFilters = {}) {
    const filters = {};

    if (!seedCompanies?.length) return userFilters;

    // Extract common industries
    const industries = [...new Set(seedCompanies.map(c => c.industry).filter(Boolean))];
    if (industries.length) {
      filters.industries = industries.slice(0, 10);
    }

    // Calculate revenue range from seeds
    const revenues = seedCompanies.map(c => c.annual_revenue).filter(v => v > 0);
    if (revenues.length) {
      const minRev = Math.min(...revenues);
      const maxRev = Math.max(...revenues);
      // Expand range by 50% on each end
      filters.revenueMin = Math.floor(minRev * 0.5);
      filters.revenueMax = Math.ceil(maxRev * 1.5);
    }

    // Calculate employee range from seeds
    const employees = seedCompanies.map(c => c.employee_count).filter(v => v > 0);
    if (employees.length) {
      const minEmp = Math.min(...employees);
      const maxEmp = Math.max(...employees);
      filters.employeeCountMin = Math.floor(minEmp * 0.5);
      filters.employeeCountMax = Math.ceil(maxEmp * 1.5);
    }

    // Extract common locations (states/countries)
    const states = [...new Set(seedCompanies.map(c => c.state).filter(Boolean))];
    if (states.length && states.length <= 10) {
      filters.states = states;
    }

    // Merge with user-provided filters (user filters take precedence)
    return { ...filters, ...userFilters };
  }

  /**
   * Map ZoomInfo company response to our standard schema
   */
  mapToStandardFormat(company) {
    return {
      company_name: company.companyName,
      domain: company.website?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      industry: company.primaryIndustry || company.subIndustry,
      naics: company.naicsCode,
      sic: company.sicCode,
      city: company.city,
      state: company.state,
      country: company.country,
      employee_count: company.employeeCount,
      annual_revenue: company.revenue,
      revenue_range: company.revenueRange,
      founded_year: company.foundedYear,
      linkedin_url: company.linkedinUrl,
      description: company.description,
      tech_stack: company.techStack || [],
      intent_signals: company.intentSignals || [],
      source: 'zoominfo',
      source_external_id: company.companyId,
      external_data: company,
    };
  }
}

module.exports = new ZoomInfoService();
