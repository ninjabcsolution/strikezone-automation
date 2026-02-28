# Strikezone MVP Testing Guide
## Step-by-Step UI Testing Instructions

---

## 🚀 Step 0: Start the Application

### Terminal 1 - Start Backend:
```bash
cd phase1-app/backend
npm install
npm start
```
Wait for: `Server running on port 5002`

### Terminal 2 - Start Frontend:
```bash
cd phase1-app/frontend
npm install
npm run dev
```
Wait for: `ready - started server on 0.0.0.0:3000`

### Open Browser:
Go to: **http://localhost:3000**

---

## 📋 Step 1: Login (First Screen)

### What You'll See:
- Login page with email and password fields
- "Sign In" button
- Strikezone logo

### What to Do:
1. **Email:** Enter `admin@strikezone.io`
2. **Password:** Enter `admin123`
3. **Click:** "Sign In" button

### Expected Result:
- ✅ Redirected to Home page (Upload page)
- ✅ Header shows "Admin" user logged in

---

## 📤 Step 2: Upload Data (Home Page - Upload Page)

### What You'll See:
- Drag & drop upload area
- Buttons for each file type (Customers, Products, Orders, OrderLines)
- File selection area

### What to Do (Upload in this order):

#### 2.1 Upload Customers
1. **Click:** "Customers" tab/button
2. **Click:** "Browse" or drag `sample_data_3yr/Customers.csv` into the drop zone
3. **Click:** "Upload" button
4. **Wait:** See progress bar and results

#### Expected Result:
- ✅ "120 rows inserted" message
- ✅ QA Summary showing validation results
- ✅ Green success notification

#### 2.2 Upload Products
1. **Click:** "Products" tab/button
2. **Browse/Drag:** `sample_data_3yr/Products.csv`
3. **Click:** "Upload"

#### Expected Result:
- ✅ "10 rows inserted" message

#### 2.3 Upload Orders
1. **Click:** "Orders" tab/button
2. **Browse/Drag:** `sample_data_3yr/Orders.csv`
3. **Click:** "Upload"

#### Expected Result:
- ✅ "2837 rows inserted" message

#### 2.4 Upload OrderLines
1. **Click:** "OrderLines" tab/button
2. **Browse/Drag:** `sample_data_3yr/OrderLines.csv`
3. **Click:** "Upload"

#### Expected Result:
- ✅ "8531 rows inserted" message

---

## 📊 Step 3: Calculate Customer Metrics (CEO Dashboard)

### Navigate:
- **Click:** "CEO Dashboard" in the header navigation

### What You'll See:
- CEO Dashboard page
- "Calculate Customer Metrics" button
- Empty tables/charts

### What to Do:
1. **Find:** "Session" section at top
2. **Actor field:** Leave as "local-dev" or enter your name
3. **Click:** "Calculate Customer Metrics" button
4. **Wait:** Processing indicator

### Expected Result:
- ✅ Success toast: "Metrics calculated for 120 customers, inserted/updated: 120"
- ✅ KPIs appear:
  - Total customers: 120
  - Top 20 customers: 24
  - Total Revenue: ~$22.8M
  - Avg Gross Margin %: ~32%

---

## 📈 Step 4: Calculate 3-Year CAGR (CEO Dashboard)

### What to Do:
1. **Stay on:** CEO Dashboard
2. **Find:** "Calculate 3-Year CAGR" button
3. **Click:** The button
4. **Wait:** Processing

### Expected Result:
- ✅ Success toast: "CAGR calculated for X customers"
- ✅ CAGR Summary section shows:
  - Average CAGR percentage
  - Consistent growers count
  - Customers with 3-year data

---

## 🔄 Step 5: View Top 20% vs Others Comparison (CEO Dashboard)

### What to Do:
1. **Stay on:** CEO Dashboard
2. **Scroll down** to see the comparison section

### What You'll See:
- Side-by-side table: "Top 20% vs Others"
- Metrics comparison:
  - Average Order Value
  - Orders per Customer
  - Gross Margin %
  - Product Categories per Customer
- Lift percentages (how much better Top 20% performs)

### Expected Result:
- ✅ Top 20% should show higher values
- ✅ Lift percentages should be positive (e.g., "+45%")

---

## 🎯 Step 6: View ICP Traits (ICP Dashboard)

### Navigate:
- **Click:** "ICP Dashboard" in the header

### What You'll See:
- ICP Dashboard page
- "Recalculate ICP Traits" button
- Empty trait tables

### What to Do:
1. **Click:** "Recalculate ICP Traits" button
2. **Wait:** Processing

### Expected Result:
- ✅ Success toast: "ICP traits recalculated"
- ✅ Tables populate with:
  - **Top Industries:** Industrial Machinery, Chemicals, etc. with lift scores
  - **Top States:** OH, IL, TX, etc. with frequency %
  - **Top NAICS:** 333, 325, 336 with importance scores
  - **External Filters:** JSON object ready for Apollo

### Additional Features to Test:
1. **Click:** "Download Traits CSV" → Downloads CSV file
2. **Click:** "Download ICP Summary (MD)" → Downloads Markdown file

---

## 🏢 Step 7: Generate Lookalike Targets (Approval Portal)

### Navigate:
- **Click:** "Approval Portal" in the header

### What You'll See:
- Target Approval Portal
- Multiple generation options
- Empty targets table

### What to Do:

#### 7.1 Generate from Apollo
1. **Find:** "Generate (Apollo)" section
2. **Search query field:** Enter "industrial machinery"
3. **Click:** "Generate from Apollo" button
4. **Wait:** API call (may take 10-30 seconds)

#### Expected Result:
- ✅ Success toast: "Apollo generation complete. Inserted: X, Updated: Y"
- ✅ New targets appear in the table below
- ⚠️ If error: "Free plan limits" or API issues - this is normal for free Apollo accounts

#### 7.2 Generate Win-back Targets
1. **Find:** "Generate (Win-back)" section
2. **Inactive Days:** Leave as 180 (or change)
3. **Limit:** Leave as 200 (or change)
4. **Click:** "Generate Win-back Targets" button

#### Expected Result:
- ✅ Success toast: "Win-back generation complete"
- ✅ Targets with source "winback" appear in table

---

## ✅ Step 8: Review and Approve Targets (Approval Portal)

### What You'll See:
- Table with targets showing:
  - Company name, Industry, State
  - Employee count, Revenue
  - Tier (A/B/C), Segment
  - Similarity Score, Opportunity Score
  - Status, Actions

### What to Do:

#### 8.1 Filter Targets
1. **Status dropdown:** Select "Pending Review"
2. **Tier dropdown:** Select "A" (top tier only)
3. **Click:** "Refresh"

#### 8.2 Edit a Target
1. **Find:** Any row in the table
2. **Tier dropdown in row:** Change from "C" to "A"
3. **Notes field:** Type "High priority target"
4. **Click:** "Save" button in that row

#### Expected Result:
- ✅ Row updates with new tier
- ✅ Notes saved

#### 8.3 Approve a Target
1. **Find:** Any row
2. **Click:** "Approve" button (green)

#### Expected Result:
- ✅ Status changes to "approved"
- ✅ Target moves out of "Pending Review" filter

#### 8.4 Reject a Target
1. **Find:** Any row
2. **Click:** "Reject" button (red)

#### Expected Result:
- ✅ Status changes to "rejected"

---

## 📥 Step 9: Export Approved Targets (Approval Portal)

### What to Do:
1. **Status dropdown:** Select "Approved"
2. **Click:** "Refresh" to show only approved
3. **Click:** "Export CSV" button

### Expected Result:
- ✅ CSV file downloads
- ✅ Contains approved targets with all fields

---

## 📨 Step 10: Test Messaging Portal (Optional - Phase 4)

### Navigate:
- **Click:** "Messaging Portal" in the header

### What You'll See:
- Messaging generation interface
- Requires OpenAI API key to be configured

### What to Do:
1. **Select target(s)** from the list
2. **Click:** "Generate Messages"
3. **Review** generated email/LinkedIn messages
4. **Approve** messages for outreach

### Expected Result:
- ✅ AI-generated personalized messages
- ✅ Multiple variants (Email 1, Email 2, LinkedIn DM)

---

## 🔍 Quick Test Checklist

| Step | Page | Action | Expected |
|------|------|--------|----------|
| 1 | Login | Login with admin@strikezone.io | ✅ Redirected to home |
| 2 | Upload | Upload 4 CSV files | ✅ All files processed |
| 3 | CEO Dashboard | Calculate Metrics | ✅ 120 customers, 24 top 20% |
| 4 | CEO Dashboard | Calculate CAGR | ✅ CAGR values populated |
| 5 | CEO Dashboard | View Comparison | ✅ Top 20% vs Others shown |
| 6 | ICP Dashboard | Recalculate Traits | ✅ Industry/State/NAICS traits |
| 7 | Approval Portal | Generate Apollo | ✅ Targets created |
| 8 | Approval Portal | Generate Win-back | ✅ Win-back targets |
| 9 | Approval Portal | Approve/Reject | ✅ Status changes |
| 10 | Approval Portal | Export CSV | ✅ File downloads |

---

## ❓ Troubleshooting

### Login doesn't work?
- Make sure backend is running on port 5002
- Check browser console for errors
- Verify auth_schema.sql was run

### Upload fails?
- Check CSV format matches expected columns
- Look at browser console for error details
- Verify database connection in backend

### Apollo generation fails?
- Check APOLLO_API_KEY in backend/.env
- Free Apollo accounts have limited API access
- Try smaller queries

### No metrics after Calculate?
- Make sure all 4 CSVs were uploaded
- Check that Orders have valid customer_ids
- Look at backend console for errors

---

## 📞 Support

If you encounter issues not covered here, check:
1. Backend terminal for error logs
2. Browser Developer Tools (F12) → Console
3. Browser Developer Tools (F12) → Network tab
