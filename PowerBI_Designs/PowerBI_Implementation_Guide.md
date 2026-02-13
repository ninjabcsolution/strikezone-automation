# 🎨 Power BI Dashboard Implementation Guide

## 📋 Overview

This guide provides step-by-step instructions to recreate the 4 beautiful gradient-based dashboard pages in Power BI Desktop.

### Four Dashboard Pages:
1. **Executive Summary** - Purple gradient (#667eea → #764ba2)
2. **Top 20% Analysis** - Green gradient (#11998e → #38ef7d)
3. **Customer Deep Dive** - Pink gradient (#f093fb → #f5576c)
4. **Growth Opportunities** - Blue gradient (#4facfe → #00f2fe)

---

## 🚀 Quick Start

### Prerequisites
- Power BI Desktop (latest version)
- ERP data loaded into PostgreSQL database
- Database connection credentials

### View Design Mockups
Open the HTML files in your browser to see the target designs:
- `Page1_Executive_Summary.html`
- `Page2_Top20_Analysis.html`
- `Page3_Customer_Deep_Dive.html`
- `Page4_Growth_Opportunities.html`

---

## 📊 PAGE 1: Executive Summary

### Theme Colors
- Background: Purple Gradient (#667eea → #764ba2)
- Hero Card: Red Gradient (#E74C3C → #C0392B)
- KPI Cards: Blue, Green, Red, Orange accents

### Step-by-Step Implementation

#### 1. Canvas Setup
```
1. Open Power BI Desktop
2. File → Options → Report Settings
3. Set Page Size: 16:9 (1920 x 1080)
4. Background: Format → Canvas Background → Color: #667eea
```

#### 2. Create Hero Card (Top 20% Metric)
```
1. Insert → Shapes → Rectangle
2. Size: 1800px width x 400px height
3. Position: Center top (X: 60, Y: 120)
4. Format:
   - Fill: #E74C3C
   - Transparency: 0%
   - Rounded Corners: 30px
   - Shadow: Enabled (Blur: 60, Distance: 20, Transparency: 40%)
```

**Add Hero Text:**
```
1. Insert → Text Box
2. Text: "TOP 20% OF CUSTOMERS GENERATE"
3. Font: Segoe UI, 18pt, Bold, White
4. Position: Center in hero card (top section)

5. Insert → Card Visual
6. Add Measure: Top20Contribution%
7. Font: 140pt, Bold, White
8. Position: Center in hero card

9. Insert → Text Box
10. Text: "of Total Gross Margin"
11. Font: Segoe UI, 28pt, White
12. Position: Below percentage
```

**Add Hero Stats:**
```
1. Insert → Two Card Visuals side by side
2. Left Card: Elite Customer Count
   - Font: 56pt, Bold, White
   - Label below: "Elite Customers"
3. Right Card: Total Customers
   - Font: 56pt, Bold, White
   - Label below: "Total Customers"
```

#### 3. Create KPI Card Grid (4 Cards)
```
For Each Card:
1. Insert → Card Visual
2. Size: 420px x 220px
3. Spacing: 25px gap
4. Format:
   - Background: White
   - Rounded Corners: 20px
   - Shadow: Enabled
   - Top Border: 6px colored strip

Card 1 (Blue):
- Measure: Top20AvgMargin
- Format: Currency
- Top Border: #3498DB

Card 2 (Green):
- Measure: MarginMultiplier
- Format: 0.0x
- Top Border: #27AE60

Card 3 (Red):
- Measure: TotalRevenue
- Format: Currency
- Top Border: #E74C3C

Card 4 (Orange):
- Measure: OpportunityValue
- Format: Currency
- Top Border: #F39C12
```

#### 4. Create Chart Section
```
Left Chart (Revenue Trend):
1. Insert → Line Chart
2. Data: MonthYear, Top20Revenue, OthersRevenue
3. Size: 1200px x 350px
4. Background: White, Rounded

Right Chart (Pareto):
1. Insert → Column + Line Chart
2. Data: Customer cumulative contribution
3. Size: 620px x 350px
4. Background: White, Rounded
```

### DAX Measures for Page 1

```dax
// Top 20% Contribution
Top20Contribution% = 
DIVIDE(
    CALCULATE(SUM(customer_metrics[total_gross_margin]), customer_metrics[is_top_20] = TRUE),
    SUM(customer_metrics[total_gross_margin]),
    0
) * 100

// Elite Customer Count
EliteCustomerCount = 
CALCULATE(
    COUNTROWS(customer_metrics),
    customer_metrics[is_top_20] = TRUE
)

// Margin Multiplier
MarginMultiplier = 
DIVIDE(
    CALCULATE(AVERAGE(customer_metrics[total_gross_margin]), customer_metrics[is_top_20] = TRUE),
    CALCULATE(AVERAGE(customer_metrics[total_gross_margin]), customer_metrics[is_top_20] = FALSE),
    0
)
```

---

## 🏆 PAGE 2: Top 20% Analysis

### Theme Colors
- Background: Green Gradient (#11998e → #38ef7d)
- Accent Cards: Gold, Silver, Bronze

### Step-by-Step Implementation

#### 1. Canvas Setup
```
Background: #11998e
Page name: "Top 20% Analysis"
```

#### 2. Create Top Metric Cards (3 Cards)
```
Card 1 (Gold):
- Icon: 👑 (use text box)
- Measure: TotalEliteRevenue
- Top Border: Gold gradient (#FFD700)
- Size: 580px x 280px

Card 2 (Silver):
- Icon: 💎
- Measure: EliteGrossMargin
- Top Border: Silver gradient (#C0C0C0)

Card 3 (Bronze):
- Icon: ⭐
- Measure: AvgMarginRate
- Top Border: Bronze gradient (#CD7F32)
```

#### 3. Create Elite Customer Table
```
1. Insert → Table Visual
2. Columns:
   - Rank (with conditional formatting)
   - Customer Name
   - Industry
   - Location
   - Revenue
   - Margin
   - Performance Bar

3. Conditional Formatting:
   - Rank 1-3: Gold/Silver/Bronze backgrounds
   - Others: Gray background
   
4. Add Progress Bars:
   - Data Bars enabled on Performance column
   - Color: #11998e gradient
```

#### 4. Add Charts
```
Left: Industry Distribution Pie Chart
Right: Geographic Map
Both with white backgrounds and rounded corners
```

### DAX Measures for Page 2

```dax
// Elite Customer Ranking
CustomerRank = 
RANKX(
    FILTER(ALL(customer_metrics), customer_metrics[is_top_20] = TRUE),
    customer_metrics[total_gross_margin],
    ,
    DESC,
    DENSE
)

// Performance Score
PerformanceScore = 
DIVIDE(
    customer_metrics[total_gross_margin],
    MAX(customer_metrics[total_gross_margin]),
    0
) * 100
```

---

## 🔍 PAGE 3: Customer Deep Dive

### Theme Colors
- Background: Pink Gradient (#f093fb → #f5576c)
- Metric Boxes: Pink gradient with white text

### Step-by-Step Implementation

#### 1. Customer Profile Card
```
1. Large white rectangle (1800px x 500px)
2. Top section:
   - Left: Company name (42pt, bold)
   - Right: Elite badge (gold gradient pill)
3. Bottom section:
   - 5 metric boxes with pink gradient
   - Arranged horizontally
```

#### 2. Metric Boxes (5 across)
```
Each box:
- Size: 340px x 140px
- Background: Pink gradient (#f093fb → #f5576c)
- Text: White
- Metrics:
  1. Lifetime Value
  2. Gross Margin
  3. Margin Rate
  4. Orders/Year
  5. Avg Order Value
```

#### 3. Charts Row
```
Left: Revenue & Margin Trend (Dual-Axis Line)
- Size: 1200px x 350px
- Time series: Last 24 months

Right: Product Mix (Donut Chart)
- Size: 620px x 350px
- By category
```

#### 4. Activity Timeline
```
1. White card visual
2. Use Table visual styled as timeline
3. Columns: Date | Event | Details
4. Color-coded event types
```

#### 5. Recommendations Cards (3 across)
```
Three cards with:
- Icon (emoji text box)
- Title
- Recommendation text
Background: White
Icon Color: Matching theme
```

### DAX for Customer Selection

```dax
// Selected Customer ID (using slicer)
SelectedCustomerID = SELECTEDVALUE(customers[customer_id])

// Customer Lifetime Value
CustomerLTV = 
CALCULATE(
    SUM(orders[order_revenue]),
    FILTER(orders, orders[customer_id] = [SelectedCustomerID])
)

// Orders Per Year
OrdersPerYear = 
CALCULATE(
    COUNTROWS(orders),
    FILTER(orders, orders[customer_id] = [SelectedCustomerID])
) / DISTINCTCOUNT(orders[order_year])
```

---

## 🚀 PAGE 4: Growth Opportunities

### Theme Colors
- Background: Blue Gradient (#4facfe → #00f2fe)
- ICP Section: Light blue accents
- Target Cards: Light blue gradient backgrounds

### Step-by-Step Implementation

#### 1. Opportunity Metrics (4 cards across)
```
Each card:
- White background
- Blue top border (#4facfe)
- Large emoji icon
- 42pt value
- Label underneath
```

#### 2. ICP Traits Section
```
Large white card containing:
- Header: "Ideal Customer Profile"
- 6 trait boxes in 3x2 grid
- Each trait:
  - Light blue gradient background (#e0f7fa)
  - Left border: 6px solid #4facfe
  - Category, Value, Insight
```

#### 3. Target Account Cards
```
2x2 grid of target cards:
- Light blue gradient background
- Similarity score badge (top right)
- Company name (24pt, bold)
- Details (industry, location, size)
- Match reason tags (blue pills)
```

#### 4. Action Plan Cards (3 across)
```
Each card:
- White background
- Numbered circle (blue gradient)
- Title
- Action description
```

### DAX for ICP & Targets

```dax
// Top Industry
TopIndustry = 
CALCULATE(
    FIRSTNONBLANK(customers[industry], 1),
    TOPN(1, VALUES(customers[industry]), 
        CALCULATE(COUNTROWS(customer_metrics), customer_metrics[is_top_20] = TRUE), DESC)
)

// Target Account Count
TargetAccountCount = COUNTROWS(lookalike_targets)

// Pipeline Value
PipelineValue = 
SUMX(
    lookalike_targets,
    lookalike_targets[estimated_value]
)
```

---

## 🎨 Design Best Practices

### 1. Gradient Backgrounds
```
Power BI doesn't support CSS gradients directly. Options:

A. Use solid background color (top gradient color)
B. Import gradient image as background
C. Use transparent overlays with shapes
```

**To add gradient image:**
```
1. Create gradient PNG in Photoshop/Figma (1920x1080)
2. Format → Page Background → Image → Browse
3. Set Image Fit: Fill
4. Transparency: 0%
```

### 2. Rounded Corners
```
All card visuals:
Format → Visual Border → Rounded Corners: 20-30px
```

### 3. Shadows
```
Format → Effects → Shadow
- Color: Black
- Transparency: 60%
- Size: 20px
- Blur: 60px
- Angle: 315°
- Distance: 20px
```

### 4. Typography
```
Headers: Segoe UI Bold, 36-48pt
KPIs: Segoe UI Bold, 42-56pt
Hero Numbers: Segoe UI Black, 96-140pt
Labels: Segoe UI Semibold, 13-16pt
Body: Segoe UI Regular, 14-16pt
```

### 5. Spacing
```
Card Gaps: 25px
Section Margins: 30-40px
Internal Padding: 30-40px
Top/Bottom Padding: 40-60px
```

---

## 🔗 Data Connection Setup

### Connect to PostgreSQL

```
1. Home → Get Data → PostgreSQL Database
2. Server: localhost:5432
3. Database: strikezone_db
4. Data Connectivity: DirectQuery (for real-time)
   OR Import (for faster performance)
```

### Required Tables
```sql
- customers
- orders
- order_lines
- products
- customer_metrics
- icp_traits (if available)
- lookalike_targets (if available)
```

### Data Model Relationships
```
customers[customer_id] → orders[customer_id] (One-to-Many)
customers[customer_id] → customer_metrics[customer_id] (One-to-One)
orders[order_id] → order_lines[order_id] (One-to-Many)
products[product_id] → order_lines[product_id] (Many-to-One)
```

---

## 📱 Mobile Layout

### Enable Mobile View
```
View → Mobile Layout
Rearrange visuals in vertical stack
Prioritize hero metrics at top
```

---

## 🎯 Publishing & Sharing

### Publish to Power BI Service
```
1. Home → Publish
2. Select workspace
3. Open in Power BI Service
4. Set refresh schedule (if Import mode)
```

### Create App
```
1. Workspace → Create App
2. Add all 4 pages
3. Set permissions
4. Share link with CEO/leadership
```

---

## 🛠️ Troubleshooting

### Gradients Not Showing
- Use background images instead of solid colors
- Create PNGs with gradients in external tool

### Performance Issues
- Use Import mode instead of DirectQuery
- Create aggregated tables
- Limit row count with filters

### Fonts Not Matching
- Install Segoe UI if missing
- Use system fonts: "Segoe UI", Tahoma, Arial

---

## 📚 Resources

### Gradient Image Generator
- Use provided HTML files as reference
- Take screenshots (1920x1080)
- Or create in Figma/Photoshop

### Color Palette
```css
Purple: #667eea, #764ba2
Green: #11998e, #38ef7d
Pink: #f093fb, #f5576c
Blue: #4facfe, #00f2fe
Red: #E74C3C, #C0392B
Gold: #FFD700, #FFA500
```

### Icon Sources
- Use Unicode emojis in text boxes
- Or Power BI icon library
- Or custom SVGs

---

## ✅ Checklist

### Before Starting
- [ ] Power BI Desktop installed
- [ ] Database connection tested
- [ ] Sample data loaded
- [ ] HTML mockups reviewed

### Page 1
- [ ] Purple gradient background
- [ ] Hero card with 87.3% metric
- [ ] 4 KPI cards with colored borders
- [ ] Revenue trend chart
- [ ] Pareto chart

### Page 2
- [ ] Green gradient background
- [ ] 3 metric cards (gold/silver/bronze)
- [ ] Elite customer table with rankings
- [ ] Industry pie chart
- [ ] Geographic map

### Page 3
- [ ] Pink gradient background
- [ ] Customer profile card
- [ ] 5 metric boxes
- [ ] Revenue/margin trend chart
- [ ] Product mix donut
- [ ] Activity timeline
- [ ] 3 recommendation cards

### Page 4
- [ ] Blue gradient background
- [ ] 4 opportunity metrics
- [ ] ICP traits section (6 traits)
- [ ] Target account cards (4 cards)
- [ ] 3 action plan cards

### Final Steps
- [ ] Test all interactions
- [ ] Verify data accuracy
- [ ] Set up automatic refresh
- [ ] Publish to service
- [ ] Share with stakeholders

---

## 🎉 You're Ready!

Open the HTML files in your browser to see the target designs, then follow this guide to recreate them in Power BI. The HTML files can also serve as presentation mockups while you build the real dashboard.

**Questions?** Review the `Phase Details/CEO_Version_PowerBI_Only_POC_Guide.md` for additional context.
