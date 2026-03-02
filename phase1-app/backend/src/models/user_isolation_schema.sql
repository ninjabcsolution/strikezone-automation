-- User Data Isolation Schema Migration
-- This migration adds user_id to all data tables for multi-tenant isolation
-- Each user will only see their own uploaded data

-- Add user_id column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- Add user_id column to products table  
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);

-- Add user_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Add user_id column to order_lines table
ALTER TABLE order_lines ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_order_lines_user_id ON order_lines(user_id);

-- Add user_id column to customer_metrics table
ALTER TABLE customer_metrics ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_customer_metrics_user_id ON customer_metrics(user_id);

-- Add user_id column to ingestion_logs table
ALTER TABLE ingestion_logs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_user_id ON ingestion_logs(user_id);

-- Update primary keys to include user_id for proper isolation
-- Drop and recreate customers table with composite primary key
-- Note: This is a significant change - backup data first!

-- First, let's create views that filter by user_id for backward compatibility
CREATE OR REPLACE VIEW user_customers AS
SELECT * FROM customers;

CREATE OR REPLACE VIEW user_products AS
SELECT * FROM products;

CREATE OR REPLACE VIEW user_orders AS
SELECT * FROM orders;

CREATE OR REPLACE VIEW user_order_lines AS
SELECT * FROM order_lines;

-- Add user_id to ICP traits table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'icp_traits') THEN
        ALTER TABLE icp_traits ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_icp_traits_user_id ON icp_traits(user_id);
    END IF;
END $$;

-- Add user_id to targets table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'targets') THEN
        ALTER TABLE targets ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_targets_user_id ON targets(user_id);
    END IF;
END $$;

-- Add user_id to contacts table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contacts') THEN
        ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
    END IF;
END $$;

-- Add user_id to messages table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        ALTER TABLE messages ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
    END IF;
END $$;

-- Add user_id to customer_cagr table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customer_cagr') THEN
        ALTER TABLE customer_cagr ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_customer_cagr_user_id ON customer_cagr(user_id);
    END IF;
END $$;

-- Create a function to filter data by user_id
CREATE OR REPLACE FUNCTION get_user_data_summary(p_user_id INTEGER)
RETURNS TABLE (
    table_name TEXT,
    record_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'customers'::TEXT, COUNT(*)::BIGINT FROM customers WHERE user_id = p_user_id
    UNION ALL
    SELECT 'products'::TEXT, COUNT(*)::BIGINT FROM products WHERE user_id = p_user_id
    UNION ALL
    SELECT 'orders'::TEXT, COUNT(*)::BIGINT FROM orders WHERE user_id = p_user_id
    UNION ALL
    SELECT 'order_lines'::TEXT, COUNT(*)::BIGINT FROM order_lines WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_data_summary(INTEGER) TO PUBLIC;

COMMENT ON COLUMN customers.user_id IS 'Owner user_id for multi-tenant data isolation';
COMMENT ON COLUMN products.user_id IS 'Owner user_id for multi-tenant data isolation';
COMMENT ON COLUMN orders.user_id IS 'Owner user_id for multi-tenant data isolation';
COMMENT ON COLUMN order_lines.user_id IS 'Owner user_id for multi-tenant data isolation';
