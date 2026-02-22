-- Authentication Schema
-- Users and multi-tenancy support

-- Users table
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- Add user_id to existing tables
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id);
ALTER TABLE order_lines ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id);
ALTER TABLE customer_metrics ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id);
ALTER TABLE ingestion_logs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(user_id);

-- Create indexes for user_id lookups
CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_lines_user ON order_lines(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_metrics_user ON customer_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_user ON ingestion_logs(user_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, company_name, role, status)
VALUES (
    'admin@strikezone.io',
    '$2b$10$rQZ5QH.qKv5R5Y5Z5Y5Z5OqQY5QH.qKv5R5Y5Z5Y5Z5OqQY5QH.q',
    'System Admin',
    'Strikezone',
    'admin',
    'active'
) ON CONFLICT (email) DO NOTHING;
