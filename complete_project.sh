#!/bin/bash
echo "Creating all remaining project files..."

# Ingestion Service
cat > phase1-app/backend/src/services/ingestion.js << 'INGEOF'
const { pool } = require('../config/database');

class IngestionService {
  async ingestCustomers(records) {
    const client = await pool.connect();
    let inserted = 0, failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');
      for (const record of records) {
        try {
          await client.query(`
            INSERT INTO customers (customer_id, customer_name, industry, naics, city, state, country, employee_count, annual_revenue)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (customer_id) DO UPDATE SET customer_name = EXCLUDED.customer_name, industry = EXCLUDED.industry, updated_at = CURRENT_TIMESTAMP
          `, [record.customer_id, record.customer_name, record.industry || null, record.naics || null, record.city || null, record.state || null, record.country || null, record.employee_count || null, record.annual_revenue || null]);
          inserted++;
        } catch (error) {
          failed++;
          errors.push({ customer_id: record.customer_id, error: error.message });
        }
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return { inserted, failed, errors };
  }

  async ingestOrders(records) {
    const client = await pool.connect();
    let inserted = 0, failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');
      for (const record of records) {
        try {
          const grossMargin = record.gross_margin || (record.order_revenue && record.order_cogs ? record.order_revenue - record.order_cogs : null);
          await client.query(`
            INSERT INTO orders (order_id, order_date, customer_id, order_revenue, order_cogs, gross_margin)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (order_id) DO UPDATE SET order_date = EXCLUDED.order_date, order_revenue = EXCLUDED.order_revenue
          `, [record.order_id, record.order_date, record.customer_id, record.order_revenue, record.order_cogs || null, grossMargin]);
          inserted++;
        } catch (error) {
          failed++;
          errors.push({ order_id: record.order_id, error: error.message });
        }
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return { inserted, failed, errors };
  }

  async ingestOrderLines(records) {
    const client = await pool.connect();
    let inserted = 0, failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');
      for (const record of records) {
        try {
          await client.query(`
            INSERT INTO order_lines (order_line_id, order_id, customer_id, order_date, product_id, product_category, quantity, line_revenue, line_cogs)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (order_line_id) DO UPDATE SET order_id = EXCLUDED.order_id
          `, [record.order_line_id, record.order_id, record.customer_id, record.order_date, record.product_id || null, record.product_category || null, record.quantity || null, record.line_revenue || null, record.line_cogs || null]);
          inserted++;
        } catch (error) {
          failed++;
          errors.push({ order_line_id: record.order_line_id, error: error.message });
        }
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return { inserted, failed, errors };
  }

  async ingestProducts(records) {
    const client = await pool.connect();
    let inserted = 0, failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');
      for (const record of records) {
        try {
          await client.query(`
            INSERT INTO products (product_id, product_name, product_category)
            VALUES ($1, $2, $3)
            ON CONFLICT (product_id) DO UPDATE SET product_name = EXCLUDED.product_name
          `, [record.product_id, record.product_name, record.product_category || null]);
          inserted++;
        } catch (error) {
          failed++;
          errors.push({ product_id: record.product_id, error: error.message });
        }
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    return { inserted, failed, errors };
  }

  async logIngestion(fileType, fileName, rowsProcessed, rowsInserted, rowsFailed, validationErrors, status) {
    try {
      await pool.query(`
        INSERT INTO ingestion_logs (file_type, file_name, rows_processed, rows_inserted, rows_failed, validation_errors, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [fileType, fileName, rowsProcessed, rowsInserted, rowsFailed, JSON.stringify(validationErrors), status]);
    } catch (error) {
      console.error('Failed to log ingestion:', error);
    }
  }
}

module.exports = new IngestionService();
INGEOF

echo "✓ Ingestion service created"
