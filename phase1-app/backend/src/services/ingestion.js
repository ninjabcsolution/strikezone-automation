const { pool } = require('../config/database');

class IngestionService {
  /**
   * Ingest customers data with user isolation
   * @param {Array} records - Customer records
   * @param {number} userId - Owner user ID for data isolation
   */
  async ingestCustomers(records, userId) {
    const client = await pool.connect();
    let inserted = 0, failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');
      
      // First, delete existing customer data for this user to allow re-upload
      if (userId) {
        await client.query('DELETE FROM customers WHERE user_id = $1', [userId]);
      }
      
      for (const record of records) {
        try {
          await client.query(`
            INSERT INTO customers (customer_id, customer_name, industry, naics, city, state, country, employee_count, annual_revenue, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (customer_id) 
            DO UPDATE SET 
              customer_name = EXCLUDED.customer_name, 
              industry = EXCLUDED.industry, 
              user_id = EXCLUDED.user_id,
              updated_at = CURRENT_TIMESTAMP
            WHERE customers.user_id = EXCLUDED.user_id OR customers.user_id IS NULL
          `, [
            record.customer_id, 
            record.customer_name, 
            record.industry || null, 
            record.naics || null, 
            record.city || null, 
            record.state || null, 
            record.country || null, 
            record.employee_count || null, 
            record.annual_revenue || null,
            userId || null
          ]);
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

  /**
   * Ingest orders data with user isolation
   * @param {Array} records - Order records
   * @param {number} userId - Owner user ID for data isolation
   */
  async ingestOrders(records, userId) {
    const client = await pool.connect();
    let inserted = 0, failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');
      
      // Delete existing orders for this user
      if (userId) {
        await client.query('DELETE FROM orders WHERE user_id = $1', [userId]);
      }
      
      for (const record of records) {
        try {
          const grossMargin = record.gross_margin || (record.order_revenue && record.order_cogs ? record.order_revenue - record.order_cogs : null);
          await client.query(`
            INSERT INTO orders (order_id, order_date, customer_id, order_revenue, order_cogs, gross_margin, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (order_id) 
            DO UPDATE SET 
              order_date = EXCLUDED.order_date, 
              order_revenue = EXCLUDED.order_revenue,
              user_id = EXCLUDED.user_id
            WHERE orders.user_id = EXCLUDED.user_id OR orders.user_id IS NULL
          `, [
            record.order_id, 
            record.order_date, 
            record.customer_id, 
            record.order_revenue, 
            record.order_cogs || null, 
            grossMargin,
            userId || null
          ]);
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

  /**
   * Ingest order lines data with user isolation
   * @param {Array} records - Order line records
   * @param {number} userId - Owner user ID for data isolation
   */
  async ingestOrderLines(records, userId) {
    const client = await pool.connect();
    let inserted = 0, failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');
      
      // Delete existing order lines for this user
      if (userId) {
        await client.query('DELETE FROM order_lines WHERE user_id = $1', [userId]);
      }
      
      for (const record of records) {
        try {
          await client.query(`
            INSERT INTO order_lines (order_line_id, order_id, customer_id, order_date, product_id, product_category, quantity, line_revenue, line_cogs, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (order_line_id) 
            DO UPDATE SET 
              order_id = EXCLUDED.order_id,
              user_id = EXCLUDED.user_id
            WHERE order_lines.user_id = EXCLUDED.user_id OR order_lines.user_id IS NULL
          `, [
            record.order_line_id, 
            record.order_id, 
            record.customer_id, 
            record.order_date, 
            record.product_id || null, 
            record.product_category || null, 
            record.quantity || null, 
            record.line_revenue || null, 
            record.line_cogs || null,
            userId || null
          ]);
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

  /**
   * Ingest products data with user isolation
   * @param {Array} records - Product records
   * @param {number} userId - Owner user ID for data isolation
   */
  async ingestProducts(records, userId) {
    const client = await pool.connect();
    let inserted = 0, failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');
      
      // Delete existing products for this user
      if (userId) {
        await client.query('DELETE FROM products WHERE user_id = $1', [userId]);
      }
      
      for (const record of records) {
        try {
          await client.query(`
            INSERT INTO products (product_id, product_name, product_category, user_id)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (product_id) 
            DO UPDATE SET 
              product_name = EXCLUDED.product_name,
              user_id = EXCLUDED.user_id
            WHERE products.user_id = EXCLUDED.user_id OR products.user_id IS NULL
          `, [
            record.product_id, 
            record.product_name, 
            record.product_category || null,
            userId || null
          ]);
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

  /**
   * Log ingestion with user isolation
   */
  async logIngestion(fileType, fileName, rowsProcessed, rowsInserted, rowsFailed, validationErrors, status, userId = null) {
    try {
      await pool.query(`
        INSERT INTO ingestion_logs (file_type, file_name, rows_processed, rows_inserted, rows_failed, validation_errors, status, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [fileType, fileName, rowsProcessed, rowsInserted, rowsFailed, JSON.stringify(validationErrors), status, userId]);
    } catch (error) {
      console.error('Failed to log ingestion:', error);
    }
  }
}

module.exports = new IngestionService();
