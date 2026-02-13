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
