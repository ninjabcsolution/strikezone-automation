# Strikezone Automation - User Guide

A complete step-by-step guide for using all features of the Strikezone Automation platform.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [CEO Dashboard](#2-ceo-dashboard)
3. [ICP Dashboard](#3-icp-dashboard)
4. [Approval Portal](#4-approval-portal)
5. [Messaging Portal](#5-messaging-portal)
6. [User Guide Page](#6-user-guide-page)
7. [FAQ](#7-faq)
8. [Admin Panel](#8-admin-panel)

---

## 1. Getting Started

### 1.1 Accessing the Application

**URL:** `http://YOUR_SERVER_IP:5000` or `http://localhost:5000`

### 1.2 Login

1. Navigate to the login page: `/login`
2. Enter your credentials:
   - **Email:** Your registered email
   - **Password:** Your password
3. Click **"Sign In"**

**Default Admin Account:**
- Email: `admin@strikezone.com`
- Password: `admin123` (change after first login)

### 1.3 Navigation

The main navigation bar provides access to all features:

| Menu Item | Description |
|-----------|-------------|
| 🏠 Home | Dashboard overview |
| 📊 CEO Dashboard | Upload data, view analytics |
| 🎯 ICP Dashboard | View ICP profile, Top 20 customers |
| ✅ Approval Portal | Manage and approve targets |
| 💬 Messaging Portal | Generate and approve AI messages |
| 📖 Guide | Help documentation |
| ❓ FAQ | Frequently asked questions |
| ⚙️ Admin | User management (admin only) |

---

## 2. CEO Dashboard

**Purpose:** Upload your business data and view customer analytics.

### 2.1 Uploading Data Files

1. Navigate to **CEO Dashboard** (`/ceo-dashboard`)
2. You'll see 4 upload sections for different data types:
   - **Customers** - Company information
   - **Orders** - Order transactions
   - **Order Lines** - Order line items
   - **Products** - Product catalog

### 2.2 Uploading Customer Data

1. Click **"Choose File"** in the Customers section
2. Select your `Customers.csv` file
3. Click **"Upload"**
4. Wait for confirmation message: "✅ Uploaded X customers"

**Required CSV Columns:**
```
customer_id, company_name, industry, state, employee_count, annual_revenue
```

**Example Data:**
```csv
customer_id,company_name,industry,state,employee_count,annual_revenue
CUST001,Acme Manufacturing,Industrial Machinery,TX,500,50000000
CUST002,Global Tech Inc,Software,CA,200,25000000
```

### 2.3 Uploading Orders Data

1. Click **"Choose File"** in the Orders section
2. Select your `Orders.csv` file
3. Click **"Upload"**

**Required CSV Columns:**
```
order_id, customer_id, order_date, total_amount
```

### 2.4 Uploading Order Lines

1. Click **"Choose File"** in the Order Lines section
2. Select your `OrderLines.csv` file
3. Click **"Upload"**

**Required CSV Columns:**
```
orderline_id, order_id, product_id, quantity, unit_price
```

### 2.5 Uploading Products

1. Click **"Choose File"** in the Products section
2. Select your `Products.csv` file
3. Click **"Upload"**

**Required CSV Columns:**
```
product_id, product_name, category, unit_price
```

### 2.6 Viewing CAGR Analysis

After uploading data, you'll see the **Customer Growth Analysis** section:

| Metric | Description |
|--------|-------------|
| **Growing** | Customers with positive CAGR (green) |
| **Stable** | Customers with flat growth (yellow) |
| **Declining** | Customers with negative CAGR (red) |
| **No Data** | Insufficient data for analysis (gray) |

**What is CAGR?**
- Compound Annual Growth Rate
- Measures revenue growth over time
- Helps identify valuable vs. at-risk customers

---

## 3. ICP Dashboard

**Purpose:** View your Ideal Customer Profile based on Top 20 customers by revenue.

### 3.1 Accessing ICP Dashboard

Navigate to **ICP Dashboard** (`/icp-dashboard`)

### 3.2 Understanding the ICP Profile

The dashboard shows traits of your best customers:

**Industry Distribution:**
- Shows which industries your top customers are in
- Weighted by customer value
- Example: "Industrial Machinery (30%), Oil & Gas (25%)"

**Geographic Distribution:**
- Shows which states your top customers are located in
- Example: "TX (25%), CA (20%), FL (15%)"

**Company Size:**
- **Employee Count Range:** 25th-75th percentile of top customers
- **Annual Revenue Range:** 25th-75th percentile of top customers

### 3.3 Top 20 Customers List

Below the ICP profile, you'll see a table of your Top 20 customers:

| Column | Description |
|--------|-------------|
| Rank | Customer ranking by revenue |
| Company Name | Customer company name |
| Industry | Customer's industry |
| State | Location |
| Total Revenue | Lifetime revenue |
| CAGR | Growth rate |

### 3.4 Exporting ICP Data

Click **"Export ICP Profile"** to download the ICP traits as a JSON file.

---

## 4. Approval Portal

**Purpose:** Review, approve, reject, and manage target accounts.

### 4.1 Accessing Approval Portal

Navigate to **Approval Portal** (`/approval-portal`)

### 4.2 Viewing Targets

The portal shows all target accounts in a table:

| Column | Description |
|--------|-------------|
| Company Name | Target company name |
| Domain | Company website |
| Industry | Business industry |
| State | Location |
| Tier | Priority tier (A/B/C) |
| Status | Current approval status |
| Actions | Available actions |

### 4.3 Filtering Targets

Use the filter dropdown to view targets by status:

- **All** - Show all targets
- **Pending** - Awaiting review
- **Approved** - Ready for outreach
- **Rejected** - Not a fit
- **Needs Info** - Requires more data

### 4.4 Approving a Target

1. Find the target in the list
2. Click the **✅ Approve** button
3. (Optional) Add approval notes
4. The status changes to "Approved"

### 4.5 Rejecting a Target

1. Find the target in the list
2. Click the **❌ Reject** button
3. (Optional) Add rejection reason
4. The status changes to "Rejected"

### 4.6 Editing a Target

1. Click the **✏️ Edit** button
2. Modify the target details:
   - Company name
   - Domain
   - Industry
   - State
   - Employee count
   - Annual revenue
   - Tier (A/B/C)
   - Notes
3. Click **"Save Changes"**

### 4.7 Changing Tier

Tiers indicate priority level:

| Tier | Description |
|------|-------------|
| **A** | High priority - Closest ICP match |
| **B** | Medium priority - Good potential |
| **C** | Low priority - Worth monitoring |

To change tier:
1. Click **✏️ Edit**
2. Select new tier from dropdown
3. Click **"Save"**

### 4.8 Exporting Approved Targets

1. Click **"Export Approved"** button
2. A CSV file downloads with all approved targets
3. Use this for import into CRM or outreach tools

### 4.9 Generating New Targets

Click **"Generate Lookalikes"** to:
1. Find companies similar to your ICP
2. Add them as pending targets
3. Review and approve as needed

---

## 5. Messaging Portal

**Purpose:** Generate AI-powered sales messages and manage approval workflow.

### 5.1 Accessing Messaging Portal

Navigate to **Messaging Portal** (`/messaging-portal`)

### 5.2 Viewing Available Contacts

The portal shows enriched contacts from approved targets:

| Column | Description |
|--------|-------------|
| Select | Checkbox for batch actions |
| Contact Name | Person's full name |
| Title | Job title |
| Company | Company name |
| Email | Contact email |
| Actions | Generate/View message |

### 5.3 Generating a Single Message

1. Find the contact you want to message
2. Click **"🚀 Generate"** button
3. Wait for AI to create the message (5-10 seconds)
4. Message appears in the Messages section below

### 5.4 Generating Batch Messages

1. Use checkboxes to select multiple contacts
2. Click **"Generate for Selected"** button
3. Confirm the batch generation
4. Messages are generated for all selected contacts

### 5.5 Reviewing Generated Messages

Switch to the **Messages** tab to see generated messages:

| Status | Color | Description |
|--------|-------|-------------|
| Pending | Yellow | Awaiting review |
| Approved | Green | Ready to send |
| Edited | Blue | Modified and approved |
| Rejected | Red | Not approved |

### 5.6 Approving a Message

1. Click on a pending message to view details
2. Review the subject line and body
3. Click **"✅ Approve"** to approve as-is
4. Message moves to Approved status

### 5.7 Editing a Message

1. Click on a message to view details
2. Click **"✏️ Edit"**
3. Modify the subject line and/or body
4. Click **"Save & Approve"**
5. Message moves to Edited status

### 5.8 Rejecting a Message

1. Click on a message to view details
2. Click **"❌ Reject"**
3. Enter rejection reason (optional)
4. Message moves to Rejected status

### 5.9 Bulk Approving Messages

1. Select multiple messages using checkboxes
2. Click **"Bulk Approve"** button
3. All selected pending messages are approved

### 5.10 Exporting Approved Messages

1. Click **"Export Approved"** button
2. A CSV file downloads containing:
   - Contact Name
   - Email
   - Company
   - Subject
   - Message Body
   - Message Type
   - Approved Date

**Use this export to:**
- Import into your email tool (Mailchimp, SendGrid)
- Import into CRM (Salesforce, HubSpot)
- Manual outreach via email client

### 5.11 Message Statistics

View real-time stats at the top of the portal:

- **Total Messages:** All generated messages
- **Pending:** Awaiting review
- **Approved:** Ready to send
- **Rejected:** Not approved
- **Edited:** Modified and approved

---

## 6. User Guide Page

**Purpose:** In-app help documentation.

### 6.1 Accessing the Guide

Navigate to **Guide** (`/guide`)

### 6.2 Contents

The guide includes:
- Getting started instructions
- Feature overviews
- Best practices
- Workflow examples

---

## 7. FAQ

**Purpose:** Frequently asked questions.

### 7.1 Accessing FAQ

Navigate to **FAQ** (`/faq`)

### 7.2 Common Questions

**Q: How is the ICP calculated?**
A: We analyze your Top 20 customers by total revenue and extract common traits like industry, location, company size, and revenue range.

**Q: What data formats are supported?**
A: CSV files with UTF-8 encoding. Column headers should match the expected format.

**Q: How does AI message generation work?**
A: We use GPT-4 to create personalized messages based on contact details, company info, and ICP traits.

**Q: What if a message is rejected?**
A: Rejected messages can be regenerated or manually written. The system tracks rejection reasons for improvement.

---

## 8. Admin Panel

**Purpose:** User management and system settings (admin only).

### 8.1 Accessing Admin Panel

Navigate to **Admin** (`/admin`) - requires admin role

### 8.2 User Management

**Viewing Users:**
- See all registered users
- View user roles (admin, analyst, viewer)
- Check last login times

**Adding Users:**
1. Click **"Add User"**
2. Enter email, name, and role
3. Set temporary password
4. Click **"Create User"**

**Editing Users:**
1. Find user in the list
2. Click **"Edit"**
3. Modify role or details
4. Click **"Save"**

**Removing Users:**
1. Find user in the list
2. Click **"Remove"**
3. Confirm deletion

### 8.3 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features |
| **Analyst** | Can use all features except user management |
| **Viewer** | Can view data but cannot modify |

---

## Quick Start Workflow

### Complete Workflow in 5 Steps

**Step 1: Upload Your Data**
1. Go to CEO Dashboard
2. Upload Customers, Orders, OrderLines, Products CSVs
3. View CAGR analysis

**Step 2: Review Your ICP**
1. Go to ICP Dashboard
2. Review industry, geography, and size traits
3. Note your ideal customer characteristics

**Step 3: Generate Lookalike Targets**
1. Go to Approval Portal
2. Click "Generate Lookalikes"
3. Review and approve good-fit targets

**Step 4: Enrich Contacts** (happens automatically)
- The system finds contacts at approved target companies
- Contacts appear in the Messaging Portal

**Step 5: Generate & Send Messages**
1. Go to Messaging Portal
2. Generate AI messages for contacts
3. Review and approve messages
4. Export approved messages
5. Send via your email tool

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Save/Submit form |
| `Esc` | Close modal |
| `Tab` | Navigate between fields |

---

## Tips & Best Practices

### Data Quality
- ✅ Clean your CSV data before upload
- ✅ Use consistent industry names
- ✅ Include all required columns
- ❌ Don't upload duplicate records

### Approval Workflow
- ✅ Review all targets before approving
- ✅ Add notes for rejected targets
- ✅ Use tiers to prioritize outreach
- ❌ Don't approve targets outside your ICP

### Messaging
- ✅ Review AI messages before approving
- ✅ Personalize when needed
- ✅ Match tone to your brand
- ❌ Don't send without review

### Security
- ✅ Log out when done
- ✅ Use strong passwords
- ✅ Report suspicious activity
- ❌ Don't share login credentials

---

## Need Help?

- **Email:** support@strikezone.com
- **Documentation:** See `/guide` in the application
- **FAQ:** See `/faq` for common questions
