const { pool } = require('../config/database');
const auditLogService = require('./auditLogService');

// Phase 2C (win-back targeting):
// Find customers that were historically valuable but have not ordered in N days.
// Output is stored into lookalike_targets with source='winback'.
class WinbackService {
  async generate({ inactiveDays = 180, limit = 200 }, actor) {
    const res = await pool.query(
      `SELECT
         cm.customer_id,
         c.customer_name,
         c.industry,
         c.naics,
         c.city,
         c.state,
         c.country,
         c.employee_count,
         c.annual_revenue,
         cm.total_revenue,
         cm.total_gross_margin,
         cm.gross_margin_percent,
         cm.order_count,
         cm.recency_days
       FROM customer_metrics cm
       JOIN customers c ON c.customer_id = cm.customer_id
       WHERE cm.total_gross_margin > 0
         AND cm.recency_days >= $1
       ORDER BY cm.total_gross_margin DESC
       LIMIT $2`,
      [inactiveDays, limit]
    );

    let inserted = 0;
    let updated = 0;

    for (const r of res.rows) {
      // Use customer_id as the stable external id
      const result = await pool.query(
        `INSERT INTO lookalike_targets (
          company_name, industry, naics, city, state, country,
          employee_count, annual_revenue,
          similarity_score, opportunity_score, tier, reason_codes,
          source, source_external_id, external_data, status, segment
        ) VALUES (
          $1,$2,$3,$4,$5,$6,
          $7,$8,
          $9,$10,$11,$12,
          $13,$14,$15,$16,$17
        )
        ON CONFLICT (source, source_external_id)
        WHERE source_external_id IS NOT NULL
        DO UPDATE SET
          company_name = EXCLUDED.company_name,
          industry = EXCLUDED.industry,
          naics = EXCLUDED.naics,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          country = EXCLUDED.country,
          employee_count = EXCLUDED.employee_count,
          annual_revenue = EXCLUDED.annual_revenue,
          external_data = EXCLUDED.external_data,
          updated_at = CURRENT_TIMESTAMP
        RETURNING target_id, (xmax = 0) AS inserted`,
        [
          r.customer_name,
          r.industry,
          r.naics,
          r.city,
          r.state,
          r.country,
          r.employee_count,
          r.annual_revenue,
          // similarity/opportunity not computed here; left null for Phase 3 scoring
          null,
          null,
          null,
          [
            `Win-back: inactive ${r.recency_days} days`,
            `Historical margin $${Math.round(r.total_gross_margin).toLocaleString()}`,
          ],
          'winback',
          String(r.customer_id),
          r,
          'pending_review',
          'WinBack',
        ]
      );

      if (result.rows[0]?.inserted) inserted += 1;
      else updated += 1;
    }

    await auditLogService.log({
      actor,
      action: 'winback.generated',
      entityType: 'lookalike_targets',
      details: { inactiveDays, limit, inserted, updated },
    });

    return { inserted, updated, totalCandidates: res.rows.length };
  }
}

module.exports = new WinbackService();
