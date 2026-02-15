const auditLogService = require('./auditLogService');

// Apollo API client for mixed companies search (Phase 3)
class ApolloService {
  getApiKey() {
    return process.env.APOLLO_API_KEY;
  }

  async searchCompanies({ page = 1, perPage = 25, q, filters = {} }, actor) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      const err = new Error('APOLLO_API_KEY is not set');
      err.statusCode = 500;
      throw err;
    }

    const url = 'https://api.apollo.io/v1/mixed_companies/search';

    // Apollo docs: API key should be passed via X-Api-Key header.
    // See: https://docs.apollo.io/docs/test-api-key
    const body = {
      page,
      per_page: perPage,
      q: q || undefined,
      ...filters,
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      await auditLogService.log({
        actor,
        action: 'apollo.search.failed',
        entityType: 'apollo',
        details: { status: resp.status, body: data },
      });

      const message =
        data?.error ||
        data?.message ||
        // sometimes Apollo sends error text as `error` nested in `errors`
        (Array.isArray(data?.errors) && data.errors[0]?.message) ||
        `Apollo search failed (${resp.status})`;

      const err = new Error(message);

      // Prefer Apollo's real status code; map "free plan" access errors to 402.
      const isPlanLimit = typeof message === 'string' && message.toLowerCase().includes('free plan');
      err.statusCode = isPlanLimit ? 402 : resp.status || 502;
      throw err;
    }

    await auditLogService.log({
      actor,
      action: 'apollo.search.success',
      entityType: 'apollo',
      details: { page, perPage, q },
    });

    return data;
  }
}

module.exports = new ApolloService();
