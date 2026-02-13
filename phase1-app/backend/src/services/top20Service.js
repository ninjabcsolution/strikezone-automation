const { pool } = require('../config/database');

class Top20Service {
  async calculateCustomerMetrics() {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      await client.query('TRUNCATE TABLE customer_metrics');
      
      await client.query(`
        INSERT INTO customer_metrics (
          customer_id, total_revenue, total_gross_margin, gross_margin_percent,
          order_count, avg_order_value, first_order_date, last_order_date,
          days_as_customer, order_frequency, active_months, product_categories_count, recency_days
        )
        SELECT 
          c.customer_id,
          COALESCE(SUM(o.order_revenue), 0) as total_revenue,
          COALESCE(SUM(o.gross_margin), 0) as total_gross_margin,
          CASE WHEN SUM(o.order_revenue) > 0 THEN (SUM(o.gross_margin) / SUM(o.order_revenue) * 100) ELSE 0 END as gross_margin_percent,
          COUNT(o.order_id) as order_count,
          CASE WHEN COUNT(o.order_id) > 0 THEN SUM(o.order_revenue) / COUNT(o.order_id) ELSE 0 END as avg_order_value,
          MIN(o.order_date) as first_order_date,
          MAX(o.order_date) as last_order_date,
          COALESCE(MAX(o.order_date) - MIN(o.order_date), 0) as days_as_customer,
          CASE WHEN MAX(o.order_date) - MIN(o.order_date) > 0 THEN COUNT(o.order_id)::NUMERIC / ((MAX(o.order_date) - MIN(o.order_date)) / 30.0) ELSE 0 END as order_frequency,
          COUNT(DISTINCT DATE_TRUNC('month', o.order_date)) as active_months,
          COUNT(DISTINCT ol.product_category) as product_categories_count,
          CURRENT_DATE - MAX(o.order_date) as recency_days
        FROM customers c
        LEFT JOIN orders o ON c.customer_id = o.customer_id
        LEFT JOIN order_lines ol ON o.order_id = ol.order_id
        GROUP BY c.customer_id
      `);

      await client.query(`
        UPDATE customer_metrics
        SET consistency_score = CASE WHEN days_as_customer > 0 THEN (active_months::NUMERIC / GREATEST((days_as_customer / 30.0), 1)) * 100 ELSE 0 END
      `);

      const totalCustomers = await client.query('SELECT COUNT(*) as count FROM customer_metrics WHERE total_gross_margin > 0');
      const top20Count = Math.ceil(totalCustomers.rows[0].count * 0.2);

      await client.query(`
        WITH ranked_customers AS (
          SELECT customer_id, ROW_NUMBER() OVER (ORDER BY total_gross_margin DESC) as rank
          FROM customer_metrics WHERE total_gross_margin > 0
        )
        UPDATE customer_metrics cm
        SET percentile_rank = rc.rank, is_top_20 = (rc.rank <= $1)
        FROM ranked_customers rc
        WHERE cm.customer_id = rc.customer_id
      `, [top20Count]);

      await client.query('COMMIT');
      return await this.getTop20Stats();
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTop20Stats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_top_20 = true) as top20_count,
        COUNT(*) as total_customers,
        SUM(total_gross_margin) FILTER (WHERE is_top_20 = true) as top20_margin,
        SUM(total_gross_margin) as total_margin,
        AVG(total_gross_margin) FILTER (WHERE is_top_20 = true) as top20_avg_margin,
        AVG(total_gross_margin) FILTER (WHERE is_top_20 = false) as others_avg_margin
      FROM customer_metrics
    `);

    const stats = result.rows[0];
    return {
      top20Count: parseInt(stats.top20_count),
      totalCustomers: parseInt(stats.total_customers),
      top20Contribution: stats.total_margin > 0 ? ((stats.top20_margin / stats.total_margin) * 100).toFixed(2) : 0,
      top20AvgMargin: parseFloat(stats.top20_avg_margin || 0).toFixed(2),
      othersAvgMargin: parseFloat(stats.others_avg_margin || 0).toFixed(2),
    };
  }

  async getTop20Customers(limit = 24) {
    const result = await pool.query(`
      SELECT cm.*, c.customer_name, c.industry, c.state, c.city
      FROM customer_metrics cm
      JOIN customers c ON cm.customer_id = c.customer_id
      WHERE cm.is_top_20 = true
      ORDER BY cm.total_gross_margin DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }
}

module.exports = new Top20Service();
