/**
 * Generate 3-Year Sample Data for CAGR Testing
 * Creates realistic order data with growth, decline, and stable patterns
 */

const fs = require('fs');
const path = require('path');

// Configuration
const YEARS = [2024, 2025, 2026];
const NUM_CUSTOMERS = 120;
const PRODUCTS = [
  { id: 'P001', name: 'Industrial Bearings', category: 'Bearings' },
  { id: 'P002', name: 'Hydraulic Pumps', category: 'Pumps' },
  { id: 'P003', name: 'Steel Fasteners', category: 'Fasteners' },
  { id: 'P004', name: 'Electric Motors', category: 'Motors' },
  { id: 'P005', name: 'Pneumatic Valves', category: 'Valves' },
  { id: 'P006', name: 'Conveyor Belts', category: 'Conveyors' },
  { id: 'P007', name: 'Safety Equipment', category: 'Safety' },
  { id: 'P008', name: 'Lubricants', category: 'Lubricants' },
  { id: 'P009', name: 'Control Systems', category: 'Automation' },
  { id: 'P010', name: 'Welding Supplies', category: 'Welding' },
];

// Customer segments with different growth patterns
function getCustomerSegment(customerId) {
  const num = parseInt(customerId.replace('C', ''));
  
  // Top 20% (24 customers) - consistent growers
  if (num <= 24) return { type: 'top_grower', baseRevenue: rand(80000, 150000), growthRate: rand(0.15, 0.35) };
  
  // Next 20% - moderate growers
  if (num <= 48) return { type: 'moderate_grower', baseRevenue: rand(40000, 80000), growthRate: rand(0.05, 0.15) };
  
  // Middle 20% - stable
  if (num <= 72) return { type: 'stable', baseRevenue: rand(20000, 50000), growthRate: rand(-0.02, 0.05) };
  
  // Next 20% - declining
  if (num <= 96) return { type: 'declining', baseRevenue: rand(30000, 60000), growthRate: rand(-0.20, -0.05) };
  
  // Bottom 20% - new customers (no orders in year 1)
  return { type: 'new', baseRevenue: rand(15000, 40000), startYear: 2025 };
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateOrders() {
  const orders = [];
  const orderLines = [];
  let orderId = 1;
  let lineId = 1;
  
  for (let custNum = 1; custNum <= NUM_CUSTOMERS; custNum++) {
    const customerId = `C${String(custNum).padStart(4, '0')}`;
    const segment = getCustomerSegment(customerId);
    
    for (const year of YEARS) {
      // Skip year 1 for new customers
      if (segment.type === 'new' && year < segment.startYear) continue;
      
      // Calculate yearly revenue based on growth pattern
      let yearlyRevenue;
      const yearsFromStart = year - 2024;
      
      if (segment.type === 'new') {
        yearlyRevenue = segment.baseRevenue * (1 + (yearsFromStart - 1) * 0.3); // 30% growth for new
      } else {
        yearlyRevenue = segment.baseRevenue * Math.pow(1 + segment.growthRate, yearsFromStart);
      }
      
      // Add some randomness
      yearlyRevenue *= rand(0.85, 1.15);
      
      // Number of orders per year (more for bigger customers)
      const numOrders = randInt(4, Math.min(24, Math.ceil(yearlyRevenue / 5000)));
      const revenuePerOrder = yearlyRevenue / numOrders;
      
      for (let o = 0; o < numOrders; o++) {
        const orderIdStr = `ORD${String(orderId).padStart(6, '0')}`;
        const month = randInt(1, 12);
        const day = randInt(1, 28);
        const orderDate = formatDate(year, month, day);
        
        // Order revenue with variation
        const orderRevenue = revenuePerOrder * rand(0.5, 1.5);
        const marginPercent = rand(0.20, 0.45); // 20-45% margin
        const grossMargin = orderRevenue * marginPercent;
        const orderCogs = orderRevenue - grossMargin;
        
        orders.push({
          order_id: orderIdStr,
          order_date: orderDate,
          customer_id: customerId,
          order_revenue: orderRevenue.toFixed(2),
          order_cogs: orderCogs.toFixed(2),
          gross_margin: grossMargin.toFixed(2)
        });
        
        // Generate 1-5 order lines per order
        const numLines = randInt(1, 5);
        for (let l = 0; l < numLines; l++) {
          const product = PRODUCTS[randInt(0, PRODUCTS.length - 1)];
          const quantity = randInt(1, 50);
          const lineRevenue = (orderRevenue / numLines) * rand(0.7, 1.3);
          const lineCogs = lineRevenue * (1 - marginPercent);
          
          orderLines.push({
            order_line_id: `OL${String(lineId).padStart(7, '0')}`,
            order_id: orderIdStr,
            customer_id: customerId,
            order_date: orderDate,
            product_id: product.id,
            product_category: product.category,
            quantity: quantity,
            line_revenue: lineRevenue.toFixed(2),
            line_cogs: lineCogs.toFixed(2)
          });
          lineId++;
        }
        orderId++;
      }
    }
  }
  
  return { orders, orderLines };
}

function generateProducts() {
  return PRODUCTS.map(p => ({
    product_id: p.id,
    product_name: p.name,
    product_category: p.category
  }));
}

function writeCsv(filename, data) {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const csv = [headers, ...rows].join('\n');
  
  const outputPath = path.join(__dirname, '..', '..', '..', '..', 'sample_data_3yr', filename);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, csv);
  console.log(`✓ Generated ${filename}: ${data.length} rows`);
}

// Generate all data
console.log('Generating 3-year sample data...\n');

const products = generateProducts();
const { orders, orderLines } = generateOrders();

// Copy existing customers
const customersPath = path.join(__dirname, '..', '..', '..', '..', 'sample_data_ceo', 'Customers.csv');
const customersData = fs.readFileSync(customersPath, 'utf-8');
const outputDir = path.join(__dirname, '..', '..', '..', '..', 'sample_data_3yr');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'Customers.csv'), customersData);
console.log('✓ Copied Customers.csv');

writeCsv('Products.csv', products);
writeCsv('Orders.csv', orders);
writeCsv('OrderLines.csv', orderLines);

// Summary stats
const ordersByYear = {};
YEARS.forEach(y => {
  ordersByYear[y] = orders.filter(o => o.order_date.startsWith(String(y))).length;
});

const revenueByYear = {};
YEARS.forEach(y => {
  revenueByYear[y] = orders
    .filter(o => o.order_date.startsWith(String(y)))
    .reduce((sum, o) => sum + parseFloat(o.order_revenue), 0);
});

console.log('\n=== Summary ===');
console.log(`Customers: ${NUM_CUSTOMERS}`);
console.log(`Products: ${products.length}`);
console.log(`Total Orders: ${orders.length}`);
console.log(`Total Order Lines: ${orderLines.length}`);
console.log('\nOrders by Year:', ordersByYear);
console.log('Revenue by Year:', Object.fromEntries(
  Object.entries(revenueByYear).map(([k, v]) => [k, `$${(v/1000000).toFixed(1)}M`])
));

console.log('\n✅ Sample data generated in sample_data_3yr/');
