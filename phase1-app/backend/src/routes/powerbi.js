const express = require('express');
const multer = require('multer');
const powerbiImportService = require('../services/powerbiImportService');
const { csvToJson } = require('../services/csvJsonService');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function getActor(req) {
  return req.header('X-Actor') || 'unknown';
}

// POST /api/powerbi/import/targets
// Body: { records: [ { company_name, domain, tier, segment, ... } ] }
router.post('/import/targets', async (req, res) => {
  try {
    const actor = getActor(req);
    const { records } = req.body || {};
    const result = await powerbiImportService.importTargets({ records, actor });
    res.json({ status: 'success', ...result });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: 'Power BI import failed', message: err.message });
  }
});

// POST /api/powerbi/import/targets-csv
// multipart/form-data: file=@targets.csv
router.post('/import/targets-csv', upload.single('file'), async (req, res) => {
  try {
    const actor = getActor(req);
    if (!req.file) {
      return res.status(400).json({ error: 'Missing file' });
    }

    const text = req.file.buffer.toString('utf8');
    const records = csvToJson(text);
    const result = await powerbiImportService.importTargets({ records, actor });
    res.json({ status: 'success', ...result, totalRows: records.length });
  } catch (err) {
    const status = err.statusCode || 500;
    res.status(status).json({ error: 'Power BI CSV import failed', message: err.message });
  }
});

module.exports = router;
