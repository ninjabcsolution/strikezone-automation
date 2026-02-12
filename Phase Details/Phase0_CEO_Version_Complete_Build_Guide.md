# Phase 0 — CEO Version: Complete Build Guide
## Power BI Dashboard with Page Layouts & Design Recommendations

**Timeline:** 4 business days  
**Deliverable:** Professional CEO dashboard proving the concept

---

## Overview

You will build a 3-page Power BI dashboard that demonstrates:
- Top 20% customer identification
- ICP trait extraction
- Data-driven targeting feasibility

**Sample data location:** `sample_data_ceo/`
- Customers.csv (120 customers)
- Orders.csv (3,495 orders over 36 months)
- OrderLines.csv (15,767 line items)
- Products.csv (80 products across 8 categories)

---

## Step 1 — Load Data into Power BI

### 1.1 Install Power BI Desktop
- Download free: https://powerbi.microsoft.com/desktop
- Install and open

### 1.2 Load CSVs
1. **Home** → **Get Data** → **Text/CSV**
2. Load these files from `sample_data_ceo/`:
   - `Customers.csv`
   - `Orders.csv`
   - `OrderLines.csv`
   - `Products.csv`
3. For each file: click **Load** when preview appears

---

## Step 2 — Create Relationships

1. Click **Model view** (left sidebar, box icon)
2. Create relationships by dragging:
   - `Customers[customer_id]` → `Orders[customer_id]` (1:many)
   - `Orders[order_id]` → `OrderLines[order_id]` (1:many)
   - `Products[product_id]` → `OrderLines[product_id]` (1:many)

---

## Step 3 — Create Date Table

1. **Modeling** → **New table**
2. Paste:
```dax
Calendar = CALENDAR(DATE(2023,1,1), TODAY())
```
3. Create relationship: `Calendar[Date]` → `Orders[order_date]`

**If order_date is text:**
- Go to **Data view**
- Click `Orders[order_date]` column
- **Modeling** → **Data type** → **Date**

---

## Step 4 — Create All DAX Measures

Copy/paste these measures (**Modeling** → **New measure** for each):

### Core Financial Measures
```dax
Total Revenue = SUM(Orders[order_revenue])
```

```dax
Total Gross Margin = SUM(Orders[gross_margin])
```

```dax
Gross Margin % = DIVIDE([Total Gross Margin], [Total Revenue], 0)
```

### Volume Measures
```dax
Order Count = COUNTROWS(Orders)
```

```dax
Customer Count = DISTINCTCOUNT(Customers[customer_id])
```

```dax
Avg Order Value = DIVIDE([Total Revenue], [Order Count], 0)
```

### Top 20% KPI Measures

```dax
Customer GM = [Total Gross Margin]
```

```dax
Customer GM Rank = 
RANKX(
    ALL(Customers[customer_id]),
    [Customer GM],
    ,
    DESC,
    Dense
)
```

```dax
Top 20% Customer Count = ROUNDUP([Customer Count] * 0.2, 0)
```

```dax
Top 20% Gross Margin = 
VAR N = [Top 20% Customer Count]
RETURN
CALCULATE(
    [Total Gross Margin],
    FILTER(
        ALL(Customers[customer_id]),
        [Customer GM Rank] <= N
    )
)
```

```dax
Top 20% GM Contribution % = 
DIVIDE([Top 20% Gross Margin], [Total Gross Margin], 0)
```

### Product Mix Measure
```dax
Categories Purchased = DISTINCTCOUNT(OrderLines[product_category])
```

### Order Frequency (per customer)
```dax
Orders per Customer = DIVIDE([Order Count], [Customer Count], 0)
```

---

## Step 5 — Page 1: Executive Overview

### Page Layout (Visual Placement)

```
┌─────────────────────────────────────────────────────────────┐
│  Executive Overview - Strikezone CEO Dashboard              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │ Total   │  │ Total   │  │ Margin  │  │Customer │      │
│  │Revenue  │  │Gross    │  │   %     │  │ Count   │      │
│  │$12.3M   │  │Margin   │  │  28%    │  │  120    │      │
│  │         │  │$3.4M    │  │         │  │         │      │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  KEY INSIGHT (Big Card)                             │   │
│  │  Top 20% Customers Contribute                       │   │
│  │         78%                                         │   │
│  │  of Total Gross Margin                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Gross Margin Trend (Line Chart)                   │    │
│  │  (Monthly over 36 months)                          │    │
│  │                                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────┐  ┌────────────────────────────┐      │
│  │  Avg Order Value │  │  Orders per Customer       │      │
│  │  $3,500          │  │  29                        │      │
│  └──────────────────┘  └────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Build Instructions

1. **Add title text box:**
   - **Insert** → **Text box**
   - Type: "Executive Overview - Strikezone CEO Dashboard"
   - Font: Segoe UI, 18pt, Bold
   - Color: #003366 (dark blue)

2. **Add 4 KPI cards (top row):**
   - Visual: **Card**
   - Drag these measures (one card each):
     - Total Revenue
     - Total Gross Margin
     - Gross Margin %
     - Customer Count
   - Format each card:
     - **Format** → **Call out value**
     - Font: 32pt, Bold
     - Color: #003366

3. **Add Top 20% KPI (big card):**
   - Visual: **Card**
   - Measure: `Top 20% GM Contribution %`
   - Format:
     - Value font: 72pt, Bold
     - Color: #E74C3C (red for emphasis)
   - Add text box above: "Top 20% Customers Contribute"
   - Add text box below: "of Total Gross Margin"

4. **Add Gross Margin Trend (line chart):**
   - Visual: **Line chart**
   - X-axis: `Calendar[Date]` (set to Month level)
   - Y-axis: `Total Gross Margin`
   - Format:
     - Line color: #27AE60 (green)
     - Data labels: Off
     - Grid lines: Light gray

5. **Add 2 bottom KPI cards:**
   - Visual: **Card** (2 cards)
   - Measures: `Avg Order Value`, `Orders per Customer`

---

## Step 6 — Page 2: Top 20% Customers

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Top 20% Best Customers                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────┐  ┌────────┐                                    │
│  │Industry│  │ State  │  (Slicers)                         │
│  │Filter  │  │Filter  │                                    │
│  └────────┘  └────────┘                                    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Top 24 Customers by Gross Margin (Bar Chart)     │    │
│  │  ───────────────────────────────────────          │    │
│  │  Customer A  ████████████████████████ $250K       │    │
│  │  Customer B  ██████████████████ $180K             │    │
│  │  Customer C  ███████████████ $150K                │    │
│  │  ...                                               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Customer Details Table                            │    │
│  │  ┌─────────┬─────┬──────┬────┬────┬───────┐       │    │
│  │  │Customer │Rev  │Margin│Mgn%│Ords│AOV    │       │    │
│  │  ├─────────┼─────┼──────┼────┼────┼───────┤       │    │
│  │  │Cust A   │$500K│$250K │50% │ 45 │$11,111│       │    │
│  │  │Cust B   │$400K│$180K │45% │ 38 │$10,526│       │    │
│  │  │...      │     │      │    │    │       │       │    │
│  │  └─────────┴─────┴──────┴────┴────┴───────┘       │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Build Instructions

1. **Add title text box:**
   - Text: "Top 20% Best Customers"
   - Font: Segoe UI, 18pt, Bold

2. **Add 2 slicers:**
   - Visual: **Slicer** (add 2)
   - Fields:
     - `Customers[industry]`
     - `Customers[state]`
   - Format:
     - Style: Dropdown
     - Header: On, bold

3. **Add bar chart (Top 24 customers):**
   - Visual: **Clustered bar chart**
   - Y-axis: `Customers[customer_name]`
   - X-axis: `Total Gross Margin`
   - **Apply Top N filter:**
     - Click chart
     - **Filters pane** → **Visual level filters**
     - Add `Customers[customer_name]`
     - Change to **Top N**
     - Top **24** by `Total Gross Margin`
     - Click **Apply filter**
   - Format:
     - Bar color: #3498DB (blue)
     - Data labels: On
     - Sort: Descending by Gross Margin

4. **Add customer details table:**
   - Visual: **Table**
   - Columns (drag in this order):
     - `Customers[customer_name]`
     - `Total Revenue`
     - `Total Gross Margin`
     - `Gross Margin %`
     - `Order Count`
     - `Avg Order Value`
   - Format:
     - Grid style: Rows only
     - Text size: 10pt
     - Alternating row color: Light gray
     - Number formats:
       - Revenue/Margin: Currency, $0.0K
       - Margin %: Percentage, 0%

---

## Step 7 — Page 3: ICP Patterns

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ICP Patterns: What "Good" Looks Like                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────┐     │
│  │ Margin by Industry      │  │ Margin by State      │     │
│  │ (Stacked Column)        │  │ (Map)                │     │
│  │ ▅ Industrial Machinery  │  │   ●TX                │     │
│  │ ▅ Chemicals             │  │    ●IL               │     │
│  │ ▅ Transportation Equip  │  │ ●OH                  │     │
│  │                         │  │    ●MI               │     │
│  └─────────────────────────┘  └──────────────────────┘     │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Order Frequency vs Margin % (Scatter Plot)        │    │
│  │  High Margin, High Frequency = Best Customers      │    │
│  │   Margin %                                         │    │
│  │     ↑     ●●                                       │    │
│  │     │   ●  ●●●                                     │    │
│  │     │ ●● ●   ●                                     │    │
│  │     └───────────→ Order Count                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌───────────────────────┐  ┌──────────────────────┐       │
│  │ Product Mix (Top20%)  │  │ Product Mix (Others) │       │
│  │ (Donut Chart)         │  │ (Donut Chart)        │       │
│  │ 8 categories avg      │  │ 4 categories avg     │       │
│  └───────────────────────┘  └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Build Instructions

1. **Add title:**
   - Text: "ICP Patterns: What 'Good' Looks Like"

2. **Add Industry column chart:**
   - Visual: **Stacked column chart**
   - X-axis: `Customers[industry]`
   - Y-axis: `Total Gross Margin`
   - Format:
     - Colors: Use a gradient (blue → green)
     - Data labels: On
     - Sort: Descending by Gross Margin

3. **Add State map:**
   - Visual: **Map**
   - Location: `Customers[state]`
   - Size: `Total Gross Margin`
   - Format:
     - Bubble color: #E74C3C (red)
     - Bubble max size: 50%

4. **Add scatter plot:**
   - Visual: **Scatter chart**
   - X-axis: `Order Count`
   - Y-axis: `Gross Margin %`
   - Details: `Customers[customer_name]`
   - Size: `Total Revenue`
   - Format:
     - Marker color: #9B59B6 (purple)
     - Add quadrant lines (manually via shapes)

5. **Add 2 donut charts (comparison):**
   - **Chart 1 (Top 20%):**
     - Visual: **Donut chart**
     - Legend: `OrderLines[product_category]`
     - Values: `Total Revenue`
     - Filter: Apply Top 20% filter (use `Customer GM Rank <= 24`)
     - Title: "Product Mix - Top 20%"
   
   - **Chart 2 (Others):**
     - Same visual
     - Filter: `Customer GM Rank > 24`
     - Title: "Product Mix - Others"

---

## Step 8 — Apply Design & Formatting

### Color Palette (Consistent Theme)
- **Primary:** #003366 (Dark Blue) — titles, headers
- **Accent 1:** #3498DB (Blue) — bars, positive data
- **Accent 2:** #27AE60 (Green) — growth, trends
- **Accent 3:** #E74C3C (Red) — emphasis, alerts
- **Background:** #F5F5F5 (Light Gray)
- **Text:** #2C3E50 (Dark Gray)

### Apply to all pages:
1. **View** → **Themes** → **Customize current theme**
2. Set colors above
3. **Format** → **Canvas background**
   - Color: #F5F5F5
4. All text boxes:
   - Font: Segoe UI
   - Title: 18pt Bold
   - Subtitle: 12pt Regular

---

## Step 9 — Create 1-Page Findings Summary

### Add a 4th page (Summary Page)

```
┌─────────────────────────────────────────────────────────────┐
│  Key Findings Summary                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TOP 20% CUSTOMER PROFILE                                   │
│  ┌──────────────────────────────────────────────┐          │
│  │ • 24 customers (20%) generate 78% of margin  │          │
│  │ • Average margin: $140K vs $18K (others)      │          │
│  │ • Order 2.8× more frequently                  │          │
│  │ • Purchase from 6.5 categories vs 3.2         │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ICP TRAITS (What "Good" Looks Like)                        │
│  ┌──────────────────────────────────────────────┐          │
│  │ Industries:                                   │          │
│  │ • Industrial Machinery (NAICS 333) - 42%      │          │
│  │ • Chemicals (NAICS 325) - 25%                 │          │
│  │ • Transportation Equipment (336) - 17%        │          │
│  │                                                │          │
│  │ Geographic:                                    │          │
│  │ • TX, IL, OH, MI (Midwest/South focus)        │          │
│  │                                                │          │
│  │ Behavioral:                                    │          │
│  │ • 40-90 orders/36 months (1-2.5/month)        │          │
│  │ • Consistent ordering (active 28+/36 months)  │          │
│  │ • Broad product mix (6+ categories)           │          │
│  │                                                │          │
│  │ Financial:                                     │          │
│  │ • Higher margin % (35-42% vs 20-30%)          │          │
│  │ • Larger AOV ($8K-$15K vs $2K-$5K)            │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  WHAT THIS MEANS                                            │
│  ┌──────────────────────────────────────────────┐          │
│  │ ✓ We can systematically identify best customers│        │
│  │ ✓ ICP is data-backed, not guessed             │          │
│  │ ✓ Look-alike targeting is feasible            │          │
│  │ ✓ Full automation is justified by Pareto      │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

**Build this as a text-heavy page using text boxes** (no complex visuals).

---

## Step 10 — Export Deliverables

### Export 1: .pbix file
- **File** → **Save As**
- Name: `Strikezone_CEO_Dashboard_Phase0.pbix`

### Export 2: PDF
- **File** → **Export** → **Export to PDF**
- Name: `Strikezone_CEO_Dashboard_Phase0.pdf`
- Include all 4 pages

### Export 3: 1-Page Summary (Word/PDF)
- Copy findings from Page 4 into a Word doc
- Format cleanly
- Export to PDF
- Name: `Strikezone_Phase0_Findings_Summary.pdf`

---

## Checklist (4 days)

### Day 1
- [ ] Install Power BI Desktop
- [ ] Load all CSVs
- [ ] Create relationships
- [ ] Create date table
- [ ] Create all DAX measures

### Day 2
- [ ] Build Page 1 (Executive Overview)
- [ ] Build Page 2 (Top 20% Customers)
- [ ] Apply filters and formatting

### Day 3
- [ ] Build Page 3 (ICP Patterns)
- [ ] Build Page 4 (Findings Summary)
- [ ] Apply design theme consistently

### Day 4
- [ ] Final formatting polish
- [ ] Test all slicers and interactions
- [ ] Export .pbix and PDF
- [ ] Create 1-page summary document
- [ ] **Review with client**

---

## Tips for Success

### Design Best Practices
1. **Less is more:** Don't overcrowd pages (6–8 visuals max per page)
2. **Consistent colors:** Use the same palette throughout
3. **White space:** Leave breathing room between visuals
4. **Labels:** Always show data labels on key metrics
5. **Sort intelligently:** Descending for charts, alphabetical for slicers

### Common Issues
- **Slow performance:** Reduce data or use aggregations
- **Relationships broken:** Check data types match (text vs text)
- **Measures return blank:** Check table relationships exist

---

## What This Proves to Client

✅ **Top 20% can be identified** from ERP data automatically  
✅ **ICP traits are extractable** and explainable  
✅ **Data-driven targeting works** (Pareto principle validated)  
✅ **Full automation is justified** (clear ROI from manual → automated)

**Next step:** Client approves → proceed to full build (Phases 1–5)
