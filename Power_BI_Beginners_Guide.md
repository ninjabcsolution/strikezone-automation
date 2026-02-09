# Power BI Beginner's Guide
## Complete Tutorial for Connecting to Dynamics 365 ERP

---

## What You'll Learn
1. Power BI basics and terminology
2. How to install and set up Power BI Desktop
3. Step-by-step connection to Dynamics 365
4. Creating your first dashboard
5. Common troubleshooting tips

---

## Part 1: Understanding Power BI

### What is Power BI?
Power BI is Microsoft's **Business Intelligence** tool that helps you:
- 📊 **Visualize data** - Turn boring tables into beautiful charts
- 🔄 **Automate reports** - Set it once, updates automatically
- 🤝 **Share insights** - Collaborate with your team
- 📱 **Access anywhere** - View on desktop, web, or mobile

### Key Terminology

| Term | What It Means | Example |
|------|---------------|---------|
| **Dataset** | Your data source | Dynamics 365 customer data |
| **Report** | A page with visualizations | A dashboard showing sales trends |
| **Dashboard** | Collection of visuals from multiple reports | Executive summary view |
| **Measure** | Calculated value | Total Revenue, Average Margin |
| **DAX** | Formula language | Like Excel formulas |
| **Power Query** | Data transformation tool | Filter, clean, merge data |

### Power BI Components

```
┌─────────────────────────────────────────────┐
│         Power BI Desktop (Free)             │
│  • Create reports locally on your computer  │
│  • Connect to data sources                  │
│  • Design visualizations                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Power BI Service (Cloud - $10-20/mo)   │
│  • Publish reports to the cloud             │
│  • Share with team members                  │
│  • Schedule automatic refresh               │
│  • Access from anywhere                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Power BI Gateway (Free - Optional)     │
│  • Connect cloud to on-premises data        │
│  • Required for local Dynamics 365          │
└─────────────────────────────────────────────┘
```

---

## Part 2: Getting Started

### Step 1: Download Power BI Desktop

1. Go to: https://powerbi.microsoft.com/desktop
2. Click "Download Free"
3. Install the application (Windows only)
4. Launch Power BI Desktop

**Note:** Power BI Desktop is **FREE** and works without a license for local development.

### Step 2: Understand the Interface

When you open Power BI Desktop, you'll see three main views:

```
┌──────────────────────────────────────────────────────┐
│  Report View (📊)                                     │
│  • Where you create visualizations                   │
│  • Drag and drop charts                              │
│  • Design your dashboard                             │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Data View (🔢)                                       │
│  • See your data in table format                     │
│  • Create calculated columns                         │
│  • View all imported data                            │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Model View (🔗)                                      │
│  • Define relationships between tables               │
│  • See how data is connected                         │
│  • Manage your data model                            │
└──────────────────────────────────────────────────────┘
```

### Key Areas on Screen

```
┌─────────────────────────────────────────────────────────┐
│ File | Home | Insert | Modeling | View | Help           │ ← Ribbon (Tools)
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                                                         │
│              Canvas (Design Area)                       │ ← Your dashboard
│                                                         │
│                                                         │
│                                                         │
├──────────────────┬──────────────────┬───────────────────┤
│  Filters         │  Visualizations  │  Fields          │
│                  │                  │                  │
│  • Page filters  │  • Chart types   │  • Your tables   │ ← Right Panels
│  • Visual filters│  • Formatting    │  • Columns       │
│                  │                  │  • Measures      │
└──────────────────┴──────────────────┴───────────────────┘
```

---

## Part 3: Connecting to Dynamics 365

### Prerequisites Checklist
Before you start, make sure you have:
- ✅ Dynamics 365 login credentials (username + password)
- ✅ Dynamics 365 URL (e.g., https://yourcompany.crm.dynamics.com)
- ✅ Permission to access data (read-only is sufficient)
- ✅ Power BI Desktop installed
- ✅ Internet connection

### Step-by-Step Connection

#### Step 1: Start New Connection
1. Open Power BI Desktop
2. Click **"Get Data"** button (top left of Home ribbon)
3. A window will appear with data source options

#### Step 2: Find Dynamics 365
1. In the search box, type: **"Dynamics 365"**
2. You'll see several options:
   - **"Dynamics 365 (online)"** ← Choose this for cloud-based
   - "Dynamics 365 Customer Insights"
   - "Dynamics 365 Business Central"
3. Click **"Dynamics 365 (online)"**
4. Click **"Connect"**

#### Step 3: Enter Your Environment URL
```
┌────────────────────────────────────────────┐
│  Dynamics 365 (online)                     │
├────────────────────────────────────────────┤
│  Environment URL (required):               │
│  ┌──────────────────────────────────────┐ │
│  │ https://yourcompany.crm.dynamics.com │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [Cancel]                       [OK]       │
└────────────────────────────────────────────┘
```

1. Enter your Dynamics 365 URL
2. Click **"OK"**

#### Step 4: Authenticate
You'll see an authentication window:

1. Choose **"Organizational account"**
2. Click **"Sign in"**
3. Enter your Microsoft/Office 365 credentials
4. Complete any multi-factor authentication
5. Click **"Connect"**

#### Step 5: Select Tables (Entities)
After authentication, you'll see a **Navigator** window with all available tables:

**For Strikezone Project, select these tables:**

**Essential Tables:**
- ✅ `account` - Customer master data
- ✅ `salesorder` - Sales orders
- ✅ `salesorderdetail` - Order line items
- ✅ `product` - Product catalog
- ✅ `invoice` - Invoices
- ✅ `invoicedetail` - Invoice line items

**Optional but Useful:**
- ✅ `contact` - Contact information
- ✅ `opportunity` - Sales opportunities
- ✅ `systemuser` - Sales team members
- ✅ `territory` - Geographic territories

**How to Select:**
1. Check the box next to each table name
2. Click on a table to preview its data
3. Review the columns to ensure it has the data you need

#### Step 6: Load or Transform Data

You have two options:

**Option A: Load** (Quick Start)
- Imports data as-is
- Good for simple reports
- Click **"Load"** button

**Option B: Transform Data** (Recommended)
- Opens Power Query Editor
- Filter, clean, and shape data before loading
- Click **"Transform Data"** button

**For Strikezone Project, choose "Transform Data"**

---

## Part 4: Transforming Data (Power Query)

Power Query Editor opens automatically when you click "Transform Data".

### Important Transformations for Strikezone

#### Transformation 1: Filter to Last 36 Months

**For `salesorder` table:**
1. Click on the `salesorder` table (left panel)
2. Find the **"createdon"** or **"orderedon"** column
3. Click the dropdown arrow in the column header
4. Select **"Date/Time Filters"** → **"In the Previous..."**
5. Enter: **36 months**
6. Click **"OK"**

```
Before: All orders (10+ years of data)
After: Only orders from last 36 months ✓
```

#### Transformation 2: Calculate Gross Margin

**In `salesorderdetail` or `invoicedetail`:**
1. Click **"Add Column"** tab (top ribbon)
2. Click **"Custom Column"**
3. Name it: **"GrossMargin"**
4. Formula: 
```
= [baseamount] - [producttotalcost]
```
5. Click **"OK"**

#### Transformation 3: Remove Unnecessary Columns

**For performance, remove columns you don't need:**
1. Right-click on column header
2. Select **"Remove"** or **"Remove Other Columns"**

**Keep these columns for Strikezone:**

**account table:**
- accountid, name, accountnumber
- revenue, numberofemployees
- address1_city, address1_stateorprovince, address1_country
- industrycode, ownerid

**salesorder table:**
- salesorderid, ordernumber, name
- accountid, customerid
- totalamount, totaldiscountamount, totallineitemamount
- orderedon, statuscode

**salesorderdetail table:**
- salesorderdetailid, salesorderid, productid
- quantity, priceperunit, baseamount, extendedamount
- GrossMargin (your calculated column)

#### Transformation 4: Merge Tables

**Merge salesorder with account:**
1. Click on **"salesorder"** table
2. Click **"Merge Queries"** (Home tab)
3. Select **"account"** from dropdown
4. Click **"accountid"** in both tables
5. Join Kind: **"Left Outer"**
6. Click **"OK"**
7. Expand the new column to show customer name, industry, etc.

#### Step 5: Close & Apply
1. Review all transformations in left panel (Applied Steps)
2. Click **"Close & Apply"** (top left)
3. Wait for data to load (may take a few minutes)

---

## Part 5: Building Your First Dashboard

Now you're back in Report View with data loaded!

### Dashboard 1: Top 20% Customers by Gross Margin

#### Visual 1: Create a Measure for Total Gross Margin

1. Click **"Modeling"** tab (top ribbon)
2. Click **"New Measure"**
3. Enter this formula:
```dax
Total Gross Margin = SUM(salesorderdetail[GrossMargin])
```
4. Press Enter

#### Visual 2: Bar Chart of Top Customers

1. Click on blank canvas
2. In **Visualizations** panel, click **"Clustered bar chart"** icon
3. From **Fields** panel, drag:
   - `account[name]` → **Axis**
   - `Total Gross Margin` → **Values**
4. Click on the visual
5. Click **"Filters"** panel → Filter on this visual
6. Find the visual filter for `account[name]`
7. Change filter type to **"Top N"**
8. Enter **20** and select **"Top"** based on **"Total Gross Margin"**

**Result:** You now see top 20 customers by gross margin!

#### Visual 3: Add a Card for Total Margin

1. Click blank area of canvas
2. Select **"Card"** visualization
3. Drag `Total Gross Margin` to **Fields**
4. Resize and position it

#### Visual 4: Line Chart for Trend

1. Click blank area
2. Select **"Line chart"**
3. Drag:
   - `salesorder[orderedon]` → **Axis** (set to Month/Year)
   - `Total Gross Margin` → **Values**

#### Visual 5: Map of Customers

1. Click blank area
2. Select **"Map"** visualization
3. Drag:
   - `account[address1_city]` → **Location**
   - `Total Gross Margin` → **Size**

### Format Your Dashboard

1. Click **"View"** tab → Check **"Gridlines"** and **"Snap to grid"**
2. Add a title: **Insert** → **Text box** → Type: "Top 20% Customers Analysis"
3. Change colors: Click visual → **Format** panel (paint roller icon)
4. Add company logo: **Insert** → **Image**

---

## Part 6: Creating ICP Analysis Dashboard

### Dashboard 2: Ideal Customer Profile Metrics

#### Metric 1: Customer Segmentation by Order Frequency

**Create a new measure:**
```dax
Order Count = COUNTROWS(salesorder)
```

**Create segments:**
```dax
Frequency Segment = 
SWITCH(
    TRUE(),
    [Order Count] >= 50, "High Frequency",
    [Order Count] >= 20, "Medium Frequency",
    [Order Count] >= 5, "Low Frequency",
    "Inactive"
)
```

**Visual: Donut Chart**
- Values: Count of accounts
- Legend: Frequency Segment
- Details: Shows % of customers in each segment

#### Metric 2: Product Mix Analysis

**Create measure:**
```dax
Product Categories Purchased = DISTINCTCOUNT(product[category])
```

**Visual: Scatter Plot**
- X-axis: Product Categories Purchased
- Y-axis: Total Gross Margin
- Values: account[name]
- Size: Order Count

**Insight:** Customers in top-right are ideal (high margin + diverse products)

#### Metric 3: Average Order Value

```dax
Average Order Value = 
DIVIDE(
    SUM(salesorder[totalamount]),
    COUNTROWS(salesorder)
)
```

**Visual: Table**
- Rows: account[name]
- Values: Total Gross Margin, Order Count, Average Order Value
- Sort by: Total Gross Margin descending

---

## Part 7: Scheduling Automatic Refresh

### Publish to Power BI Service

1. Click **"Publish"** button (Home tab)
2. Sign in with your Microsoft account
3. Select **"My workspace"** or create new workspace
4. Wait for upload to complete
5. Click **"Open [filename] in Power BI"**

### Set Up Scheduled Refresh

1. In Power BI Service (web browser)
2. Go to **"Workspaces"** → Select your workspace
3. Find your dataset (not report)
4. Click **"..."** → **"Settings"**
5. Expand **"Scheduled refresh"**
6. Toggle **"Keep your data up to date"** to **ON**
7. Set **Refresh frequency**: Daily
8. Set **Time**: Choose a time when data is stable (e.g., 6:00 AM)
9. Add **Email notifications** for failures
10. Click **"Apply"**

### Configure Gateway (If Dynamics 365 is On-Premises)

If your Dynamics 365 is hosted locally:
1. Download **Power BI Gateway**
2. Install on a server with access to Dynamics 365
3. Sign in and register gateway
4. In dataset settings, select your gateway
5. Enter credentials for Dynamics 365

---

## Part 8: Sharing with Team

### Option 1: Share Report Link
1. Open report in Power BI Service
2. Click **"Share"** button (top right)
3. Enter email addresses
4. Set permissions (Can view / Can edit)
5. Click **"Share"**

**Recipients get:**
- Email with link to report
- Can view and interact with visuals
- Cannot see or change data source

### Option 2: Create an App
1. In workspace, click **"Create app"**
2. Add reports to include
3. Set navigation
4. Publish app
5. Share app link with team

### Option 3: Export to Excel
1. Click on any visual
2. Click **"..."** → **"Export data"**
3. Choose **"Summarized data"** or **"Underlying data"**
4. Opens in Excel

---

## Part 9: Common Issues & Troubleshooting

### Issue 1: Can't Connect to Dynamics 365

**Error:** "Unable to connect"

**Solutions:**
- ✅ Verify your Dynamics 365 URL is correct
- ✅ Check internet connection
- ✅ Ensure you're using the right authentication method
- ✅ Confirm your account has access to Dynamics 365
- ✅ Try signing out and back in
- ✅ Clear browser cache and credentials

### Issue 2: Data Refresh Fails

**Error:** "Refresh failed"

**Solutions:**
- ✅ Check if credentials expired (re-enter in dataset settings)
- ✅ Verify Dynamics 365 is online
- ✅ Check if gateway is running (for on-premises)
- ✅ Review error details in refresh history
- ✅ Test connection manually

### Issue 3: Slow Performance

**Symptoms:** Reports take long to load

**Solutions:**
- ✅ Use DirectQuery instead of Import (for large datasets)
- ✅ Filter data to only necessary timeframe
- ✅ Remove unused columns
- ✅ Aggregate data at higher level
- ✅ Optimize DAX measures
- ✅ Use incremental refresh

### Issue 4: Relationships Not Working

**Symptoms:** Visuals show wrong totals

**Solutions:**
- ✅ Check Model View - verify relationships exist
- ✅ Ensure relationship is on correct columns (usually IDs)
- ✅ Check cardinality (many-to-one is most common)
- ✅ Verify no data type mismatches
- ✅ Look for duplicate keys in "one" side

### Issue 5: Licensing Confusion

**Question:** "Do I need a license?"

**Answer:**
- **Power BI Desktop:** FREE - use for development
- **Power BI Service (view only):** FREE - can view shared reports
- **Power BI Pro:** $10-20/month - needed to:
  - Publish reports
  - Share with others
  - Schedule refresh
  - Collaborate
- **Power BI Premium:** $20/user or $4,995/capacity - for enterprise

**For Strikezone:** You need Pro licenses for team members who will publish and share reports.

---

## Part 10: Next Steps for Strikezone Project

### Week 1-2: Setup & Exploration
- [ ] Install Power BI Desktop
- [ ] Connect to Dynamics 365
- [ ] Load all required tables
- [ ] Explore the data
- [ ] Understand table relationships

### Week 3: Data Modeling
- [ ] Filter to last 36 months
- [ ] Calculate gross margin
- [ ] Create customer segments
- [ ] Build measures (Total Revenue, Order Count, etc.)
- [ ] Test data accuracy

### Week 4: Dashboard Development
- [ ] Create Top 20% Customers dashboard
- [ ] Create ICP Analysis dashboard
- [ ] Add filters and slicers
- [ ] Format and polish visuals
- [ ] Add interactivity

### Week 5: Testing & Refinement
- [ ] Test with real users
- [ ] Gather feedback
- [ ] Refine visuals
- [ ] Optimize performance
- [ ] Document insights

### Week 6: Deployment
- [ ] Publish to Power BI Service
- [ ] Set up scheduled refresh
- [ ] Share with sales team
- [ ] Conduct training session
- [ ] Monitor usage

---

## Power BI Resources

### Official Documentation
- Power BI Documentation: https://docs.microsoft.com/power-bi
- Dynamics 365 Connector Guide: https://docs.microsoft.com/power-bi/connect-data/desktop-connect-to-dynamics-365

### Learning Resources
- **Microsoft Learn:** Free Power BI courses
- **Power BI YouTube Channel:** Video tutorials
- **Power BI Community:** Forums for questions
- **DAX Guide:** DAX formula reference (dax.guide)

### Video Tutorials (YouTube)
- "Power BI in 1 Hour" by Guy in a Cube
- "Power BI Full Course" by Edureka
- "Dynamics 365 + Power BI" by Microsoft

### Sample Dashboards
- Power BI Gallery: https://community.powerbi.com/t5/Data-Stories-Gallery/bd-p/DataStoriesGallery

---

## Quick Reference Cheat Sheet

### Most Used DAX Formulas

```dax
// Sum
Total Sales = SUM(salesorder[totalamount])

// Count
Customer Count = COUNTROWS(account)

// Average
Avg Order Value = AVERAGE(salesorder[totalamount])

// Distinct Count
Unique Products = DISTINCTCOUNT(product[productid])

// Calculate (with filter)
Total This Year = CALCULATE(
    SUM(salesorder[totalamount]),
    YEAR(salesorder[orderedon]) = YEAR(TODAY())
)

// If statement
Segment = IF([Total Sales] > 100000, "Large", "Small")

// Switch (multiple conditions)
Category = SWITCH(
    TRUE(),
    [Sales] >= 100000, "Platinum",
    [Sales] >= 50000, "Gold",
    [Sales] >= 10000, "Silver",
    "Bronze"
)

// Date calculations
Last Year Sales = CALCULATE(
    SUM(salesorder[totalamount]),
    DATEADD(Calendar[Date], -1, YEAR)
)

// Percentage
Margin % = DIVIDE([Gross Margin], [Total Sales], 0)

// Top N
Top 20% Threshold = TOPN(
    ROUNDUP(COUNTROWS(account) * 0.2, 0),
    account,
    [Total Gross Margin],
    DESC
)
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl + S** | Save report |
| **Ctrl + C / V** | Copy / Paste visual |
| **Ctrl + Z** | Undo |
| **Ctrl + G** | Group visuals |
| **Alt + Shift + Left/Right** | Align visuals |
| **Ctrl + Click** | Select multiple visuals |
| **F5** | Run custom visual |
| **Ctrl + E** | Export data from visual |

---

## Summary: Your Power BI Journey

```
Step 1: Install Power BI Desktop (Free)
   ↓
Step 2: Connect to Dynamics 365
   ↓
Step 3: Transform & Load Data
   ↓
Step 4: Create Measures & Calculations
   ↓
Step 5: Build Visualizations
   ↓
Step 6: Design Dashboard
   ↓
Step 7: Publish to Power BI Service ($10-20/mo)
   ↓
Step 8: Set Up Auto Refresh
   ↓
Step 9: Share with Team
   ↓
Step 10: Iterate & Improve
```

**Congratulations!** You now know enough to get started with Power BI for the Strikezone project.

---

**Document Version:** 1.0  
**Last Updated:** February 7, 2026  
**For:** Strikezone Consulting ERP Project
