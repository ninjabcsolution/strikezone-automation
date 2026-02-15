const { pool } = require('../config/database');

// A very lightweight ICP profile derived from the current Top 20% customers.
// This is intentionally explainable and easy to iterate.
class ICPProfileService {
  async getTop20Profile() {
    // We derive:
    // - top industries + weights
    // - top states + weights
    // - employee_count & annual_revenue ranges (p25/p75) where available
    const industries = await pool.query(
      `SELECT c.industry, COUNT(*)::int AS count
       FROM customer_metrics cm
       JOIN customers c ON c.customer_id = cm.customer_id
       WHERE cm.is_top_20 = true AND c.industry IS NOT NULL AND c.industry <> ''
       GROUP BY c.industry
       ORDER BY count DESC
       LIMIT 10`
    );

    const states = await pool.query(
      `SELECT c.state, COUNT(*)::int AS count
       FROM customer_metrics cm
       JOIN customers c ON c.customer_id = cm.customer_id
       WHERE cm.is_top_20 = true AND c.state IS NOT NULL AND c.state <> ''
       GROUP BY c.state
       ORDER BY count DESC
       LIMIT 10`
    );

    const employee = await pool.query(
      `SELECT
          percentile_cont(0.25) WITHIN GROUP (ORDER BY employee_count) AS p25,
          percentile_cont(0.75) WITHIN GROUP (ORDER BY employee_count) AS p75
       FROM customers c
       JOIN customer_metrics cm ON cm.customer_id = c.customer_id
       WHERE cm.is_top_20 = true AND c.employee_count IS NOT NULL`
    );

    const revenue = await pool.query(
      `SELECT
          percentile_cont(0.25) WITHIN GROUP (ORDER BY annual_revenue) AS p25,
          percentile_cont(0.75) WITHIN GROUP (ORDER BY annual_revenue) AS p75
       FROM customers c
       JOIN customer_metrics cm ON cm.customer_id = c.customer_id
       WHERE cm.is_top_20 = true AND c.annual_revenue IS NOT NULL`
    );

    const topIndustries = industries.rows.map((r) => ({ value: r.industry, count: r.count }));
    const topStates = states.rows.map((r) => ({ value: r.state, count: r.count }));

    const totalIndustry = topIndustries.reduce((sum, r) => sum + r.count, 0) || 1;
    const totalStates = topStates.reduce((sum, r) => sum + r.count, 0) || 1;

    return {
      industries: topIndustries.map((r) => ({ ...r, weight: r.count / totalIndustry })),
      states: topStates.map((r) => ({ ...r, weight: r.count / totalStates })),
      employeeCount: {
        p25: employee.rows[0]?.p25 ? parseFloat(employee.rows[0].p25) : null,
        p75: employee.rows[0]?.p75 ? parseFloat(employee.rows[0].p75) : null,
      },
      annualRevenue: {
        p25: revenue.rows[0]?.p25 ? parseFloat(revenue.rows[0].p25) : null,
        p75: revenue.rows[0]?.p75 ? parseFloat(revenue.rows[0].p75) : null,
      },
    };
  }
}

module.exports = new ICPProfileService();
