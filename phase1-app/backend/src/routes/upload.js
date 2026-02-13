const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || path.extname(file.originalname) === '.csv') {
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
    
    if (records.length === 0) return res.status(400).json({ error: 'CSV file is empty' });

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

module.exports = router;
