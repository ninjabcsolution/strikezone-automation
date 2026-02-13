-- Phase 1 Database Schema
-- Drop tables if they exist
DROP TABLE IF EXISTS order_lines CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS ingestion_logs CASCADE;

-- Customers table
CREATE TABLE customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    naics VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50),
    employee_count INTEGER,
    annual_revenue NUMERIC(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_industry ON customers(industry);
CREATE INDEX idx_customers_state ON customers(state);

-- Products table
CREATE TABLE products (
    product_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(product_category);

-- Orders table
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    order_date DATE NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    order_revenue NUMERIC(15, 2) NOT NULL,
    order_cogs NUMERIC(15, 2),
    gross_margin NUMERIC(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_date ON orders(order_date);

-- Order Lines table
CREATE TABLE order_lines (
    order_line_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id),
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(customer_id),
    order_date DATE NOT NULL,
    product_id VARCHAR(50) REFERENCES products(product_id),
    product_category VARCHAR(100),
    quantity INTEGER,
    line_revenue NUMERIC(15, 2),
    line_cogs NUMERIC(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_customer_line FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE INDEX idx_order_lines_order ON order_lines(order_id);
CREATE INDEX idx_order_lines_product ON order_lines(product_id);

-- Ingestion logs table
CREATE TABLE ingestion_logs (
    log_id SERIAL PRIMARY KEY,
    file_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    rows_processed INTEGER,
    rows_inserted INTEGER,
    rows_failed INTEGER,
    validation_errors JSONB,
    status VARCHAR(50),
    ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ingestion_logs_status ON ingestion_logs(status);
CREATE INDEX idx_ingestion_logs_date ON ingestion_logs(ingested_at);
