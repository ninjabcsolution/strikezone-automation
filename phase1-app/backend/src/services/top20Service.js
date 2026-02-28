const { pool } = require('../config/database');

class Top20Service {
  // Calculate 3-Year CAGR for all customers
  async calculateCAGR() {
    const client = await pool.connect();
    try {
      // Get the most recent year in the data
      const yearResult = await client.query(`
        SELECT EXTRACT(YEAR FROM MAX(order_date))::INTEGER as max_year
        FROM orders
      `);
      const currentYear = yearResult.rows[0]?.max_year || new Date().getFullYear();
      
      // Calculate yearly revenue and margin per customer
      await client.query(`
        WITH yearly_data AS (
          SELECT 
            customer_id,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 - 2 THEN order_revenue ELSE 0 END) as rev_y1,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 - 1 THEN order_revenue ELSE 0 END) as rev_y2,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 THEN order_revenue ELSE 0 END) as rev_y3,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 - 2 THEN gross_margin ELSE 0 END) as margin_y1,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 - 1 THEN gross_margin ELSE 0 END) as margin_y2,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 THEN gross_margin ELSE 0 END) as margin_y3
          FROM orders
          GROUP BY customer_id
        )
        UPDATE customer_metrics cm
        SET 
          revenue_year_1 = COALESCE(yd.rev_y1, 0),
          revenue_year_2 = COALESCE(yd.rev_y2, 0),
          revenue_year_3 = COALESCE(yd.rev_y3, 0),
          margin_year_1 = COALESCE(yd.margin_y1, 0),
          margin_year_2 = COALESCE(yd.margin_y2, 0),
          margin_year_3 = COALESCE(yd.margin_y3, 0),
          -- CAGR formula: ((End/Start)^(1/n)) - 1, using 3 years
          cagr_3yr = CASE 
            WHEN yd.rev_y1 > 0 AND yd.rev_y3 > 0 
            THEN POWER(yd.rev_y3 / yd.rev_y1, 1.0/3.0) - 1
            WHEN yd.rev_y1 = 0 AND yd.rev_y3 > 0 THEN 1.0  -- 100% growth (new customer)
            ELSE NULL
          END,
          margin_cagr_3yr = CASE 
            WHEN yd.margin_y1 > 0 AND yd.margin_y3 > 0 
            THEN POWER(yd.margin_y3 / yd.margin_y1, 1.0/3.0) - 1
            ELSE NULL
          END,
          -- Consistent grower: each year higher than previous
          is_consistent_grower = (yd.rev_y3 > yd.rev_y2 AND yd.rev_y2 > yd.rev_y1 AND yd.rev_y1 > 0),
          -- Growth trend classification
          growth_trend = CASE
            WHEN yd.rev_y1 = 0 AND yd.rev_y2 = 0 AND yd.rev_y3 > 0 THEN 'new'
            WHEN yd.rev_y3 > yd.rev_y1 * 1.1 THEN 'growing'
            WHEN yd.rev_y3 < yd.rev_y1 * 0.9 THEN 'declining'
            ELSE 'stable'
          END,
          updated_at = CURRENT_TIMESTAMP
        FROM yearly_data yd
        WHERE cm.customer_id = yd.customer_id
      `, [currentYear]);

      // Calculate Top 20% by CAGR
      const totalWithCagr = await client.query(`
        SELECT COUNT(*) as count FROM customer_metrics 
        WHERE cagr_3yr IS NOT NULL AND revenue_year_1 > 0
      `);
      const top20CagrCount = Math.ceil(totalWithCagr.rows[0].count * 0.2);

      await client.query(`
        WITH cagr_ranked AS (
          SELECT customer_id, ROW_NUMBER() OVER (ORDER BY cagr_3yr DESC NULLS LAST) as rank
          FROM customer_metrics 
          WHERE cagr_3yr IS NOT NULL AND revenue_year_1 > 0
        )
        UPDATE customer_metrics cm
        SET is_top_20_by_cagr = (cr.rank <= $1)
        FROM cagr_ranked cr
        WHERE cm.customer_id = cr.customer_id
      `, [top20CagrCount]);

      return { 
        currentYear, 
        customersWithCagr: totalWithCagr.rows[0].count,
        top20ByCagrCount: top20CagrCount 
      };
    } finally {
      client.release();
    }
  }

  // Get CAGR analysis data
  async getCAGRAnalysis({ topOnly = false, consistentOnly = false, limit = 100 }) {
    let whereClause = 'WHERE cagr_3yr IS NOT NULL';
    if (topOnly) whereClause += ' AND is_top_20_by_cagr = true';
    if (consistentOnly) whereClause += ' AND is_consistent_grower = true';

    const result = await pool.query(`
      SELECT 
        cm.customer_id, c.customer_name, c.industry, c.state,
        cm.revenue_year_1, cm.revenue_year_2, cm.revenue_year_3,
        cm.margin_year_1, cm.margin_year_2, cm.margin_year_3,
        cm.cagr_3yr, cm.margin_cagr_3yr, cm.is_consistent_grower,
        cm.growth_trend, cm.is_top_20, cm.is_top_20_by_cagr,
        cm.total_revenue, cm.total_gross_margin
      FROM customer_metrics cm
      JOIN customers c ON cm.customer_id = c.customer_id
      ${whereClause}
      ORDER BY cm.cagr_3yr DESC NULLS LAST
      LIMIT $1
    `, [limit]);

    // Summary stats
    const summaryResult = await pool.query(`
      SELECT 
        AVG(cagr_3yr) FILTER (WHERE is_top_20_by_cagr = true) as avg_cagr_top20,
        AVG(cagr_3yr) FILTER (WHERE is_top_20_by_cagr = false) as avg_cagr_others,
        COUNT(*) FILTER (WHERE is_consistent_grower = true) as consistent_growers,
        COUNT(*) FILTER (WHERE growth_trend = 'growing') as growing_count,
        COUNT(*) FILTER (WHERE growth_trend = 'declining') as declining_count,
        COUNT(*) FILTER (WHERE growth_trend = 'stable') as stable_count,
        COUNT(*) FILTER (WHERE growth_trend = 'new') as new_count
      FROM customer_metrics
      WHERE cagr_3yr IS NOT NULL
    `);

    return {
      customers: result.rows,
      summary: {
        avgCagrTop20: parseFloat(summaryResult.rows[0].avg_cagr_top20 || 0).toFixed(4),
        avgCagrOthers: parseFloat(summaryResult.rows[0].avg_cagr_others || 0).toFixed(4),
        consistentGrowers: parseInt(summaryResult.rows[0].consistent_growers || 0),
        growingCount: parseInt(summaryResult.rows[0].growing_count || 0),
        decliningCount: parseInt(summaryResult.rows[0].declining_count || 0),
        stableCount: parseInt(summaryResult.rows[0].stable_count || 0),
        newCount: parseInt(summaryResult.rows[0].new_count || 0)
      }
    };
  }

  // Get Top 20% vs 80% Comparison
  async getTop20Comparison(rankBy = 'margin') {
    const isTop20Field = rankBy === 'cagr' ? 'is_top_20_by_cagr' : 'is_top_20';
    
    // Aggregate metrics for both groups
    const metricsResult = await pool.query(`
      SELECT 
        ${isTop20Field} as is_top,
        COUNT(*) as customer_count,
        SUM(total_revenue) as total_revenue,
        SUM(total_gross_margin) as total_margin,
        AVG(total_revenue) as avg_revenue,
        AVG(total_gross_margin) as avg_margin,
        AVG(avg_order_value) as avg_order_value,
        AVG(order_count) as avg_order_count,
        AVG(order_frequency) as avg_order_frequency,
        AVG(gross_margin_percent) as avg_margin_percent,
        AVG(cagr_3yr) as avg_cagr,
        AVG(days_as_customer) as avg_days_as_customer
      FROM customer_metrics
      WHERE total_gross_margin > 0
      GROUP BY ${isTop20Field}
    `);

    const top20Data = metricsResult.rows.find(r => r.is_top === true) || {};
    const othersData = metricsResult.rows.find(r => r.is_top === false) || {};

    // Industry distribution
    const industryResult = await pool.query(`
      SELECT 
        c.industry,
        COUNT(*) FILTER (WHERE cm.${isTop20Field} = true) as top20_count,
        COUNT(*) FILTER (WHERE cm.${isTop20Field} = false OR cm.${isTop20Field} IS NULL) as others_count
      FROM customer_metrics cm
      JOIN customers c ON cm.customer_id = c.customer_id
      WHERE c.industry IS NOT NULL AND c.industry <> ''
      GROUP BY c.industry
      ORDER BY top20_count DESC
      LIMIT 10
    `);

    // State distribution
    const stateResult = await pool.query(`
      SELECT 
        c.state,
        COUNT(*) FILTER (WHERE cm.${isTop20Field} = true) as top20_count,
        COUNT(*) FILTER (WHERE cm.${isTop20Field} = false OR cm.${isTop20Field} IS NULL) as others_count
      FROM customer_metrics cm
      JOIN customers c ON cm.customer_id = c.customer_id
      WHERE c.state IS NOT NULL AND c.state <> ''
      GROUP BY c.state
      ORDER BY top20_count DESC
      LIMIT 10
    `);

    // Calculate differentiators
    const differentiators = this._generateDifferentiators(top20Data, othersData, industryResult.rows);

    return {
      rankBy,
      top20: {
        count: parseInt(top20Data.customer_count || 0),
        totalRevenue: parseFloat(top20Data.total_revenue || 0),
        totalMargin: parseFloat(top20Data.total_margin || 0),
        avgRevenue: parseFloat(top20Data.avg_revenue || 0),
        avgMargin: parseFloat(top20Data.avg_margin || 0),
        avgOrderValue: parseFloat(top20Data.avg_order_value || 0),
        avgOrderCount: parseFloat(top20Data.avg_order_count || 0),
        avgOrderFrequency: parseFloat(top20Data.avg_order_frequency || 0),
        avgMarginPercent: parseFloat(top20Data.avg_margin_percent || 0),
        avgCagr: parseFloat(top20Data.avg_cagr || 0),
        avgDaysAsCustomer: parseFloat(top20Data.avg_days_as_customer || 0)
      },
      others: {
        count: parseInt(othersData.customer_count || 0),
        totalRevenue: parseFloat(othersData.total_revenue || 0),
        totalMargin: parseFloat(othersData.total_margin || 0),
        avgRevenue: parseFloat(othersData.avg_revenue || 0),
        avgMargin: parseFloat(othersData.avg_margin || 0),
        avgOrderValue: parseFloat(othersData.avg_order_value || 0),
        avgOrderCount: parseFloat(othersData.avg_order_count || 0),
        avgOrderFrequency: parseFloat(othersData.avg_order_frequency || 0),
        avgMarginPercent: parseFloat(othersData.avg_margin_percent || 0),
        avgCagr: parseFloat(othersData.avg_cagr || 0),
        avgDaysAsCustomer: parseFloat(othersData.avg_days_as_customer || 0)
      },
      industries: industryResult.rows,
      states: stateResult.rows,
      differentiators
    };
  }

  _generateDifferentiators(top20, others, industries) {
    const diffs = [];
    
    // Order value comparison
    if (top20.avg_order_value && others.avg_order_value && others.avg_order_value > 0) {
      const ratio = (top20.avg_order_value / others.avg_order_value).toFixed(1);
      if (ratio > 1.2) {
        diffs.push(`Top 20% have ${ratio}x higher average order value`);
      }
    }

    // Order frequency comparison
    if (top20.avg_order_frequency && others.avg_order_frequency && others.avg_order_frequency > 0) {
      const ratio = (top20.avg_order_frequency / others.avg_order_frequency).toFixed(1);
      if (ratio > 1.2) {
        diffs.push(`Top 20% order ${ratio}x more frequently`);
      }
    }

    // Margin percent comparison
    if (top20.avg_margin_percent && others.avg_margin_percent) {
      const diff = (top20.avg_margin_percent - others.avg_margin_percent).toFixed(1);
      if (diff > 2) {
        diffs.push(`Top 20% have ${diff}% higher gross margin`);
      }
    }

    // CAGR comparison
    if (top20.avg_cagr && others.avg_cagr) {
      const topCagr = (top20.avg_cagr * 100).toFixed(1);
      const othersCagr = (others.avg_cagr * 100).toFixed(1);
      diffs.push(`Top 20% avg CAGR: ${topCagr}% vs Others: ${othersCagr}%`);
    }

    // Industry concentration
    if (industries.length > 0) {
      const topIndustry = industries[0];
      const top20Total = parseInt(top20.customer_count || 1);
      const othersTotal = parseInt(others.customer_count || 1);
      const top20Pct = ((topIndustry.top20_count / top20Total) * 100).toFixed(0);
      const othersPct = ((topIndustry.others_count / othersTotal) * 100).toFixed(0);
      if (top20Pct > othersPct * 1.5) {
        diffs.push(`${topIndustry.industry} represents ${top20Pct}% of Top 20% vs ${othersPct}% of others`);
      }
    }

    // Tenure comparison
    if (top20.avg_days_as_customer && others.avg_days_as_customer && others.avg_days_as_customer > 0) {
      const topYears = (top20.avg_days_as_customer / 365).toFixed(1);
      const othersYears = (others.avg_days_as_customer / 365).toFixed(1);
      diffs.push(`Top 20% avg tenure: ${topYears} years vs Others: ${othersYears} years`);
    }

    return diffs.slice(0, 6); // Return top 6 differentiators
  }

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
