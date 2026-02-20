const { pool } = require('../config/database');
const auditLogService = require('./auditLogService');
const icpProfileService = require('./icpProfileService');
const scoringService = require('./scoringService');

class TargetsService {
  async createTarget(input, actor) {
    const source = input.source || 'manual';
    const segment = input.segment || null;

    const target = {
      company_name: input.company_name || input.companyName || null,
      domain: input.domain || null,
      industry: input.industry || null,
      naics: input.naics || null,
      city: input.city || null,
      state: input.state || null,
      country: input.country || null,
      employee_count: input.employee_count ?? input.employeeCount ?? null,
      annual_revenue: input.annual_revenue ?? input.annualRevenue ?? null,
      notes: input.notes || null,
    };

    const icp = await icpProfileService.getTop20Profile();
    const score = scoringService.scoreTarget({ target, icpProfile: icp });

    const result = await pool.query(
      `INSERT INTO lookalike_targets (
        company_name, domain, industry, naics, city, state, country,
        employee_count, annual_revenue,
        similarity_score, opportunity_score, tier, reason_codes,
        source, status, notes, updated_by, segment
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,
        $10,$11,$12,$13,
        $14,$15,$16,$17,$18
      )
      RETURNING *`,
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
        score.similarityScore,
        score.opportunityScore,
        score.tier,
        score.reasonCodes,
        source,
        'pending_review',
        target.notes,
        actor || null,
        segment,
      ]
    );

    const created = result.rows[0];
    await auditLogService.log({
      actor,
      action: 'target.created',
      entityType: 'lookalike_target',
      entityId: created.target_id,
      details: { source },
    });

    return created;
  }

  async listTargets({ status, q, tier, source, segment, limit = 100, offset = 0 }) {
    const params = [];
    const where = [];

    if (status) {
      params.push(status);
      where.push(`status = $${params.length}`);
    }

    if (tier) {
      params.push(tier);
      where.push(`tier = $${params.length}`);
    }

    if (source) {
      params.push(source);
      where.push(`source = $${params.length}`);
    }

    if (segment) {
      params.push(segment);
      where.push(`segment = $${params.length}`);
    }

    if (q) {
      params.push(`%${q}%`);
      where.push(`(company_name ILIKE $${params.length} OR domain ILIKE $${params.length})`);
    }

    params.push(limit);
    params.push(offset);

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT *
       FROM lookalike_targets
       ${whereSql}
       ORDER BY updated_at DESC NULLS LAST, created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );
    return result.rows;
  }

  async getTarget(targetId) {
    const result = await pool.query('SELECT * FROM lookalike_targets WHERE target_id = $1', [targetId]);
    return result.rows[0] || null;
  }

  async updateTarget(targetId, patch, actor) {
    // Allowed updates for MVP
    const allowed = [
      'company_name',
      'domain',
      'industry',
      'naics',
      'city',
      'state',
      'country',
      'employee_count',
      'annual_revenue',
      'similarity_score',
      'opportunity_score',
      'tier',
      'segment',
      'reason_codes',
      'status',
      'notes',
    ];

    const sets = [];
    const params = [];
    for (const key of allowed) {
      if (patch[key] === undefined) continue;
      params.push(patch[key]);
      sets.push(`${key} = $${params.length}`);
    }

    params.push(actor || null);
    sets.push(`updated_by = $${params.length}`);
    sets.push('updated_at = CURRENT_TIMESTAMP');

    params.push(targetId);

    if (!sets.length) return await this.getTarget(targetId);

    const result = await pool.query(
      `UPDATE lookalike_targets
       SET ${sets.join(', ')}
       WHERE target_id = $${params.length}
       RETURNING *`,
      params
    );

    const updated = result.rows[0];
    await auditLogService.log({
      actor,
      action: 'target.updated',
      entityType: 'lookalike_target',
      entityId: targetId,
      details: patch,
    });

    return updated;
  }

  async approveTarget(targetId, { action, notes }, actor) {
    const validActions = new Set(['approved', 'rejected']);
    if (!validActions.has(action)) {
      const err = new Error('Invalid approval action. Use approved or rejected.');
      err.statusCode = 400;
      throw err;
    }

    // Update target status
    const updated = await this.updateTarget(targetId, { status: action }, actor);

    // Insert approval event
    await pool.query(
      `INSERT INTO target_approvals (target_id, actor, action, notes)
       VALUES ($1, $2, $3, $4)`,
      [targetId, actor || 'unknown', action, notes || null]
    );

    await auditLogService.log({
      actor,
      action: `target.${action}`,
      entityType: 'lookalike_target',
      entityId: targetId,
      details: { notes: notes || null },
    });

    return updated;
  }

  async exportTargetsCsv({ status, tier, source, segment, q }) {
    const rows = await this.listTargets({ status, tier, source, segment, q, limit: 5000, offset: 0 });

    const headers = [
      'target_id',
      'company_name',
      'domain',
      'industry',
      'naics',
      'city',
      'state',
      'country',
      'employee_count',
      'annual_revenue',
      'similarity_score',
      'opportunity_score',
      'tier',
      'segment',
      'status',
      'reason_codes',
      'notes',
      'source',
      'source_external_id',
      'created_at',
      'updated_at',
      'updated_by',
    ];

    const escape = (v) => {
      if (v === null || v === undefined) return '';

      let s = Array.isArray(v) ? v.join('|') : String(v);

      // Prevent CSV/Excel formula injection.
      // See: https://owasp.org/www-community/attacks/CSV_Injection
      const trimmed = s.trim();
      const numeric = trimmed !== '' && Number.isFinite(Number(trimmed));
      if (!numeric && /^[=+\-@]/.test(trimmed)) {
        s = `'${s}`;
      }

      // Basic CSV escaping
      if (/[\n\r",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const lines = [];
    lines.push(headers.join(','));
    for (const r of rows) {
      lines.push(headers.map((h) => escape(r[h])).join(','));
    }
    return lines.join('\n');
  }

  async listApprovals(targetId) {
    const result = await pool.query(
      `SELECT * FROM target_approvals
       WHERE target_id = $1
       ORDER BY created_at DESC`,
      [targetId]
    );
    return result.rows;
  }
}

module.exports = new TargetsService();
