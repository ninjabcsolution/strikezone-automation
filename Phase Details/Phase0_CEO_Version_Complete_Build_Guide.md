# Phase 0 — CEO Version: Complete Build Guide
## Power BI Dashboard with Page Layouts & Design Recommendations

**Timeline:** 4 business days  
**Deliverable:** Professional CEO dashboard proving the concept

---

## Overview

You will build a **3-core-page Power BI dashboard + 1 dynamic “Key Findings Summary” page** (4 pages total) that demonstrates:
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

### Key Findings Summary (Dynamic Narrative) — Option B (Recommended)

These measures power a **dynamic** CEO-friendly “Key Findings Summary” page.

> Why this matters: your data will refresh and slicers may change context — this prevents stale, hard-coded findings.

#### Segment helper measures (Top 20% vs Other 80%)

```dax
Other 80% Customer Count =
MAX( [Customer Count] - [Top 20% Customer Count], 0 )
```

```dax
Other 80% Gross Margin =
[Total Gross Margin] - [Top 20% Gross Margin]
```

```dax
Top 20% Revenue =
VAR N = [Top 20% Customer Count]
RETURN
CALCULATE(
    [Total Revenue],
    FILTER(
        ALL(Customers[customer_id]),
        [Customer GM Rank] <= N
    )
)
```

```dax
Other 80% Revenue =
[Total Revenue] - [Top 20% Revenue]
```

```dax
Top 20% Avg GM / Customer =
DIVIDE([Top 20% Gross Margin], [Top 20% Customer Count], 0)
```

```dax
Other 80% Avg GM / Customer =
DIVIDE([Other 80% Gross Margin], [Other 80% Customer Count], 0)
```

```dax
Top 20% Orders =
VAR N = [Top 20% Customer Count]
RETURN
CALCULATE(
    [Order Count],
    FILTER(
        ALL(Customers[customer_id]),
        [Customer GM Rank] <= N
    )
)
```

```dax
Other 80% Orders =
[Order Count] - [Top 20% Orders]
```

```dax
Top 20% Orders / Customer =
DIVIDE([Top 20% Orders], [Top 20% Customer Count], 0)
```

```dax
Other 80% Orders / Customer =
DIVIDE([Other 80% Orders], [Other 80% Customer Count], 0)
```

```dax
Order Frequency Multiplier =
DIVIDE([Top 20% Orders / Customer], [Other 80% Orders / Customer], 0)
```

```dax
Top 20% Avg Categories =
VAR N = [Top 20% Customer Count]
RETURN
AVERAGEX(
    FILTER(ALL(Customers[customer_id]), [Customer GM Rank] <= N),
    [Categories Purchased]
)
```

```dax
Other 80% Avg Categories =
VAR N = [Top 20% Customer Count]
RETURN
AVERAGEX(
    FILTER(ALL(Customers[customer_id]), [Customer GM Rank] > N),
    [Categories Purchased]
)
```

```dax
Top 20% Margin % =
DIVIDE([Top 20% Gross Margin], [Top 20% Revenue], 0)
```

```dax
Other 80% Margin % =
DIVIDE([Other 80% Gross Margin], [Other 80% Revenue], 0)
```

```dax
Top 20% Avg Order Value =
DIVIDE([Top 20% Revenue], [Top 20% Orders], 0)
```

```dax
Other 80% Avg Order Value =
DIVIDE([Other 80% Revenue], [Other 80% Orders], 0)
```

#### Key Findings (dynamic text) — use these in Card visuals

```dax
KF 01 — Profit Concentration =
VAR EliteN = [Top 20% Customer Count]
VAR TotalN = [Customer Count]
VAR ElitePct = DIVIDE(EliteN, TotalN, 0)
RETURN
"• " & FORMAT(EliteN, "0") & " customers (" & FORMAT(ElitePct, "0%") & ") generate " &
FORMAT([Top 20% GM Contribution %], "0%") & " of gross margin."
```

```dax
KF 02 — Avg Margin Comparison =
VAR Elite = [Top 20% Avg GM / Customer]
VAR Other = [Other 80% Avg GM / Customer]
RETURN
"• Avg margin/customer: " & FORMAT(DIVIDE(Elite, 1000), "$0.0K") &
" vs " & FORMAT(DIVIDE(Other, 1000), "$0.0K") & " (others)."
```

```dax
KF 03 — Order Frequency =
VAR Mult = [Order Frequency Multiplier]
RETURN
"• Order frequency: " & FORMAT(Mult, "0.0x") & " (" &
FORMAT([Top 20% Orders / Customer], "0.0") & " vs " & FORMAT([Other 80% Orders / Customer], "0.0") &
" orders/customer)."
```

```dax
KF 04 — Product Breadth =
"• Product breadth: " & FORMAT([Top 20% Avg Categories], "0.0") &
" categories vs " & FORMAT([Other 80% Avg Categories], "0.0") & "."
```

```dax
KF 05 — Margin Rate =
"• Margin rate: " & FORMAT([Top 20% Margin %], "0%") &
" vs " & FORMAT([Other 80% Margin %], "0%") & "."
```

```dax
KF 06 — Avg Order Value =
"• Avg order value: " & FORMAT([Top 20% Avg Order Value], "$#,0") &
" vs " & FORMAT([Other 80% Avg Order Value], "$#,0") & "."
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

## Step 9 — Create 1-Page Findings Summary (Dynamic)

This page should be **data-driven** (Option B): the findings update automatically when:
- the dataset refreshes (new month, new customers)
- the CEO uses filters/slicers (optional)

### Add a 4th page: **Key Findings Summary**

> Note: the layout below shows **example values**. In your Power BI report, the bullets should be driven by the `KF xx` measures so they update automatically.

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

### Build Instructions (Option B)

#### 9.1 Create the narrative measures
If you haven’t already, create the measures in **Step 4 → Key Findings Summary (Dynamic Narrative)**.

#### 9.2 Build the “Top 20% Customer Profile” block (dynamic)
1. Insert a **rounded rectangle** shape as the container.
2. Add a **Text box** title: `TOP 20% CUSTOMER PROFILE`.
3. Add **4–6 Card visuals** (one per line) and bind them to these measures:
   - `KF 01 — Profit Concentration`
   - `KF 02 — Avg Margin Comparison`
   - `KF 03 — Order Frequency`
   - `KF 04 — Product Breadth`
   - (optional) `KF 05 — Margin Rate`
   - (optional) `KF 06 — Avg Order Value`

**Card formatting (recommended):**
- Category label: Off
- Background: Off (transparent)
- Callout value font: Segoe UI 12–16pt
- Callout value color: #2C3E50

#### 9.3 Build the “ICP Traits” block (dynamic visuals, not hard-coded text)
Instead of hard-coded industries/states, use **mini visuals** that stay accurate as data changes:

1. **Bar chart** (Top industries among Top 20%):
   - Axis: `Customers[industry]`
   - Values: `Top 20% Gross Margin`
   - Visual-level filter: Top N = 5 industries by `Top 20% Gross Margin`

2. **Map** (Top states among Top 20%):
   - Location: `Customers[state]`
   - Size: `Top 20% Gross Margin`

3. Add 1–2 **dynamic trait cards** (optional) using:
   - `KF 05 — Margin Rate`
   - `KF 06 — Avg Order Value`

#### 9.4 Build the “What This Means” block
This section can remain **static** (strategy statements), because it’s not a metric — it’s an executive conclusion.

If you want it partially dynamic, add a small card that repeats the headline:
- Card: `Top 20% GM Contribution %`
- Text box next to it: “Pareto effect confirmed.”

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

Preferred (no manual copy):
1. Export the full report PDF (includes the Key Findings page)
2. If you need a *single-page* PDF for email:
   - In Power BI Service: Export **current page** to PDF
   - Or: Take a high-res screenshot of Page 4 and save as PDF

Name: `Strikezone_Phase0_Findings_Summary.pdf`

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
- [ ] Build Page 4 (Key Findings Summary — Dynamic)
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
