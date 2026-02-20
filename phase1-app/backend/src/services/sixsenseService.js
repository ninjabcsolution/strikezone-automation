/**
 * 6sense API Integration for Intent-Based Lookalike Generation
 * 
 * 6sense provides:
 * - AI-powered predictive analytics for B2B
 * - Intent data from content consumption signals
 * - Account identification and scoring
 * - Buying stage prediction (Awareness → Purchase)
 * - Segment-based account matching
 * 
 * API Docs: https://developers.6sense.com/
 * Authentication: API Key in header
 */

const auditLogService = require('./auditLogService');

class SixsenseService {
  constructor() {
    this.baseUrl = process.env.SIXSENSE_API_URL || 'https://api.6sense.com/v3';
  }

  getApiKey() {
    return process.env.SIXSENSE_API_KEY;
  }

  isConfigured() {
    return !!this.getApiKey();
  }

  /**
   * Search for accounts with active buying intent
   * Returns companies showing purchase signals for specified keywords/topics
   */
  async searchIntentAccounts({ keywords = [], segments = [], minBuyingStage = 'Awareness', page = 1, perPage = 25 }, actor) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('SIXSENSE_API_KEY is not configured');
    }

    // Map buying stages to numeric values for filtering
    const stageOrder = ['Awareness', 'Consideration', 'Decision', 'Purchase'];
    const minStageIndex = stageOrder.indexOf(minBuyingStage);

    const resp = await fetch(`${this.baseUrl}/accounts/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        keywords,
        segments,
        buyingStageFilter: minStageIndex >= 0 ? stageOrder.slice(minStageIndex) : undefined,
        pagination: { page, pageSize: perPage },
        fields: [
          'accountId', 'companyName', 'domain', 'industry', 'employeeRange',
          'revenueRange', 'city', 'state', 'country', 'buyingStage',
          'intentScore', 'topKeywords', 'webActivity', 'firmographics'
        ],
      }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      await auditLogService.log({
        actor,
        action: 'sixsense.search.failed',
        entityType: 'sixsense',
        details: { status: resp.status, error: data },
      });
      throw new Error(data.message || `6sense search failed (${resp.status})`);
    }

    await auditLogService.log({
      actor,
      action: 'sixsense.search.success',
      entityType: 'sixsense',
      details: { keywords, resultsCount: data.accounts?.length || 0 },
    });

    return {
      accounts: data.accounts || [],
      pagination: {
        page,
        perPage,
        totalResults: data.totalCount || 0,
        totalPages: Math.ceil((data.totalCount || 0) / perPage),
      },
    };
  }

  /**
   * Get accounts similar to a set of seed accounts
   * Uses 6sense's AI-powered lookalike modeling
   */
  async findLookalikes({ seedAccountDomains = [], seedAccountIds = [], filters = {}, limit = 100 }, actor) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('SIXSENSE_API_KEY is not configured');
    }

    const resp = await fetch(`${this.baseUrl}/accounts/lookalike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        seedAccounts: {
          domains: seedAccountDomains,
          accountIds: seedAccountIds,
        },
        filters: {
          industries: filters.industries,
          employeeRanges: filters.employeeRanges,
          revenueRanges: filters.revenueRanges,
          countries: filters.countries,
          states: filters.states,
          excludeExistingCustomers: filters.excludeExistingCustomers ?? true,
        },
        limit,
        includePredictiveScores: true,
      }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      await auditLogService.log({
        actor,
        action: 'sixsense.lookalike.failed',
        entityType: 'sixsense',
        details: { status: resp.status, error: data },
      });
      throw new Error(data.message || `6sense lookalike search failed (${resp.status})`);
    }

    await auditLogService.log({
      actor,
      action: 'sixsense.lookalike.success',
      entityType: 'sixsense',
      details: { seedCount: seedAccountDomains.length + seedAccountIds.length, resultsCount: data.lookalikes?.length || 0 },
    });

    return {
      lookalikes: data.lookalikes || [],
      modelMetrics: data.modelMetrics || {},
    };
  }

  /**
   * Get segment recommendations based on current customer base
   * Helps identify new market opportunities
   */
  async getSegmentRecommendations({ segmentName, keywords = [] }, actor) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('SIXSENSE_API_KEY is not configured');
    }

    const resp = await fetch(`${this.baseUrl}/segments/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        segmentName,
        keywords,
        includeMetrics: true,
      }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      throw new Error(data.message || `6sense segment recommendations failed (${resp.status})`);
    }

    return data;
  }

  /**
   * Map 6sense account response to our standard schema
   */
  mapToStandardFormat(account) {
    return {
      company_name: account.companyName,
      domain: account.domain,
      industry: account.industry,
      city: account.city,
      state: account.state,
      country: account.country,
      employee_range: account.employeeRange,
      revenue_range: account.revenueRange,
      buying_stage: account.buyingStage,
      intent_score: account.intentScore,
      intent_keywords: account.topKeywords || [],
      predictive_score: account.predictiveScore,
      source: 'sixsense',
      source_external_id: account.accountId,
      external_data: account,
    };
  }

  /**
   * Parse employee range string to numeric estimate
   */
  parseEmployeeRange(range) {
    if (!range) return null;
    const match = range.match(/(\d+)/g);
    if (!match) return null;
    // Return midpoint of range
    if (match.length >= 2) {
      return Math.round((parseInt(match[0]) + parseInt(match[1])) / 2);
    }
    return parseInt(match[0]);
  }

  /**
   * Parse revenue range string to numeric estimate
   */
  parseRevenueRange(range) {
    if (!range) return null;
    const multipliers = { K: 1000, M: 1000000, B: 1000000000 };
    const match = range.match(/(\d+(?:\.\d+)?)\s*([KMB])?/gi);
    if (!match) return null;
    
    const values = match.map(m => {
      const [, num, unit] = m.match(/(\d+(?:\.\d+)?)\s*([KMB])?/i) || [];
      return num ? parseFloat(num) * (multipliers[unit?.toUpperCase()] || 1) : 0;
    });
    
    return values.length >= 2 ? Math.round((values[0] + values[1]) / 2) : values[0];
  }
}

module.exports = new SixsenseService();
