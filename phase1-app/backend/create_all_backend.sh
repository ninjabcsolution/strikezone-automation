#!/bin/bash

# CSV Parser Service
cat > src/services/csvParser.js << 'CSVEOF'
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
    } else if (headerSet.has('order_line_id')) {
      return 'order_lines';
    } else if (headerSet.has('product_id') && headerSet.has('product_name')) {
      return 'products';
    }
    
    return 'unknown';
  }
}

module.exports = new CSVParser();
CSVEOF

# Validator Service
cat > src/services/validator.js << 'VALEOF'
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
          row: index + 2,
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
    };

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
VALEOF

echo "✓ Backend services created (csvParser, validator)"
