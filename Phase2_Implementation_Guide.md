# Phase 2 Implementation Guide — Intelligence Layer
## Top 20% Engine + ICP Extraction + Look-Alike Generation (Weeks 3–6)

**Goal:** Automate customer intelligence and look-alike targeting

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Phase 2 Architecture                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (React)                                           │
│    └─ Analytics Dashboard                                   │
│                                                             │
│  Backend API (Node.js)                                      │
│    ├─ /api/analytics/top20                                 │
│    ├─ /api/analytics/icp                                   │
│    └─ /api/lookalike/generate                              │
│                                                             │
│  Services                                                   │
│    ├─ Top20Service (Week 3)                                │
│    ├─ ICPService (Week 4)                                  │
│    └─ LookAlikeService (Weeks 5-6)                         │
│                                                             │
│  Database (PostgreSQL)                                      │
│    ├─ New: customer_metrics                                │
│    ├─ New: icp_traits                                      │
│    └─ New: lookalike_targets                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Week 3: Top 20% Engine

### Step 1: Extend Database Schema

Add new tables for analytics:

#### Create `backend/src/models/phase2_schema.sql`

```sql
-- Customer metrics (aggregated data)
CREATE TABLE IF NOT EXISTS customer_metrics (
    customer_id VARCHAR(50) PRIMARY KEY REFERENCES customers(customer_id),
    total_revenue NUMERIC(15, 2),
    total_gross_margin NUMERIC(15, 2),
    gross_margin_percent NUMERIC(5, 2),
    order_count INTEGER,
    avg_order_value NUMERIC(15, 2),
    first_order_date DATE,
    last_order_date DATE,
    days_as_customer INTEGER,
    order_frequency NUMERIC(10, 2),
    active_months INTEGER,
    consistency_score NUMERIC(5, 2),
    product_categories_count INTEGER,
    recency_days INTEGER,
    is_top_20 BOOLEAN DEFAULT FALSE,
    percentile_rank INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_metrics_top20 ON customer_metrics(is_top_20);
CREATE INDEX idx_customer_metrics_margin ON customer_metrics(total_gross_margin DESC);
CREATE INDEX idx_customer_metrics_percentile ON customer_metrics(percentile_rank);

-- ICP traits (extracted patterns)
CREATE TABLE IF NOT EXISTS icp_traits (
    trait_id SERIAL PRIMARY KEY,
    trait_category VARCHAR(50), -- 'industry', 'geo', 'size', 'behavior', 'financial'
    trait_name VARCHAR(100),
    trait_value TEXT,
    top20_frequency NUMERIC(5, 2),
    others_frequency NUMERIC(5, 2),
    lift NUMERIC(10, 2),
    importance_score NUMERIC(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_icp_traits_category ON icp_traits(trait_category);
CREATE INDEX idx_icp_traits_importance ON icp_traits(importance_score DESC);

-- Look-alike targets
CREATE TABLE IF NOT EXISTS lookalike_targets (
    target_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255),
    domain VARCHAR(255),
    industry VARCHAR(100),
    naics VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50),
    employee_count INTEGER,
    annual_revenue NUMERIC(15, 2),
    similarity_score NUMERIC(5, 2),
    opportunity_score NUMERIC(5, 2),
    tier VARCHAR(10), -- 'A', 'B', 'C'
    reason_codes TEXT[],
    source VARCHAR(50), -- 'win_back', 'net_new'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'enriched', 'contacted'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lookalike_targets_tier ON lookalike_targets(tier);
CREATE INDEX idx_lookalike_targets_score ON lookalike_targets(similarity_score DESC);
CREATE INDEX idx_lookalike_targets_status ON lookalike_targets(status);
```

### Step 2: Top 20% Service

#### Create `backend/src/services/top20Service.js`

```javascript
const { pool } = require('../config/database');

class Top20Service {
  async calculateCustomerMetrics() {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Clear existing metrics
      await client.query('TRUNCATE TABLE customer_metrics');

      // Calculate comprehensive customer metrics
      await client.query(`
        INSERT INTO customer_metrics (
          customer_id,
          total_revenue,
          total_gross_margin,
          gross_margin_percent,
          order_count,
          avg_order_value,
          first_order_date,
          last_order_date,
          days_as_customer,
          order_frequency,
          active_months,
          product_categories_count,
          recency_days
        )
        SELECT 
          c.customer_id,
          COALESCE(SUM(o.order_revenue), 0) as total_revenue,
          COALESCE(SUM(o.gross_margin), 0) as total_gross_margin,
          CASE 
            WHEN SUM(o.order_revenue) > 0 
            THEN (SUM(o.gross_margin) / SUM(o.order_revenue) * 100)
            ELSE 0 
          END as gross_margin_percent,
          COUNT(o.order_id) as order_count,
          CASE 
            WHEN COUNT(o.order_id) > 0 
            THEN SUM(o.order_revenue) / COUNT(o.order_id)
            ELSE 0 
          END as avg_order_value,
          MIN(o.order_date) as first_order_date,
          MAX(o.order_date) as last_order_date,
          COALESCE(MAX(o.order_date) - MIN(o.order_date), 0) as days_as_customer,
          CASE 
            WHEN MAX(o.order_date) - MIN(o.order_date) > 0 
            THEN COUNT(o.order_id)::NUMERIC / ((MAX(o.order_date) - MIN(o.order_date)) / 30.0)
            ELSE 0 
          END as order_frequency,
          COUNT(DISTINCT DATE_TRUNC('month', o.order_date)) as active_months,
          COUNT(DISTINCT ol.product_category) as product_categories_count,
          CURRENT_DATE - MAX(o.order_date) as recency_days
        FROM customers c
        LEFT JOIN orders o ON c.customer_id = o.customer_id
        LEFT JOIN order_lines ol ON o.order_id = ol.order_id
        GROUP BY c.customer_id
      `);

      // Calculate consistency score (% of months with orders)
      await client.query(`
        UPDATE customer_metrics
        SET consistency_score = 
          CASE 
            WHEN days_as_customer > 0 
            THEN (active_months::NUMERIC / GREATEST((days_as_customer / 30.0), 1)) * 100
            ELSE 0 
          END
      `);

      // Identify Top 20% by gross margin
      const totalCustomers = await client.query(
        'SELECT COUNT(*) as count FROM customer_metrics WHERE total_gross_margin > 0'
      );
      const top20Count = Math.ceil(totalCustomers.rows[0].count * 0.2);

      // Assign rankings
      await client.query(`
        WITH ranked_customers AS (
          SELECT 
            customer_id,
            ROW_NUMBER() OVER (ORDER BY total_gross_margin DESC) as rank
          FROM customer_metrics
          WHERE total_gross_margin > 0
        )
        UPDATE customer_metrics cm
        SET 
          percentile_rank = rc.rank,
          is_top_20 = (rc.rank <= $1)
        FROM ranked_customers rc
        WHERE cm.customer_id = rc.customer_id
      `, [top20Count]);

      await client.query('COMMIT');

      // Get summary statistics
      const stats = await this.getTop20Stats();
      return stats;

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
        AVG(total_gross_margin) FILTER (WHERE is_top_20 = false) as others_avg_margin,
        AVG(order_frequency) FILTER (WHERE is_top_20 = true) as top20_avg_frequency,
        AVG(order_frequency) FILTER (WHERE is_top_20 = false) as others_avg_frequency,
        AVG(product_categories_count) FILTER (WHERE is_top_20 = true) as top20_avg_categories,
        AVG(product_categories_count) FILTER (WHERE is_top_20 = false) as others_avg_categories
      FROM customer_metrics
    `);

    const stats = result.rows[0];
    
    return {
      top20Count: parseInt(stats.top20_count),
      totalCustomers: parseInt(stats.total_customers),
      top20Contribution: stats.total_margin > 0 
        ? ((stats.top20_margin / stats.total_margin) * 100).toFixed(2) 
        : 0,
      top20AvgMargin: parseFloat(stats.top20_avg_margin || 0).toFixed(2),
      othersAvgMargin: parseFloat(stats.others_avg_margin || 0).toFixed(2),
      marginLift: stats.others_avg_margin > 0 
        ? (stats.top20_avg_margin / stats.others_avg_margin).toFixed(2) 
        : 0,
      top20AvgFrequency: parseFloat(stats.top20_avg_frequency || 0).toFixed(2),
      othersAvgFrequency: parseFloat(stats.others_avg_frequency || 0).toFixed(2),
      top20AvgCategories: parseFloat(stats.top20_avg_categories || 0).toFixed(2),
      othersAvgCategories: parseFloat(stats.others_avg_categories || 0).toFixed(2),
    };
  }

  async getTop20Customers(limit = 24) {
    const result = await pool.query(`
      SELECT 
        cm.*,
        c.customer_name,
        c.industry,
        c.state,
        c.city
      FROM customer_metrics cm
      JOIN customers c ON cm.customer_id = c.customer_id
      WHERE cm.is_top_20 = true
      ORDER BY cm.total_gross_margin DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  }

  async getAllCustomerMetrics() {
    const result = await pool.query(`
      SELECT 
        cm.*,
        c.customer_name,
        c.industry,
        c.state,
        c.city,
        c.employee_count,
        c.annual_revenue
      FROM customer_metrics cm
      JOIN customers c ON cm.customer_id = c.customer_id
      ORDER BY cm.total_gross_margin DESC
    `);

    return result.rows;
  }
}

module.exports = new Top20Service();
```

### Step 3: Top 20% API Routes

#### Create `backend/src/routes/analytics.js`

```javascript
const express = require('express');
const router = express.Router();
const top20Service = require('../services/top20Service');

// POST /api/analytics/calculate - Calculate customer metrics and Top 20%
router.post('/calculate', async (req, res) => {
  try {
    const stats = await top20Service.calculateCustomerMetrics();
    res.json({
      status: 'success',
      message: 'Customer metrics calculated successfully',
      stats,
    });
  } catch (error) {
    console.error('Calculate metrics error:', error);
    res.status(500).json({ error: 'Failed to calculate metrics', message: error.message });
  }
});

// GET /api/analytics/top20 - Get Top 20% customers
router.get('/top20', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 24;
    const customers = await top20Service.getTop20Customers(limit);
    const stats = await top20Service.getTop20Stats();
    
    res.json({
      status: 'success',
      stats,
      customers,
    });
  } catch (error) {
    console.error('Get Top 20% error:', error);
    res.status(500).json({ error: 'Failed to fetch Top 20%', message: error.message });
  }
});

// GET /api/analytics/customers - Get all customer metrics
router.get('/customers', async (req, res) => {
  try {
    const customers = await top20Service.getAllCustomerMetrics();
    res.json({
      status: 'success',
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers', message: error.message });
  }
});

// GET /api/analytics/stats - Get summary statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await top20Service.getTop20Stats();
    res.json({
      status: 'success',
      stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
  }
});

module.exports = router;
```

### Step 4: Update Server to Include Analytics Routes

#### Update `backend/src/server.js`

```javascript
// Add after existing routes
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);
```

---

## Testing Week 3 (Top 20% Engine)

```bash
# 1. Run Phase 2 schema
psql -U postgres -d strikezone_db -f backend/src/models/phase2_schema.sql

# 2. Restart backend
cd backend
npm run dev

# 3. Calculate metrics (after data is uploaded)
curl -X POST http://localhost:5000/api/analytics/calculate

# 4. Get Top 20% list
curl http://localhost:5000/api/analytics/top20

# 5. Get stats
curl http://localhost:5000/api/analytics/stats
```

---

## Week 3 Complete! ✅

**What works:**
- ✅ Customer metrics calculation
- ✅ Top 20% identification by margin
- ✅ Comprehensive customer analytics
- ✅ API endpoints for retrieving results

**Next:** Week 4 - ICP Extraction (continue in Part 2)
