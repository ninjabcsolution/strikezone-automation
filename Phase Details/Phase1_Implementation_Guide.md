# Phase 1 Implementation Guide — Foundation + ERP-Neutral Ingestion
## Complete Build Instructions (Weeks 1–2)

**Goal:** Build universal data ingestion system that works with any ERP

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Phase 1 Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐                                          │
│  │   Frontend   │  React (Next.js)                         │
│  │   (Port 3000)│  - CSV upload UI                         │
│  │              │  - Validation results                    │
│  │              │  - QA reports                            │
│  └──────┬───────┘                                          │
│         │ HTTP/REST                                        │
│  ┌──────▼───────┐                                          │
│  │   Backend    │  Node.js (Express)                       │
│  │   (Port 5000)│  - File upload handling                  │
│  │              │  - CSV parsing                           │
│  │              │  - Validation logic                      │
│  │              │  - Data normalization                    │
│  └──────┬───────┘                                          │
│         │ SQL                                              │
│  ┌──────▼───────┐                                          │
│  │  PostgreSQL  │  - Normalized schema                     │
│  │  (Port 5432) │  - customers, orders, order_lines        │
│  │              │  - products, ingestion_logs              │
│  └──────────────┘                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Day 1-2: Project Setup & Database
- [x] Define folder structure
- [ ] Initialize Node.js backend
- [ ] Initialize React frontend
- [ ] Setup PostgreSQL database
- [ ] Create database schema

### Day 3-4: Backend Ingestion Service
- [ ] CSV upload endpoint
- [ ] CSV parsing & validation
- [ ] Data normalization logic
- [ ] Database insertion

### Day 5-7: Frontend Upload UI
- [ ] File upload component
- [ ] Validation results display
- [ ] QA report visualization

### Day 8-10: Testing & Polish
- [ ] End-to-end testing
- [ ] Error handling
- [ ] Documentation

---

## Step 1: Project Structure

Create this folder structure:

```
/home/ninja/project/KodeLinker/ERP/
├── phase1-app/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── database.js
│   │   │   ├── routes/
│   │   │   │   └── upload.js
│   │   │   ├── services/
│   │   │   │   ├── csvParser.js
│   │   │   │   ├── validator.js
│   │   │   │   └── ingestion.js
│   │   │   ├── models/
│   │   │   │   └── schema.sql
│   │   │   └── server.js
│   │   ├── package.json
│   │   └── .env.example
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── FileUpload.jsx
│       │   │   ├── ValidationReport.jsx
│       │   │   └── QAReport.jsx
│       │   ├── pages/
│       │   │   └── index.jsx
│       │   └── App.jsx
│       ├── package.json
│       └── next.config.js
│
└── csv-templates/
    ├── Customers_template.csv
    ├── Orders_template.csv
    └── OrderLines_template.csv
```

---

## Step 2: Initialize Backend (Node.js + Express + PostgreSQL)

### 2.1 Create backend package.json

```json
{
  "name": "strikezone-backend",
  "version": "1.0.0",
  "description": "ERP-neutral data ingestion backend",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1",
    "csv-parse": "^5.5.2",
    "cors": "^2.8.5",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 2.2 Database Configuration (`backend/src/config/database.js`)

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'strikezone_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = { pool };
```

### 2.3 Database Schema (`backend/src/models/schema.sql`)

```sql
-- Drop tables if they exist (for clean install)
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

-- Ingestion logs table (tracks uploads)
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
```

### 2.4 CSV Parser Service (`backend/src/services/csvParser.js`)

```javascript
const fs = require('fs');
const { parse } = require('csv-parse');

class CSVParser {
  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const records = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      fs.createReadStream(filePath)
        .pipe(parser)
        .on('data', (record) => records.push(record))
        .on('end', () => resolve(records))
        .on('error', (error) => reject(error));
    });
  }

  detectFileType(headers) {
    const headerSet = new Set(headers.map(h => h.toLowerCase()));
    
    if (headerSet.has('customer_id') && headerSet.has('customer_name')) {
      return 'customers';
    } else if (headerSet.has('order_id') && headerSet.has('order_date')) {
      return 'orders';
    } else if (headerSet.has('order_line_id') || headerSet.has('product_id')) {
      return 'order_lines';
    } else if (headerSet.has('product_id') && headerSet.has('product_name')) {
      return 'products';
    }
    
    return 'unknown';
  }
}

module.exports = new CSVParser();
```

### 2.5 Validator Service (`backend/src/services/validator.js`)

```javascript
const Joi = require('joi');

class Validator {
  validateCustomers(records) {
    const schema = Joi.object({
      customer_id: Joi.string().required(),
      customer_name: Joi.string().required(),
      industry: Joi.string().allow('', null),
      naics: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      country: Joi.string().allow('', null),
      employee_count: Joi.number().allow('', null),
      annual_revenue: Joi.number().allow('', null),
    });

    return this.validateRecords(records, schema);
  }

  validateOrders(records) {
    const schema = Joi.object({
      order_id: Joi.string().required(),
      order_date: Joi.date().iso().required(),
      customer_id: Joi.string().required(),
      order_revenue: Joi.number().required(),
      order_cogs: Joi.number().allow('', null),
      gross_margin: Joi.number().allow('', null),
    });

    return this.validateRecords(records, schema);
  }

  validateOrderLines(records) {
    const schema = Joi.object({
      order_line_id: Joi.string().required(),
      order_id: Joi.string().required(),
      customer_id: Joi.string().required(),
      order_date: Joi.date().iso().required(),
      product_id: Joi.string().allow('', null),
      product_category: Joi.string().allow('', null),
      quantity: Joi.number().allow('', null),
      line_revenue: Joi.number().allow('', null),
      line_cogs: Joi.number().allow('', null),
    });

    return this.validateRecords(records, schema);
  }

  validateProducts(records) {
    const schema = Joi.object({
      product_id: Joi.string().required(),
      product_name: Joi.string().required(),
      product_category: Joi.string().allow('', null),
    });

    return this.validateRecords(records, schema);
  }

  validateRecords(records, schema) {
    const errors = [];
    const validRecords = [];

    records.forEach((record, index) => {
      const { error, value } = schema.validate(record, { abortEarly: false });
      
      if (error) {
        errors.push({
          row: index + 2, // +2 because index 0 = row 2 (after header)
          errors: error.details.map(d => d.message),
        });
      } else {
        validRecords.push(value);
      }
    });

    return {
      valid: errors.length === 0,
      validRecords,
      errors,
      totalRows: records.length,
      validRows: validRecords.length,
      errorRows: errors.length,
    };
  }

  generateQAReport(records, fileType) {
    const report = {
      fileType,
      totalRows: records.length,
      missingValues: {},
      duplicates: {},
      dataQuality: {},
    };

    // Check for missing values
    const keys = Object.keys(records[0] || {});
    keys.forEach(key => {
      const missing = records.filter(r => !r[key] || r[key] === '').length;
      if (missing > 0) {
        report.missingValues[key] = {
          count: missing,
          percentage: ((missing / records.length) * 100).toFixed(2),
        };
      }
    });

    // Check for duplicates (on ID fields)
    const idField = fileType === 'customers' ? 'customer_id' : 
                    fileType === 'orders' ? 'order_id' : 
                    fileType === 'order_lines' ? 'order_line_id' : 'product_id';
    
    const ids = records.map(r => r[idField]);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      report.duplicates[idField] = {
        count: duplicateIds.length,
        examples: [...new Set(duplicateIds)].slice(0, 5),
      };
    }

    return report;
  }
}

module.exports = new Validator();
```

---

## Step 3: Continue Implementation

This is Part 1 of the Phase 1 implementation. The file has reached a good checkpoint.

**Next steps (to be completed):**
1. Ingestion Service (database insertion logic)
2. Upload Route (Express endpoint)
3. Server setup
4. Frontend React components
5. Testing & deployment

Should I continue with the remaining implementation files?
