const { pool } = require('../config/database');

class Top20Service {
  async calculateCustomerMetrics() {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      await client.query('TRUNCATE TABLE customer_metrics');
      
      // IMPORTANT: avoid joining orders directly to order_lines when summing order revenue/margin.
      // That join multiplies orders by number of lines and inflates totals.
      await client.query(`
        WITH order_aggs AS (
          SELECT
            customer_id,
            COALESCE(SUM(order_revenue), 0) AS total_revenue,
            COALESCE(SUM(gross_margin), 0) AS total_gross_margin,
            COUNT(order_id) AS order_count,
            MIN(order_date) AS first_order_date,
            MAX(order_date) AS last_order_date,
            COUNT(DISTINCT DATE_TRUNC('month', order_date)) AS active_months
          FROM orders
          GROUP BY customer_id
        ),
        category_aggs AS (
          SELECT
            customer_id,
            COUNT(DISTINCT product_category) AS product_categories_count
          FROM order_lines
          WHERE product_category IS NOT NULL AND product_category <> ''
          GROUP BY customer_id
        )
        INSERT INTO customer_metrics (
          customer_id, total_revenue, total_gross_margin, gross_margin_percent,
          order_count, avg_order_value, first_order_date, last_order_date,
          days_as_customer, order_frequency, active_months, product_categories_count, recency_days
        )
        SELECT
          c.customer_id,
          COALESCE(o.total_revenue, 0) AS total_revenue,
          COALESCE(o.total_gross_margin, 0) AS total_gross_margin,
          CASE
            WHEN COALESCE(o.total_revenue, 0) > 0 THEN (COALESCE(o.total_gross_margin, 0) / o.total_revenue * 100)
            ELSE 0
          END AS gross_margin_percent,
          COALESCE(o.order_count, 0) AS order_count,
          CASE
            WHEN COALESCE(o.order_count, 0) > 0 THEN (o.total_revenue / o.order_count)
            ELSE 0
          END AS avg_order_value,
          o.first_order_date,
          o.last_order_date,
          COALESCE(o.last_order_date - o.first_order_date, 0) AS days_as_customer,
          CASE
            WHEN o.last_order_date IS NOT NULL AND o.first_order_date IS NOT NULL AND (o.last_order_date - o.first_order_date) > 0
              THEN o.order_count::NUMERIC / ((o.last_order_date - o.first_order_date) / 30.0)
            ELSE 0
          END AS order_frequency,
          COALESCE(o.active_months, 0) AS active_months,
          COALESCE(cat.product_categories_count, 0) AS product_categories_count,
          CASE WHEN o.last_order_date IS NOT NULL THEN (CURRENT_DATE - o.last_order_date) ELSE NULL END AS recency_days
        FROM customers c
        LEFT JOIN order_aggs o ON c.customer_id = o.customer_id
        LEFT JOIN category_aggs cat ON c.customer_id = cat.customer_id;
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
