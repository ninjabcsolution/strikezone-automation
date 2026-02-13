# Phase 1 Implementation (Part 2) — Backend Services & Routes

## Step 3: Ingestion Service (`backend/src/services/ingestion.js`)

```javascript
const { pool } = require('../config/database');

class IngestionService {
  async ingestCustomers(records) {
    const client = await pool.connect();
    let inserted = 0;
    let failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');

      for (const record of records) {
        try {
          await client.query(
            `INSERT INTO customers (
              customer_id, customer_name, industry, naics, city, state, 
              country, employee_count, annual_revenue
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (customer_id) DO UPDATE SET
              customer_name = EXCLUDED.customer_name,
              industry = EXCLUDED.industry,
              naics = EXCLUDED.naics,
              city = EXCLUDED.city,
              state = EXCLUDED.state,
              country = EXCLUDED.country,
              employee_count = EXCLUDED.employee_count,
              annual_revenue = EXCLUDED.annual_revenue,
              updated_at = CURRENT_TIMESTAMP`,
            [
              record.customer_id,
              record.customer_name,
              record.industry || null,
              record.naics || null,
              record.city || null,
              record.state || null,
              record.country || null,
              record.employee_count || null,
              record.annual_revenue || null,
            ]
          );
          inserted++;
        } catch (error) {
          failed++;
          errors.push({
            customer_id: record.customer_id,
            error: error.message,
          });
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
    let inserted = 0;
    let failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');

      for (const record of records) {
        try {
          // Calculate gross_margin if not provided
          const grossMargin = record.gross_margin || 
            (record.order_revenue && record.order_cogs 
              ? record.order_revenue - record.order_cogs 
              : null);

          await client.query(
            `INSERT INTO orders (
              order_id, order_date, customer_id, order_revenue, 
              order_cogs, gross_margin
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (order_id) DO UPDATE SET
              order_date = EXCLUDED.order_date,
              customer_id = EXCLUDED.customer_id,
              order_revenue = EXCLUDED.order_revenue,
              order_cogs = EXCLUDED.order_cogs,
              gross_margin = EXCLUDED.gross_margin`,
            [
              record.order_id,
              record.order_date,
              record.customer_id,
              record.order_revenue,
              record.order_cogs || null,
              grossMargin,
            ]
          );
          inserted++;
        } catch (error) {
          failed++;
          errors.push({
            order_id: record.order_id,
            error: error.message,
          });
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
    let inserted = 0;
    let failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');

      for (const record of records) {
        try {
          await client.query(
            `INSERT INTO order_lines (
              order_line_id, order_id, customer_id, order_date, 
              product_id, product_category, quantity, line_revenue, line_cogs
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (order_line_id) DO UPDATE SET
              order_id = EXCLUDED.order_id,
              customer_id = EXCLUDED.customer_id,
              order_date = EXCLUDED.order_date,
              product_id = EXCLUDED.product_id,
              product_category = EXCLUDED.product_category,
              quantity = EXCLUDED.quantity,
              line_revenue = EXCLUDED.line_revenue,
              line_cogs = EXCLUDED.line_cogs`,
            [
              record.order_line_id,
              record.order_id,
              record.customer_id,
              record.order_date,
              record.product_id || null,
              record.product_category || null,
              record.quantity || null,
              record.line_revenue || null,
              record.line_cogs || null,
            ]
          );
          inserted++;
        } catch (error) {
          failed++;
          errors.push({
            order_line_id: record.order_line_id,
            error: error.message,
          });
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
    let inserted = 0;
    let failed = 0;
    const errors = [];

    try {
      await client.query('BEGIN');

      for (const record of records) {
        try {
          await client.query(
            `INSERT INTO products (product_id, product_name, product_category)
            VALUES ($1, $2, $3)
            ON CONFLICT (product_id) DO UPDATE SET
              product_name = EXCLUDED.product_name,
              product_category = EXCLUDED.product_category`,
            [
              record.product_id,
              record.product_name,
              record.product_category || null,
            ]
          );
          inserted++;
        } catch (error) {
          failed++;
          errors.push({
            product_id: record.product_id,
            error: error.message,
          });
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
      await pool.query(
        `INSERT INTO ingestion_logs (
          file_type, file_name, rows_processed, rows_inserted, 
          rows_failed, validation_errors, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [fileType, fileName, rowsProcessed, rowsInserted, rowsFailed, JSON.stringify(validationErrors), status]
      );
    } catch (error) {
      console.error('Failed to log ingestion:', error);
    }
  }
}

module.exports = new IngestionService();
```

---

## Step 4: Upload Route (`backend/src/routes/upload.js`)

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csvParser = require('../services/csvParser');
const validator = require('../services/validator');
const ingestionService = require('../services/ingestion');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  },
});

// POST /api/upload - Upload and process CSV file
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Step 1: Parse CSV
    const records = await csvParser.parseCSV(filePath);
    
    if (records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    // Step 2: Detect file type
    const headers = Object.keys(records[0]);
    const fileType = csvParser.detectFileType(headers);
    
    if (fileType === 'unknown') {
      return res.status(400).json({ 
        error: 'Unable to detect file type. Please use a valid template.',
        headers,
      });
    }

    // Step 3: Validate records
    let validationResult;
    switch (fileType) {
      case 'customers':
        validationResult = validator.validateCustomers(records);
        break;
      case 'orders':
        validationResult = validator.validateOrders(records);
        break;
      case 'order_lines':
        validationResult = validator.validateOrderLines(records);
        break;
      case 'products':
        validationResult = validator.validateProducts(records);
        break;
      default:
        return res.status(400).json({ error: 'Invalid file type' });
    }

    // Step 4: Generate QA report
    const qaReport = validator.generateQAReport(records, fileType);

    // If validation failed, return errors without inserting
    if (!validationResult.valid) {
      await ingestionService.logIngestion(
        fileType,
        fileName,
        validationResult.totalRows,
        0,
        validationResult.errorRows,
        validationResult.errors,
        'validation_failed'
      );

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      return res.status(400).json({
        status: 'validation_failed',
        fileType,
        validation: validationResult,
        qaReport,
      });
    }

    // Step 5: Ingest data into database
    let ingestionResult;
    switch (fileType) {
      case 'customers':
        ingestionResult = await ingestionService.ingestCustomers(validationResult.validRecords);
        break;
      case 'orders':
        ingestionResult = await ingestionService.ingestOrders(validationResult.validRecords);
        break;
      case 'order_lines':
        ingestionResult = await ingestionService.ingestOrderLines(validationResult.validRecords);
        break;
      case 'products':
        ingestionResult = await ingestionService.ingestProducts(validationResult.validRecords);
        break;
    }

    // Step 6: Log ingestion
    await ingestionService.logIngestion(
      fileType,
      fileName,
      validationResult.totalRows,
      ingestionResult.inserted,
      ingestionResult.failed,
      ingestionResult.errors,
      'success'
    );

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Return success response
    res.json({
      status: 'success',
      fileType,
      fileName,
      validation: {
        totalRows: validationResult.totalRows,
        validRows: validationResult.validRows,
      },
      ingestion: {
        inserted: ingestionResult.inserted,
        failed: ingestionResult.failed,
        errors: ingestionResult.errors,
      },
      qaReport,
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      error: 'Failed to process file',
      message: error.message,
    });
  }
});

// GET /api/upload/logs - Get ingestion logs
router.get('/logs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ingestion_logs ORDER BY ingested_at DESC LIMIT 50'
    );
    res.json({ logs: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
```

---

## Step 5: Server Setup (`backend/src/server.js`)

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end();
  });
});
```

---

## Step 6: Environment Variables (`.env.example`)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=strikezone_db
DB_USER=postgres
DB_PASSWORD=postgres

# Server Configuration
PORT=5000
NODE_ENV=development
```

---

## Step 7: Setup Instructions

### 7.1 Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql -c "CREATE DATABASE strikezone_db;"
sudo -u postgres psql -c "CREATE USER strikezone WITH PASSWORD 'strikezone123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE strikezone_db TO strikezone;"
```

### 7.2 Initialize Backend

```bash
# Navigate to backend directory
cd /home/ninja/project/KodeLinker/ERP/phase1-app/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run database schema
psql -U postgres -d strikezone_db -f src/models/schema.sql

# Start server
npm run dev
```

### 7.3 Test Backend

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test file upload (after frontend is ready)
curl -X POST http://localhost:5000/api/upload \
  -F "file=@sample_data_ceo/Customers.csv"
```

---

## Next Steps

Continue to Part 3 for:
- React frontend implementation
- Testing guide
- Deployment instructions

