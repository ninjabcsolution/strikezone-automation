# Power BI CEO Dashboard (Click-by-Click Guide)
## Build a CEO-ready “feasibility demo” dashboard in 60–120 minutes (beginner friendly)

This guide assumes you are new to Power BI.

You will build a simple CEO dashboard using the sample data already in this folder:

`sample_data_ceo/`
- Customers.csv
- Orders.csv
- OrderLines.csv
- Products.csv

---

## What you will build (CEO version)

### Page 1 — Executive Overview
- Total Revenue, Total Gross Margin, Margin %
- # Customers, # Orders
- KPI: “Top 20% customers contribute X% of Gross Margin”
- Monthly trend chart (Gross Margin by month)

### Page 2 — Top 20% Customers
- Bar chart: Top customers by Gross Margin (Top N filter)
- Table: Customer metrics
- Slicers: Industry, State

### Page 3 — ICP Patterns (What “good” looks like)
- Industry distribution (Top 20% vs All)
- Geo map (Gross Margin by State)
- Scatter: Order Frequency vs Margin %
- Product mix: categories purchased

---

## Step 0 — Install Power BI Desktop
Power BI Desktop is free.

1. Download: https://powerbi.microsoft.com/desktop
2. Install and open **Power BI Desktop**

---

## Step 1 — Load the sample CSV data

1. Open **Power BI Desktop**
2. Click **Home** → **Get Data** → **Text/CSV**
3. Import these files one by one from `sample_data_ceo/`:
   - `Customers.csv`
   - `Orders.csv`
   - `OrderLines.csv`
   - `Products.csv`

For each file:
- When preview opens, click **Load** (bottom-right)

✅ After loading, you should see tables in the **Fields** panel (right side).

---

## Step 2 — Create relationships (VERY important)

1. On the left sidebar, click **Model view** (the icon looks like connected boxes)
2. Create relationships by drag-and-drop:

### Relationship A
- Drag `Customers[customer_id]` → `Orders[customer_id]`
- Cardinality should be **One to many (1:*)**

### Relationship B
- Drag `Orders[order_id]` → `OrderLines[order_id]`

### Relationship C
- Drag `Products[product_id]` → `OrderLines[product_id]`

✅ You should see lines connecting the tables.

---

## Step 3 — Create a Date table (helps with monthly trends)

1. Click **Modeling** → **New table**
2. Paste this:

```dax
Calendar = CALENDAR ( DATE(2023,1,1), TODAY() )
```

3. Now create relationship:
- `Calendar[Date]` → `Orders[order_date]`

If `Orders[order_date]` is a text field, do this first:
- Go to **Data view**
- Click `Orders[order_date]`
- Modeling → **Data type** → Date

---

## Step 4 — Create measures (copy/paste DAX)

Go to **Modeling** → **New measure** and add each one.

### Core financial measures

```dax
Total Revenue = SUM ( Orders[order_revenue] )
```

```dax
Total Gross Margin = SUM ( Orders[gross_margin] )
```

```dax
Gross Margin % = DIVIDE ( [Total Gross Margin], [Total Revenue], 0 )
```

### Volume measures

```dax
Order Count = COUNTROWS ( Orders )
```

```dax
Customer Count = DISTINCTCOUNT ( Customers[customer_id] )
```

```dax
Avg Order Value = DIVIDE ( [Total Revenue], [Order Count], 0 )
```

### Top 20% KPI (CEO metric)

We’ll calculate “Top 20% contribution” like this:
- Compute margin by customer
- Rank customers by margin
- Sum margin for top 20% customers

#### Step 4.1 — Customer Margin

```dax
Customer GM = [Total Gross Margin]
```

#### Step 4.2 — Customer Rank by GM

```dax
Customer GM Rank =
RANKX (
    ALL ( Customers[customer_id] ),
    [Customer GM],
    ,
    DESC,
    Dense
)
```

#### Step 4.3 — Top 20% Customer Count

```dax
Top 20% Customer Count =
ROUNDUP ( [Customer Count] * 0.2, 0 )
```

#### Step 4.4 — Top 20% GM

```dax
Top 20% Gross Margin =
VAR N = [Top 20% Customer Count]
RETURN
CALCULATE (
    [Total Gross Margin],
    FILTER (
        ALL ( Customers[customer_id] ),
        [Customer GM Rank] <= N
    )
)
```

#### Step 4.5 — Top 20% Contribution %

```dax
Top 20% GM Contribution % =
DIVIDE ( [Top 20% Gross Margin], [Total Gross Margin], 0 )
```

---

## Step 5 — Build Page 1: Executive Overview

Go to **Report view** (bar chart icon on left).

### Add KPI cards
1. Click **Card** visual
2. Drag measures into it:
   - Total Revenue
   - Total Gross Margin
   - Gross Margin %
   - Customer Count
   - Order Count
   - Top 20% GM Contribution %

Tip: create **6 separate cards** (one per KPI) and arrange in a row.

### Add monthly trend chart
1. Choose **Line chart** visual
2. Axis: `Calendar[Date]` (change to Month)
3. Values: `Total Gross Margin`

---

## Step 6 — Build Page 2: Top 20% Customers

### Bar chart (Top customers)
1. Choose **Clustered bar chart**
2. Axis: `Customers[customer_name]`
3. Values: `Total Gross Margin`

### Apply “Top N” filter
1. Click the bar chart
2. In Filters pane → Visual level filters
3. Add `Customers[customer_name]`
4. Change filter type to **Top N**
5. Set Top = 24 (for this sample), by `Total Gross Margin`
6. Click **Apply filter**

### Table (customer metrics)
1. Add **Table** visual
2. Add fields:
   - Customers[customer_name]
   - Total Revenue
   - Total Gross Margin
   - Gross Margin %
   - Order Count
   - Avg Order Value

### Add slicers
Add **Slicer** visuals for:
- Customers[industry]
- Customers[state]

---

## Step 7 — Build Page 3: ICP Patterns

### Industry distribution
Add **bar chart**:
- Axis: Customers[industry]
- Values: Total Gross Margin

### Geo map
Add **Map** visual:
- Location: Customers[state]
- Size: Total Gross Margin

### Scatter plot: frequency vs margin
Add **Scatter chart**:
- X-axis: Order Count
- Y-axis: Gross Margin %
- Details: Customers[customer_name]
- Size: Total Revenue

### Product mix breadth
Add **Bar chart** or **Table**:
- Customers[customer_name]
- Categories Purchased

---

## Step 8 — Make it CEO-ready (formatting)

Quick polish steps:

1. Add page titles: **Insert → Text box**
2. Format numbers:
   - Revenue/Margin: Currency
   - % measures: Percentage
3. Use consistent colors (2–3 max)
4. Add a logo: **Insert → Image**
5. Keep pages simple: no more than 6–8 visuals per page

---

## Step 9 — Export for CEO

### Option A: Export as PDF
In Power BI Desktop:
- **File → Export → Export to PDF**

### Option B: Publish to Power BI Service
If you have a Pro license:
- **Home → Publish**

---

## If you get stuck (common beginner issues)

### Issue: Relationships don’t work
- Check that both columns are the same data type (Text vs Text)
- Ensure IDs match (customer_id, order_id)

### Issue: Order date is text
- Data view → select column → Modeling → Data type → Date

### Issue: Top 20% measure returns blank
- Make sure you created measures exactly
- Make sure Customer GM Rank measure is working
- Ensure Customers table is related to Orders

---

## Next step after CEO demo

Once the CEO approves feasibility, you move from “Power BI only” to automation:
- Apollo enrichment automation
- AI messaging automation
- (Optional) custom app to orchestrate the workflow
