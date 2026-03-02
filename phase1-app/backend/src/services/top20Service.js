const { pool } = require('../config/database');

class Top20Service {
  // Helper to build user filter clause
  _userFilter(alias, userId, paramNum = 1) {
    if (!userId) return { clause: '', params: [] };
    return { 
      clause: ` AND ${alias}.user_id = $${paramNum}`, 
      params: [userId] 
    };
  }

  // Calculate 3-Year CAGR for all customers (filtered by user)
  async calculateCAGR(userId = null) {
    const client = await pool.connect();
    try {
      // Get the most recent year in the data (for this user)
      // Try order_lines first (has more data), fallback to orders
      let yearQuery = 'SELECT EXTRACT(YEAR FROM MAX(order_date))::INTEGER as max_year FROM order_lines';
      let yearParams = [];
      if (userId) {
        yearQuery += ' WHERE user_id = $1';
        yearParams = [userId];
      }
      let yearResult = await client.query(yearQuery, yearParams);
      let currentYear = yearResult.rows[0]?.max_year;
      
      // If no order_lines data, try orders table
      if (!currentYear) {
        yearQuery = 'SELECT EXTRACT(YEAR FROM MAX(order_date))::INTEGER as max_year FROM orders';
        if (userId) {
          yearQuery += ' WHERE user_id = $1';
        }
        yearResult = await client.query(yearQuery, yearParams);
        currentYear = yearResult.rows[0]?.max_year || new Date().getFullYear();
      }
      
      // Calculate yearly revenue and margin per customer using order_lines (filtered by user)
      const userWhere = userId ? 'WHERE ol.user_id = $2' : '';
      const params = userId ? [currentYear, userId] : [currentYear];
      
      await client.query(`
        WITH yearly_data AS (
          SELECT 
            customer_id,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 - 2 THEN line_revenue ELSE 0 END) as rev_y1,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 - 1 THEN line_revenue ELSE 0 END) as rev_y2,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 THEN line_revenue ELSE 0 END) as rev_y3,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 - 2 THEN (line_revenue - COALESCE(line_cogs, 0)) ELSE 0 END) as margin_y1,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 - 1 THEN (line_revenue - COALESCE(line_cogs, 0)) ELSE 0 END) as margin_y2,
            SUM(CASE WHEN EXTRACT(YEAR FROM order_date) = $1 THEN (line_revenue - COALESCE(line_cogs, 0)) ELSE 0 END) as margin_y3
          FROM order_lines ol
          ${userWhere}
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
          cagr_3yr = CASE 
            WHEN yd.rev_y1 > 0 AND yd.rev_y3 > 0 
            THEN POWER(yd.rev_y3 / yd.rev_y1, 1.0/2.0) - 1
            WHEN yd.rev_y1 = 0 AND yd.rev_y3 > 0 THEN 1.0
            ELSE NULL
          END,
          margin_cagr_3yr = CASE 
            WHEN yd.margin_y1 > 0 AND yd.margin_y3 > 0 
            THEN POWER(yd.margin_y3 / yd.margin_y1, 1.0/2.0) - 1
            ELSE NULL
          END,
          is_consistent_grower = (yd.rev_y3 > yd.rev_y2 AND yd.rev_y2 > yd.rev_y1 AND yd.rev_y1 > 0),
          growth_trend = CASE
            WHEN yd.rev_y1 = 0 AND yd.rev_y2 = 0 AND yd.rev_y3 > 0 THEN 'new'
            WHEN yd.rev_y3 > yd.rev_y1 * 1.1 THEN 'growing'
            WHEN yd.rev_y3 < yd.rev_y1 * 0.9 THEN 'declining'
            ELSE 'stable'
          END,
          updated_at = CURRENT_TIMESTAMP
        FROM yearly_data yd
        WHERE cm.customer_id = yd.customer_id ${userId ? 'AND cm.user_id = $2' : ''}
      `, params);

      // Calculate Top 20% by CAGR (for this user)
      let totalQuery = `
        SELECT COUNT(*) as count FROM customer_metrics 
        WHERE cagr_3yr IS NOT NULL AND revenue_year_1 > 0
      `;
      let totalParams = [];
      if (userId) {
        totalQuery += ' AND user_id = $1';
        totalParams = [userId];
      }
      const totalWithCagr = await client.query(totalQuery, totalParams);
      const top20CagrCount = Math.ceil(totalWithCagr.rows[0].count * 0.2);

      const rankParams = userId ? [top20CagrCount, userId] : [top20CagrCount];
      const rankUserWhere = userId ? 'WHERE cagr_3yr IS NOT NULL AND revenue_year_1 > 0 AND user_id = $2' : 'WHERE cagr_3yr IS NOT NULL AND revenue_year_1 > 0';
      
      await client.query(`
        WITH cagr_ranked AS (
          SELECT customer_id, ROW_NUMBER() OVER (ORDER BY cagr_3yr DESC NULLS LAST) as rank
          FROM customer_metrics 
          ${rankUserWhere}
        )
        UPDATE customer_metrics cm
        SET is_top_20_by_cagr = (cr.rank <= $1)
        FROM cagr_ranked cr
        WHERE cm.customer_id = cr.customer_id ${userId ? 'AND cm.user_id = $2' : ''}
      `, rankParams);

      return { 
        currentYear, 
        customersWithCagr: totalWithCagr.rows[0].count,
        top20ByCagrCount: top20CagrCount 
      };
    } finally {
      client.release();
    }
  }

  // Get CAGR analysis data (filtered by user)
  async getCAGRAnalysis({ topOnly = false, consistentOnly = false, limit = 100, userId = null }) {
    // If no userId, return empty data - require login for data access
    if (!userId) {
      return {
        customers: [],
        summary: {
          avgCagrTop20: '0.0000',
          avgCagrOthers: '0.0000',
          consistentGrowers: 0,
          growingCount: 0,
          decliningCount: 0,
          stableCount: 0,
          newCount: 0
        }
      };
    }
    
    let whereConditions = ['cagr_3yr IS NOT NULL'];
    let params = [];
    let paramNum = 1;
    
    if (topOnly) whereConditions.push('is_top_20_by_cagr = true');
    if (consistentOnly) whereConditions.push('is_consistent_grower = true');
    
    // Always filter by userId when provided
    whereConditions.push(`cm.user_id = $${paramNum}`);
    params.push(userId);
    paramNum++;
    
    params.push(limit);
    
    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const result = await pool.query(`
      SELECT 
        cm.customer_id, c.customer_name, c.industry, c.state,
        cm.revenue_year_1, cm.revenue_year_2, cm.revenue_year_3,
        cm.margin_year_1, cm.margin_year_2, cm.margin_year_3,
        cm.cagr_3yr, cm.margin_cagr_3yr, cm.is_consistent_grower,
        cm.growth_trend, cm.is_top_20, cm.is_top_20_by_cagr,
        cm.total_revenue, cm.total_gross_margin
      FROM customer_metrics cm
      JOIN customers c ON cm.customer_id = c.customer_id AND c.user_id = cm.user_id
      ${whereClause}
      ORDER BY cm.cagr_3yr DESC NULLS LAST
      LIMIT $${paramNum}
    `, params);

    // Summary stats
    let summaryWhere = 'WHERE cagr_3yr IS NOT NULL';
    let summaryParams = [];
    if (userId) {
      summaryWhere += ' AND user_id = $1';
      summaryParams = [userId];
    }
    
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
      ${summaryWhere}
    `, summaryParams);

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

  // Get Top 20% vs 80% Comparison (filtered by user)
  async getTop20Comparison(rankBy = 'margin', userId = null) {
    // If no userId, return empty comparison - require login for data access
    if (!userId) {
      return {
        rankBy,
        top20: { count: 0, totalRevenue: 0, totalMargin: 0, avgRevenue: 0, avgMargin: 0, avgOrderValue: 0, avgOrderCount: 0, avgOrderFrequency: 0, avgMarginPercent: 0, avgCagr: 0, avgDaysAsCustomer: 0 },
        others: { count: 0, totalRevenue: 0, totalMargin: 0, avgRevenue: 0, avgMargin: 0, avgOrderValue: 0, avgOrderCount: 0, avgOrderFrequency: 0, avgMarginPercent: 0, avgCagr: 0, avgDaysAsCustomer: 0 },
        industries: [],
        states: [],
        differentiators: []
      };
    }
    
    const isTop20Field = rankBy === 'cagr' ? 'is_top_20_by_cagr' : 'is_top_20';
    
    const userWhere = ' AND cm.user_id = $1';
    const params = [userId];
    
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
      FROM customer_metrics cm
      WHERE total_gross_margin > 0 ${userWhere}
      GROUP BY ${isTop20Field}
    `, params);

    const top20Data = metricsResult.rows.find(r => r.is_top === true) || {};
    const othersData = metricsResult.rows.find(r => r.is_top === false) || {};

    // Industry distribution
    const industryResult = await pool.query(`
      SELECT 
        c.industry,
        COUNT(*) FILTER (WHERE cm.${isTop20Field} = true) as top20_count,
        COUNT(*) FILTER (WHERE cm.${isTop20Field} = false OR cm.${isTop20Field} IS NULL) as others_count
      FROM customer_metrics cm
      JOIN customers c ON cm.customer_id = c.customer_id AND c.user_id = cm.user_id
      WHERE c.industry IS NOT NULL AND c.industry <> '' ${userWhere}
      GROUP BY c.industry
      ORDER BY top20_count DESC
      LIMIT 10
    `, params);

    // State distribution
    const stateResult = await pool.query(`
      SELECT 
        c.state,
        COUNT(*) FILTER (WHERE cm.${isTop20Field} = true) as top20_count,
        COUNT(*) FILTER (WHERE cm.${isTop20Field} = false OR cm.${isTop20Field} IS NULL) as others_count
      FROM customer_metrics cm
      JOIN customers c ON cm.customer_id = c.customer_id AND c.user_id = cm.user_id
      WHERE c.state IS NOT NULL AND c.state <> '' ${userWhere}
      GROUP BY c.state
      ORDER BY top20_count DESC
      LIMIT 10
    `, params);

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
    
    if (top20.avg_order_value && others.avg_order_value && others.avg_order_value > 0) {
      const ratio = (top20.avg_order_value / others.avg_order_value).toFixed(1);
      if (ratio > 1.2) {
        diffs.push(`Top 20% have ${ratio}x higher average order value`);
      }
    }

    if (top20.avg_order_frequency && others.avg_order_frequency && others.avg_order_frequency > 0) {
      const ratio = (top20.avg_order_frequency / others.avg_order_frequency).toFixed(1);
      if (ratio > 1.2) {
        diffs.push(`Top 20% order ${ratio}x more frequently`);
      }
    }

    if (top20.avg_margin_percent && others.avg_margin_percent) {
      const diff = (top20.avg_margin_percent - others.avg_margin_percent).toFixed(1);
      if (diff > 2) {
        diffs.push(`Top 20% have ${diff}% higher gross margin`);
      }
    }

    if (top20.avg_cagr && others.avg_cagr) {
      const topCagr = (top20.avg_cagr * 100).toFixed(1);
      const othersCagr = (others.avg_cagr * 100).toFixed(1);
      diffs.push(`Top 20% avg CAGR: ${topCagr}% vs Others: ${othersCagr}%`);
    }

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

    if (top20.avg_days_as_customer && others.avg_days_as_customer && others.avg_days_as_customer > 0) {
      const topYears = (top20.avg_days_as_customer / 365).toFixed(1);
      const othersYears = (others.avg_days_as_customer / 365).toFixed(1);
      diffs.push(`Top 20% avg tenure: ${topYears} years vs Others: ${othersYears} years`);
    }

    return diffs.slice(0, 6);
  }

  // Calculate customer metrics (filtered by user)
  async calculateCustomerMetrics(userId = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Only delete metrics for this user (or all if no user specified)
      if (userId) {
        await client.query('DELETE FROM customer_metrics WHERE user_id = $1', [userId]);
      } else {
        await client.query('TRUNCATE TABLE customer_metrics');
      }
      
      const userWhere = userId ? 'WHERE user_id = $1' : '';
      const userWhereAnd = userId ? 'AND user_id = $1' : '';
      const params = userId ? [userId] : [];
      
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
          ${userWhere}
          GROUP BY customer_id
        ),
        category_aggs AS (
          SELECT
            customer_id,
            COUNT(DISTINCT product_category) AS product_categories_count
          FROM order_lines
          WHERE product_category IS NOT NULL AND product_category <> '' ${userWhereAnd}
          GROUP BY customer_id
        )
        INSERT INTO customer_metrics (
          customer_id, total_revenue, total_gross_margin, gross_margin_percent,
          order_count, avg_order_value, first_order_date, last_order_date,
          days_as_customer, order_frequency, active_months, product_categories_count, recency_days, user_id
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
          CASE WHEN o.last_order_date IS NOT NULL THEN (CURRENT_DATE - o.last_order_date) ELSE NULL END AS recency_days,
          ${userId ? '$1' : 'c.user_id'}
        FROM customers c
        LEFT JOIN order_aggs o ON c.customer_id = o.customer_id
        LEFT JOIN category_aggs cat ON c.customer_id = cat.customer_id
        ${userWhere};
      `, params);

      const consistencyWhere = userId ? 'WHERE user_id = $1' : '';
      await client.query(`
        UPDATE customer_metrics
        SET consistency_score = CASE WHEN days_as_customer > 0 THEN (active_months::NUMERIC / GREATEST((days_as_customer / 30.0), 1)) * 100 ELSE 0 END
        ${consistencyWhere}
      `, params);

      const totalQuery = userId 
        ? 'SELECT COUNT(*) as count FROM customer_metrics WHERE total_gross_margin > 0 AND user_id = $1'
        : 'SELECT COUNT(*) as count FROM customer_metrics WHERE total_gross_margin > 0';
      const totalCustomers = await client.query(totalQuery, params);
      const top20Count = Math.ceil(totalCustomers.rows[0].count * 0.2);

      const rankWhere = userId ? 'WHERE total_gross_margin > 0 AND user_id = $2' : 'WHERE total_gross_margin > 0';
      const rankParams = userId ? [top20Count, userId] : [top20Count];
      
      await client.query(`
        WITH ranked_customers AS (
          SELECT customer_id, ROW_NUMBER() OVER (ORDER BY total_gross_margin DESC) as rank
          FROM customer_metrics ${rankWhere}
        )
        UPDATE customer_metrics cm
        SET percentile_rank = rc.rank, is_top_20 = (rc.rank <= $1)
        FROM ranked_customers rc
        WHERE cm.customer_id = rc.customer_id ${userId ? 'AND cm.user_id = $2' : ''}
      `, rankParams);

      await client.query('COMMIT');
      return await this.getTop20Stats(userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get stats (filtered by user)
  async getTop20Stats(userId = null) {
    // If no userId, return empty stats - require login for data access
    if (!userId) {
      return {
        top20Count: 0,
        totalCustomers: 0,
        top20Contribution: 0,
        top20AvgMargin: 0,
        othersAvgMargin: 0,
      };
    }
    
    const whereClause = 'WHERE user_id = $1';
    const params = [userId];
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_top_20 = true) as top20_count,
        COUNT(*) as total_customers,
        SUM(total_gross_margin) FILTER (WHERE is_top_20 = true) as top20_margin,
        SUM(total_gross_margin) as total_margin,
        AVG(total_gross_margin) FILTER (WHERE is_top_20 = true) as top20_avg_margin,
        AVG(total_gross_margin) FILTER (WHERE is_top_20 = false) as others_avg_margin
      FROM customer_metrics
      ${whereClause}
    `, params);

    const stats = result.rows[0];
    return {
      top20Count: parseInt(stats.top20_count || 0),
      totalCustomers: parseInt(stats.total_customers || 0),
      top20Contribution: stats.total_margin > 0 ? ((stats.top20_margin / stats.total_margin) * 100).toFixed(2) : 0,
      top20AvgMargin: parseFloat(stats.top20_avg_margin || 0).toFixed(2),
      othersAvgMargin: parseFloat(stats.others_avg_margin || 0).toFixed(2),
    };
  }

  // Get top 20 customers (filtered by user)
  async getTop20Customers(limit = 24, userId = null) {
    // If no userId, return empty array - require login for data access
    if (!userId) {
      return [];
    }
    
    const whereClause = 'WHERE cm.is_top_20 = true AND cm.user_id = $2';
    const params = [limit, userId];
    
    const result = await pool.query(`
      SELECT cm.*, c.customer_name, c.industry, c.state, c.city
      FROM customer_metrics cm
      JOIN customers c ON cm.customer_id = c.customer_id AND c.user_id = cm.user_id
      ${whereClause}
      ORDER BY cm.total_gross_margin DESC
      LIMIT $1
    `, params);
    return result.rows;
  }
}

module.exports = new Top20Service();
