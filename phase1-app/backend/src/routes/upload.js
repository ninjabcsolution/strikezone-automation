const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const csvParser = require('../services/csvParser');
const validator = require('../services/validator');
const ingestionService = require('../services/ingestion');
const { pool } = require('../config/database');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  // Never trust `originalname` for filesystem paths (it can contain path separators)
  // Generate a safe filename and keep the original name only for display/logging.
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ext === '.csv' ? '.csv' : '';
    const rand = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${rand}${safeExt}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = String(file.mimetype || '').toLowerCase();
    const allowedMimes = new Set(['text/csv', 'application/csv', 'application/vnd.ms-excel']);

    if (ext === '.csv' || allowedMimes.has(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const records = await csvParser.parseCSV(filePath);
    
    if (records.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    const headers = Object.keys(records[0]);
    const fileType = csvParser.detectFileType(headers);
    
    if (fileType === 'unknown') {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unable to detect file type', headers });
    }

    let validationResult;
    switch (fileType) {
      case 'customers': validationResult = validator.validateCustomers(records); break;
      case 'orders': validationResult = validator.validateOrders(records); break;
      case 'order_lines': validationResult = validator.validateOrderLines(records); break;
      case 'products': validationResult = validator.validateProducts(records); break;
      default: return res.status(400).json({ error: 'Invalid file type' });
    }

    const qaReport = validator.generateQAReport(records, fileType);

    if (!validationResult.valid) {
      await ingestionService.logIngestion(fileType, fileName, validationResult.totalRows, 0, validationResult.errorRows, validationResult.errors, 'validation_failed');
      fs.unlinkSync(filePath);
      return res.status(400).json({ status: 'validation_failed', fileType, validation: validationResult, qaReport });
    }

    let ingestionResult;
    switch (fileType) {
      case 'customers': ingestionResult = await ingestionService.ingestCustomers(validationResult.validRecords); break;
      case 'orders': ingestionResult = await ingestionService.ingestOrders(validationResult.validRecords); break;
      case 'order_lines': ingestionResult = await ingestionService.ingestOrderLines(validationResult.validRecords); break;
      case 'products': ingestionResult = await ingestionService.ingestProducts(validationResult.validRecords); break;
    }

    await ingestionService.logIngestion(fileType, fileName, validationResult.totalRows, ingestionResult.inserted, ingestionResult.failed, ingestionResult.errors, 'success');
    fs.unlinkSync(filePath);

    res.json({
      status: 'success',
      fileType,
      fileName,
      validation: { totalRows: validationResult.totalRows, validRows: validationResult.validRows },
      ingestion: { inserted: ingestionResult.inserted, failed: ingestionResult.failed, errors: ingestionResult.errors },
      qaReport,
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to process file', message: error.message });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ingestion_logs ORDER BY ingested_at DESC LIMIT 50');
    res.json({ logs: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Check upload status - returns row counts for each table
router.get('/status', async (req, res) => {
  try {
    const tables = ['customers', 'products', 'orders', 'order_lines'];
    const status = {};
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(result.rows[0].count, 10);
        if (count > 0) {
          // Get last upload info from ingestion_logs
          const logResult = await pool.query(
            `SELECT file_name, rows_inserted, ingested_at 
             FROM ingestion_logs 
             WHERE file_type = $1 AND status = 'success'
             ORDER BY ingested_at DESC 
             LIMIT 1`,
            [table === 'order_lines' ? 'order_lines' : table]
          );
          
          const key = table === 'order_lines' ? 'orderlines' : table;
          status[key] = {
            rows: count,
            fileName: logResult.rows[0]?.file_name || `${table}.csv`,
            timestamp: logResult.rows[0]?.ingested_at || new Date().toISOString()
          };
        }
      } catch (e) {
        // Table might not exist, skip
      }
    }
    
    res.json({ status });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check upload status' });
  }
});

module.exports = router;
