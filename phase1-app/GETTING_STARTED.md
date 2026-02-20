# 🚀 Getting Started with Strikezone

## What You Have

A **complete, production-ready ERP intelligence platform** with:

### 📊 CEO Dashboard Features
- **Giant Hero Metric**: Top 20% contribution percentage
- **4 KPI Cards**: Key business metrics with visual indicators
- **Top 10 Elite Customers Table**: Ranked with gold badges
- **3 Insight Cards**: Actionable business recommendations
- **Beautiful Gradient Design**: Professional purple/red color scheme
- **Auto-Refresh**: Real-time data updates

### 💼 Upload Interface
- Drag & drop CSV uploads
- Real-time validation
- QA reporting with missing data analysis
- Quick metrics calculation

## Quick Start (3 Steps)

### 1️⃣ Setup Everything
```bash
cd phase1-app
chmod +x setup.sh
./setup.sh
```

If you ever see DB errors like `relation "ingestion_logs" does not exist`, re-run:

```bash
cd phase1-app/backend
npm run db:init:all
```

### 2️⃣ Start Backend
```bash
cd backend
npm run dev
```
✓ Backend runs on http://localhost:5000

### 3️⃣ Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```
✓ Frontend runs on http://localhost:3000

## 🎯 Usage Workflow

> This follows the **original workflow**: **Dynamics/ERP → Power BI → Segmented Export → Approval Portal → Outreach**.

### Step 1: Upload Data
1. Go to http://localhost:3000
2. Upload CSV files in this order:
   - Customers.csv
   - Products.csv
   - Orders.csv
   - OrderLines.csv

### Step 2: Calculate Analytics
- Click **"Calculate Top 20% Metrics"** button
- This runs the analytics engine

### Step 3: View CEO Dashboard
- Click **"📊 CEO Dashboard"** button
- See beautiful visualizations:
  - Top 20% contribution (hero metric)
  - Margin analysis (4 KPI cards)
  - Elite customers table
  - Business insights

### (Phase 3) Step 4: Review + Approve Targets
- Click **"✅ Approval Portal"**
- Import targets exported from Power BI (Tier/Segment list) via **CSV upload** (recommended) or JSON paste, or create targets manually
- Review reason codes + tier, adjust notes/tier, then Approve/Reject
- Export approved targets as CSV

### (Phase 2B) ICP Dashboard
- Open: http://localhost:3000/icp-dashboard
- Click **Recalculate ICP Traits** after analytics calculation
- Export:
  - Traits CSV (for review / sharing)
  - ICP Summary Markdown (1-page)

⚠️ **Apollo note:** Some Apollo endpoints (like company search) require a paid plan/API access. If you see an error like:
`... not accessible with this api_key on a free plan ...`
you can still use the portal with **manual target creation** (or CSV import/export), and enable Apollo once your plan supports it.

## 📱 Two Interfaces

### Admin Interface (`/`)
**Purpose**: Data management
- Upload CSV files
- View validation results
- Run calculations
- Check QA reports

### CEO Dashboard (`/ceo-dashboard`)
**Purpose**: Executive insights
- High-level KPIs
- Top customers analysis
- Strategic recommendations
- Beautiful, presentation-ready

## 🎨 Dashboard Features

### Hero Card
```
TOP 20% CUSTOMERS GENERATE
        87.3%
of Total Gross Margin
```
Giant number, impossible to miss!

### KPI Cards
1. **Top 20% Avg Margin** - How much elite customers spend
2. **Others Avg Margin** - Baseline comparison
3. **Margin Multiplier** - How much more elite spend
4. **Focus Opportunity** - Number of target accounts

### Elite Customers Table
- Gold badges for top 3
- Full customer details
- Revenue & margin breakdown
- Sortable by performance

### Insight Cards
- 💡 Key Insight: What the data means
- 🎯 Next Steps: What to do
- 📈 Growth Strategy: How to scale

## 🔧 Testing with Sample Data

```bash
cd phase1-app

# Upload sample data
curl -X POST http://localhost:5000/api/upload \
  -F "file=@../sample_data_ceo/Customers.csv"

curl -X POST http://localhost:5000/api/upload \
  -F "file=@../sample_data_ceo/Orders.csv"

# Calculate metrics
curl -X POST http://localhost:5000/api/analytics/calculate

# View results
open http://localhost:3000/ceo-dashboard

# Phase 3 approval portal
open http://localhost:3000/approval-portal
```

## 🎯 Demo Script for CEO

1. **Show the problem**: "We don't know which customers drive profit"
2. **Upload data**: Drag & drop 4 CSV files (30 seconds)
3. **Calculate**: Click one button (5 seconds)
4. **Reveal**: Open CEO dashboard - BOOM! 💥
5. **Walk through**:
   - "87% of profit from just 20% of customers"
   - "Here are your top 10 - protect these relationships"
   - "Elite customers spend 4.2x more than average"
   - "Focus on these 24 accounts, find similar prospects"

## 📊 Sample Insights You'll See

- "Your top 24 customers generate 87.3% of profit"
- "Elite customers worth $125K vs $30K average"
- "Moving 10% of customers up-tier could double revenue"
- "Focus on Industrial Manufacturing in Texas"

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL
sudo systemctl status postgresql

# Check .env file
cat backend/.env
```

### No data in dashboard
```bash
# Check data was uploaded
psql -h localhost -U strikezone_user -d strikezone_db -c "SELECT COUNT(*) FROM customers;"

# Recalculate metrics
curl -X POST http://localhost:5000/api/analytics/calculate
```

### Frontend errors
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Restart frontend
cd frontend
rm -rf .next
npm run dev
```

## 🎨 Design Details

**Colors**:
- Purple gradient background (`#667eea` → `#764ba2`)
- Red hero card (`#E74C3C` → `#C0392B`)
- White cards with subtle shadows
- Gold badges for top performers

**Typography**:
- System fonts (Apple/Windows native)
- 96px hero number
- Clear hierarchy

**Layout**:
- Responsive grid (works on all screens)
- Maximum contrast for readability
- Executive-friendly (no technical jargon)

## 🎁 Bonus Features

- **Auto-refresh button**: Update data without reload
- **Formatted numbers**: $125,432 instead of 125432.45
- **Percentage calculations**: Automatic comparisons
- **Responsive design**: Works on tablets/phones
- **No login required**: Perfect for demos

## 🚀 Next Steps

1. Upload your real ERP data
2. Present to CEO/leadership
3. Use insights for targeting
4. Implement ICP extraction (Phase 3)
5. Generate look-alike prospects (Phase 4)

## 📚 Documentation

- `README.md` - Complete technical guide
- `Phase1_Implementation_Guide.md` - Development details
- `Phase2_Implementation_Guide.md` - Analytics implementation
- This file - Getting started guide

---

**You're ready to go!** 🎉

Run `./setup.sh` and start impressing executives with data-driven insights.
