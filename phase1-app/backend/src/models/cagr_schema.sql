-- CAGR Schema Migration
-- Adds 3-year CAGR columns to customer_metrics table

-- Add CAGR columns to customer_metrics
ALTER TABLE customer_metrics 
ADD COLUMN IF NOT EXISTS revenue_year_1 NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_year_2 NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_year_3 NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin_year_1 NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin_year_2 NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS margin_year_3 NUMERIC(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cagr_3yr NUMERIC(8, 4) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS margin_cagr_3yr NUMERIC(8, 4) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_consistent_grower BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS growth_trend VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_top_20_by_cagr BOOLEAN DEFAULT FALSE;

-- Add index for CAGR-based queries
CREATE INDEX IF NOT EXISTS idx_customer_metrics_cagr ON customer_metrics(cagr_3yr DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_cagr_top20 ON customer_metrics(is_top_20_by_cagr);

-- Add comments
COMMENT ON COLUMN customer_metrics.revenue_year_1 IS '3 years ago revenue';
COMMENT ON COLUMN customer_metrics.revenue_year_2 IS '2 years ago revenue';
COMMENT ON COLUMN customer_metrics.revenue_year_3 IS 'Last year revenue (most recent)';
COMMENT ON COLUMN customer_metrics.cagr_3yr IS '3-year compound annual growth rate';
COMMENT ON COLUMN customer_metrics.is_consistent_grower IS 'True if Year3 > Year2 > Year1';
COMMENT ON COLUMN customer_metrics.growth_trend IS 'growing, declining, stable, or new';
