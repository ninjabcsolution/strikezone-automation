-- Phase 2 Database Schema (Analytics & Intelligence Layer)

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
    trait_category VARCHAR(50),
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
    tier VARCHAR(10),
    reason_codes TEXT[],
    source VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lookalike_targets_tier ON lookalike_targets(tier);
CREATE INDEX idx_lookalike_targets_score ON lookalike_targets(similarity_score DESC);
CREATE INDEX idx_lookalike_targets_status ON lookalike_targets(status);
