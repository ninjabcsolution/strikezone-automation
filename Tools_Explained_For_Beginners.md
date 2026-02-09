# Tools Explained for Beginners
## Dynamics 365, Apollo.io, and Airtable for Your Strikezone Project

---

## Table of Contents
1. [Dynamics 365 Explained](#dynamics-365-explained)
2. [Apollo.io Explained](#apolloio-explained)
3. [Airtable Explained](#airtable-explained)
4. [How These Tools Work Together](#how-these-tools-work-together)
5. [Getting Started Guide](#getting-started-guide)

---

## Dynamics 365 Explained

### What is Dynamics 365?

**Dynamics 365** is Microsoft's **ERP (Enterprise Resource Planning)** and **CRM (Customer Relationship Management)** software. Think of it as the brain of your business operations - it stores and manages all your important business data.

```
Dynamics 365 = Your Business Data Central Hub

Contains:
├── Customer Information (who buys from you)
├── Sales Orders (what they bought)
├── Product Catalog (what you sell)
├── Invoices (payment records)
├── Inventory (stock levels)
├── Financial Data (revenue, costs, margins)
└── Sales Team Activities (calls, emails, meetings)
```

### What Data Lives in Dynamics 365?

For the **Strikezone project**, Dynamics 365 contains:

| Data Type | What It Is | Example |
|-----------|------------|---------|
| **Customers (Accounts)** | Companies that buy from you | ABC Manufacturing, XYZ Corp |
| **Contacts** | People at those companies | John Smith (Procurement Manager) |
| **Sales Orders** | Orders placed by customers | Order #12345 for $50,000 |
| **Products** | Items you sell | Industrial Bearings, Pumps, Valves |
| **Invoices** | Bills sent to customers | Invoice #INV-001 for $50,000 |
| **Transactions** | Payment history | Paid on 01/15/2026 |
| **Activities** | Sales team interactions | Called customer, sent quote |

### Dynamics 365 Modules

Dynamics 365 has different "apps" or modules:

```
Dynamics 365 Sales
├── Lead Management
├── Opportunity Tracking
├── Quote Generation
└── Sales Performance

Dynamics 365 Finance
├── Accounts Payable
├── Accounts Receivable
├── Financial Reporting
└── Budgeting

Dynamics 365 Supply Chain
├── Inventory Management
├── Procurement
├── Order Management
└── Warehouse Operations
```

**For your project:** You'll likely use **Sales**, **Finance**, and **Supply Chain** modules to get customer and transaction data.

### How to Access Dynamics 365

**Cloud Version (Most Common):**
- Access via web browser
- URL format: `https://yourcompany.crm.dynamics.com`
- Or via mobile app
- Always up-to-date

**On-Premises Version:**
- Installed on your company's servers
- Accessed via company network
- Requires VPN if remote

### Dynamics 365 Key Concepts

#### 1. **Entities (Tables)**
Think of entities as Excel spreadsheets. Each entity is a table of data.

```
Account Entity (Customer Table):
┌─────────────┬──────────────┬─────────┬──────────┐
│ Account ID  │ Company Name │ Revenue │ Industry │
├─────────────┼──────────────┼─────────┼──────────┤
│ 12345       │ ABC Corp     │ $5M     │ Mfg      │
│ 12346       │ XYZ Inc      │ $2M     │ Energy   │
└─────────────┴──────────────┴─────────┴──────────┘
```

#### 2. **Fields (Columns)**
Each entity has fields - like columns in Excel

```
Common Fields in Account Entity:
- accountid (Unique ID)
- name (Company name)
- revenue (Annual revenue)
- numberofemployees (Company size)
- industry (Industry type)
- address1_city (Location)
- primarycontactid (Main contact)
```

#### 3. **Relationships**
Tables connect to each other

```
Account → Sales Order → Sales Order Details → Product
(Customer) → (Order) → (Line Items) → (What they bought)
```

### What You Need from Dynamics 365

For the **Strikezone project**, you need to extract:

✅ **Customer master data** (all companies)  
✅ **36 months of sales history** (orders from last 3 years)  
✅ **Product information** (what you sell)  
✅ **Financial data** (revenue, margin, payment terms)  
✅ **Geographic data** (where customers are located)  

### Dynamics 365 Permissions

You'll need:
- **Read-only access** (sufficient for data analysis)
- OR **System Administrator** (full access)

**Don't worry:** You don't need to modify data, just read it.

---

## Apollo.io Explained

### What is Apollo.io?

**Apollo.io** is a **Sales Intelligence and Engagement Platform**. It's like a massive database of companies and people, plus tools to contact them.

```
Apollo.io = LinkedIn + Google + Contact Database + Email Tool Combined

Think of it as:
"A phone book for B2B sales" + "An automated outreach system"
```

### What Does Apollo.io Do?

#### 1. **Company Data Enrichment**
You give it a company name → It tells you everything about that company

**Input:** "ABC Manufacturing"

**Output Apollo.io Provides:**
```
Company: ABC Manufacturing
├── Annual Revenue: $50M
├── Employee Count: 250
├── Industry: Industrial Equipment
├── Location: Chicago, IL
├── Tech Stack: Salesforce, HubSpot
├── Recent News: Expanding to new facility
├── Growth Stage: Mature
└── Funding: Bootstrapped
```

#### 2. **Contact Discovery**
Find people who work at target companies

**Example Search:**
"Find all Procurement Managers at manufacturing companies in Texas with 100-500 employees"

**Apollo.io Returns:**
```
1. John Smith
   - Title: Director of Procurement
   - Company: ABC Manufacturing
   - Email: john.smith@abcmfg.com
   - Phone: (555) 123-4567
   - LinkedIn: linkedin.com/in/johnsmith

2. Sarah Johnson
   - Title: Procurement Manager
   - Company: XYZ Industrial
   - Email: sjohnson@xyzind.com
   - Phone: (555) 987-6543
   - LinkedIn: linkedin.com/in/sarahjohnson
```

#### 3. **Org Chart Mapping**
See the organizational structure

```
ABC Manufacturing
│
CEO: Robert Brown
│
├── VP Operations: Jane Doe
│   ├── Plant Manager: Mike Wilson
│   └── Procurement Director: John Smith ← Your contact!
│       ├── Procurement Manager: Tom Lee
│       └── Buyer: Lisa Chen
│
└── CFO: David Miller
```

#### 4. **Email Automation**
Send personalized emails at scale

```
Apollo.io Sequences (Cadences):

Day 1: Send initial email
Day 3: LinkedIn connection request
Day 5: Follow-up email
Day 8: Phone call
Day 10: Final email
Day 14: Break-up email (last attempt)
```

### Apollo.io Database Size

- **270+ million contacts** worldwide
- **70+ million companies**
- **Updated regularly** (phone numbers, emails verified)

### How Apollo.io Pricing Works

| Plan | Cost | Features |
|------|------|----------|
| **Free** | $0 | 50 credits/month, basic search |
| **Basic** | $49/user/mo | 900 credits/month, basic sequences |
| **Professional** | $99/user/mo | 1,200 credits/month, full sequences |
| **Organization** | $149/user/mo | Unlimited, advanced features, API access |

**Credit System:**
- 1 email reveal = 1 credit
- 1 phone number = 1 credit
- Exporting contact = 1 credit

**For your project:** You'll need **Professional** or **Organization** plan for API access.

### Apollo.io API

The API allows automation:

```javascript
// Example: Find contacts at a company
POST https://api.apollo.io/v1/mixed_people/search
{
  "q_organization_name": "ABC Manufacturing",
  "person_titles": ["Procurement Manager", "Director of Procurement"],
  "page": 1
}

// Returns: List of contacts with emails, phones, LinkedIn
```

### What You'll Use Apollo.io For

In the **Strikezone project**:

1. **Enrich your customer data** → Get detailed company info
2. **Find decision-makers** → Identify who to contact
3. **Get contact information** → Verified emails and phone numbers
4. **Build cadences** → Automate outreach sequences
5. **Track engagement** → See who opens emails, clicks links

---

## Airtable Explained

### What is Airtable?

**Airtable** is a **flexible database** that looks like a spreadsheet but works like a database. It's like Excel and a database had a baby.

```
Airtable = Excel + Database + Collaboration Tool

Think of it as:
"Google Sheets on steroids with superpowers"
```

### Why Use Airtable?

| Traditional Spreadsheet | Airtable |
|------------------------|----------|
| Just rows and columns | Rows, columns, AND relationships |
| No data types | Rich data types (checkboxes, dates, attachments) |
| No linking between sheets | Link records between tables |
| No automation | Built-in automation |
| Limited views | Multiple views (grid, calendar, kanban) |
| No API | Full API access |

### Airtable Key Concepts

#### 1. **Base**
A base is like a project or database

```
Your Strikezone Base:
├── Table: Accounts
├── Table: Contacts
├── Table: Outreach Campaigns
├── Table: Messages
└── Table: Results
```

#### 2. **Tables**
Tables are like sheets in Excel

```
Accounts Table:
┌──────────────┬────────────┬───────────┬───────────┐
│ Company Name │ ICP Score  │ Tier      │ Status    │
├──────────────┼────────────┼───────────┼───────────┤
│ ABC Corp     │ 92         │ A-Tier    │ Contacted │
│ XYZ Inc      │ 78         │ B-Tier    │ Enriching │
└──────────────┴────────────┴───────────┴───────────┘
```

#### 3. **Fields (Columns)**
Rich data types available:

- **Single line text** (Company name)
- **Number** (ICP Score)
- **Single select** (Tier: A, B, Inactive, Strategic)
- **Date** (Last contacted date)
- **Checkbox** (Enrichment complete?)
- **Attachment** (Upload files)
- **Link to another record** (Link account to contacts)
- **Formula** (Calculate values)
- **Rollup** (Aggregate from linked records)

#### 4. **Views**
Different ways to see the same data:

```
Grid View: Spreadsheet layout
├── All Accounts
├── A-Tier Only
├── Need Enrichment
└── Ready for Outreach

Kanban View: Cards by status
├── To Enrich
├── Enriching
├── Ready
└── Contacted

Calendar View: By date
└── Outreach Schedule
```

#### 5. **Automation**
Trigger actions automatically:

```
Automation Example:
When: New record in Accounts table
Then: 
  1. Send to Apollo.io for enrichment
  2. Calculate ICP score
  3. Assign tier
  4. Notify team in Slack
```

### Airtable Pricing

| Plan | Cost | Features |
|------|------|----------|
| **Free** | $0 | 1,000 records, basic features |
| **Plus** | $10/user/mo | 5,000 records, more automation |
| **Pro** | $20/user/mo | 50,000 records, advanced features |
| **Enterprise** | Custom | Unlimited, advanced security |

**For your project:** Start with **Plus** or **Pro** plan.

### Airtable API

Automate data in/out:

```javascript
// Example: Add new account to Airtable
POST https://api.airtable.com/v0/appXXXX/Accounts
{
  "fields": {
    "Company Name": "ABC Manufacturing",
    "ICP Score": 92,
    "Tier": "A-Tier",
    "Industry": "Manufacturing"
  }
}
```

### Airtable Integrations

Airtable connects with:
- **Zapier** (connect to 5,000+ apps)
- **Make** (advanced automation)
- **Power Automate** (Microsoft)
- **Slack** (notifications)
- **Gmail** (send emails)

### What You'll Use Airtable For

In the **Strikezone project** (if choosing Option 2: Hybrid approach):

1. **Store enriched account data** → Central database
2. **Track ICP scores** → Organized by tier
3. **Manage outreach campaigns** → Who to contact, when
4. **Store AI-generated messages** → Personalized for each account
5. **Track results** → Response rates, meetings booked

---

## How These Tools Work Together

### The Complete Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: DATA EXTRACTION                                      │
│                                                               │
│ Dynamics 365 → Power BI                                      │
│ • Extract customer data                                      │
│ • 36 months of sales history                                 │
│ • Calculate gross margin                                     │
│ • Identify top 20% customers                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: ANALYSIS & SCORING                                   │
│                                                               │
│ Power BI → ICP Analysis                                      │
│ • Identify ideal customer traits                            │
│ • Score all accounts (0-100)                                 │
│ • Segment: A-Tier, B-Tier, Inactive, Strategic             │
│ • Export to CSV/Excel                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: DATA STORAGE (Option 2: Hybrid)                     │
│                                                               │
│ CSV/Excel → Airtable                                         │
│ • Import accounts with ICP scores                           │
│ • Organize by tier                                           │
│ • Create views for workflow                                  │
│ • Set up automation                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: ENRICHMENT                                           │
│                                                               │
│ Airtable → Apollo.io                                         │
│ • Send account list to Apollo.io                            │
│ • Get company details (revenue, employees, industry)        │
│ • Find decision-makers (names, titles)                      │
│ • Get contact info (emails, phones, LinkedIn)               │
│ • Store back in Airtable                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: AI MESSAGE GENERATION                               │
│                                                               │
│ Airtable → ChatGPT/Copilot → Airtable                       │
│ • For each account, send context to AI                      │
│ • AI generates personalized email                            │
│ • AI creates LinkedIn message                                │
│ • AI writes call script                                      │
│ • Store messages in Airtable                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: OUTREACH EXECUTION                                   │
│                                                               │
│ Airtable → Apollo.io Sequences                              │
│ • Create cadences in Apollo.io                              │
│ • Upload contacts and messages                               │
│ • Set schedule (Day 1: Email, Day 3: LinkedIn, etc.)       │
│ • Apollo.io sends automatically                              │
│ • Track opens, clicks, replies                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: RESULTS TRACKING                                     │
│                                                               │
│ Apollo.io → Airtable → Power BI                             │
│ • Sync results to Airtable                                   │
│ • Update account status                                      │
│ • Export to Power BI for dashboards                          │
│ • Analyze: response rates, meetings booked, ROI             │
└─────────────────────────────────────────────────────────────┘
```

### Tool Comparison Chart

| Tool | Purpose | What It Does | Cost |
|------|---------|--------------|------|
| **Dynamics 365** | ERP/CRM | Stores your business data | Existing (you have it) |
| **Power BI** | Analytics | Analyzes data, creates dashboards | $10-20/user/mo |
| **Airtable** | Database | Organizes enriched data & workflow | $10-20/user/mo |
| **Apollo.io** | Sales Intel | Enriches companies, finds contacts | $99-149/user/mo |
| **ChatGPT** | AI | Generates personalized messages | ~$0.01/message |

---

## Getting Started Guide

### Phase 1: Learn the Basics (Week 1)

#### Day 1-2: Dynamics 365 Exploration
- [ ] Request access to Dynamics 365 from IT
- [ ] Log in via web browser
- [ ] Explore the Sales module
- [ ] Open the Accounts (customers) list
- [ ] Open one customer record to see all fields
- [ ] Navigate to Sales Orders
- [ ] Understand how data is organized

**Tutorial:** Microsoft has free Dynamics 365 training: https://learn.microsoft.com/training/dynamics365/

#### Day 3-4: Apollo.io Trial
- [ ] Sign up for Apollo.io free trial: https://apollo.io
- [ ] Complete the onboarding tour
- [ ] Try searching for a company: Search "manufacturing companies in Texas"
- [ ] Export one contact to see what data you get
- [ ] Explore the "Sequences" feature
- [ ] Watch Apollo.io tutorial videos

**Tutorial:** Apollo.io Academy: https://academy.apollo.io

#### Day 5-6: Airtable Basics
- [ ] Sign up for Airtable free account: https://airtable.com
- [ ] Complete the interactive tutorial
- [ ] Create a sample base with tables
- [ ] Try different field types
- [ ] Create different views
- [ ] Try basic automation

**Tutorial:** Airtable Universe (templates): https://airtable.com/universe

#### Day 7: Put It Together
- [ ] Review all three tools
- [ ] Understand how they connect
- [ ] Sketch out your workflow
- [ ] Identify questions for developer

### Phase 2: Test with Sample Data (Week 2)

#### Dynamics 365 → Power BI
- [ ] Follow Power_BI_Beginners_Guide.md
- [ ] Connect Power BI to Dynamics 365
- [ ] Load sample of customer data
- [ ] Create simple dashboard
- [ ] Export 10 accounts to CSV

#### CSV → Airtable
- [ ] Create "Accounts" table in Airtable
- [ ] Import your 10 accounts CSV
- [ ] Add fields: ICP Score, Tier, Status
- [ ] Manually enter some scores
- [ ] Create views: A-Tier, B-Tier, etc.

#### Airtable → Apollo.io
- [ ] Take 3 companies from Airtable
- [ ] Search for them in Apollo.io
- [ ] Find 2-3 contacts per company
- [ ] Export contact details
- [ ] Add to Airtable as linked records

#### Test Message Generation
- [ ] Go to ChatGPT (chatgpt.com)
- [ ] Give it account context:
  ```
  "Write a personalized cold email for:
  Company: ABC Manufacturing
  Industry: Industrial Equipment
  ICP Score: 92 (A-Tier)
  Pain Point: They need to optimize procurement"
  ```
- [ ] Review the generated email
- [ ] Refine your prompt
- [ ] Save good examples

### Phase 3: Small Pilot (Week 3-4)

- [ ] Select 20-50 accounts for pilot
- [ ] Run full workflow end-to-end
- [ ] Track time spent on each step
- [ ] Measure: How many contacts enriched?
- [ ] Measure: How long to generate messages?
- [ ] Get feedback from sales team
- [ ] Identify bottlenecks
- [ ] Calculate ROI potential

### Common Questions & Answers

#### Q: Do I need to be technical to use these tools?
**A:** No! All three tools have user-friendly interfaces:
- **Dynamics 365:** If you can use a website, you can navigate it
- **Apollo.io:** Very intuitive, like LinkedIn search
- **Airtable:** If you can use Excel, you can use Airtable

#### Q: How long does it take to learn?
**A:** 
- **Dynamics 365:** 1-2 days to navigate and understand data
- **Apollo.io:** 2-3 hours to search and export contacts
- **Airtable:** 1 day to build basic databases

#### Q: Can I automate everything?
**A:** Almost! With Option 2 (Hybrid):
- 80% automated (data flow, enrichment, messaging)
- 20% manual (review and approval before sending)

With Option 1 (Full Custom):
- 95% automated
- 5% manual (final review)

#### Q: What if I get stuck?
**A:**
- **Dynamics 365:** Contact your IT department
- **Apollo.io:** Live chat support + extensive documentation
- **Airtable:** Excellent community forum + support articles
- **This Project:** Developer support during implementation

#### Q: Do I need to code?
**A:** 
- **To use the tools:** NO - all have visual interfaces
- **For Option 2 (Hybrid):** NO - use Zapier/Make for automation
- **For Option 1 (Full Custom):** Developer will code for you

#### Q: What about data security?
**A:**
- **Dynamics 365:** Enterprise-grade security (Microsoft)
- **Apollo.io:** SOC 2 certified, GDPR compliant
- **Airtable:** SOC 2 certified, encryption at rest

All tools are trusted by Fortune 500 companies.

---

## Tool Selection by Project Option

### Option 1: Full Custom Build
**Tools You'll Use:**
- ✅ Dynamics 365 (data source)
- ✅ Power BI (analysis)
- ✅ Apollo.io API (enrichment)
- ✅ ChatGPT API (AI messages)
- ❌ Airtable (not needed - custom database instead)

### Option 2: Hybrid (Low-Code)
**Tools You'll Use:**
- ✅ Dynamics 365 (data source)
- ✅ Power BI (analysis)
- ✅ Airtable (database & workflow)
- ✅ Apollo.io (enrichment)
- ✅ ChatGPT (AI messages)
- ✅ Zapier/Make (automation between tools)

### Option 3: Manual + Power BI Only
**Tools You'll Use:**
- ✅ Dynamics 365 (data source)
- ✅ Power BI (analysis)
- ✅ Excel/Google Sheets (manual tracking)
- ⚠️ Apollo.io (manual searches)
- ⚠️ ChatGPT (manual copy-paste)

---

## Quick Reference: Tool URLs

### Sign Up / Access
- **Dynamics 365:** Contact your IT administrator
- **Power BI:** https://powerbi.microsoft.com/desktop (free desktop app)
- **Apollo.io:** https://apollo.io (start free trial)
- **Airtable:** https://airtable.com (free account)
- **ChatGPT:** https://chat.openai.com (free with limits)

### Learning Resources
- **Dynamics 365 Training:** https://learn.microsoft.com/training/dynamics365/
- **Power BI Learning:** https://learn.microsoft.com/power-bi/
- **Apollo.io Academy:** https://academy.apollo.io
- **Airtable Support:** https://support.airtable.com
- **ChatGPT Guide:** https://platform.openai.com/docs

### API Documentation (for developers)
- **Dynamics 365 API:** https://learn.microsoft.com/power-apps/developer/data-platform/webapi/overview
- **Apollo.io API:** https://apolloio.github.io/apollo-api-docs/
- **Airtable API:** https://airtable.com/developers/web/api/introduction
- **OpenAI API:** https://platform.openai.com/docs/api-reference

---

## Summary: What Each Tool Does for Your Project

```
┌────────────────────────────────────────────────────────────┐
│ Dynamics 365                                                │
│ "Where your data lives"                                     │
│                                                              │
│ YOU HAVE THIS ALREADY ✓                                     │
│ → Contains customer & sales data                            │
│ → Source of truth for your business                         │
│ → Read-only access needed                                   │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Power BI                                                    │
│ "Analyzes and visualizes your data"                         │
│                                                              │
│ NEED TO SET UP (See: Power_BI_Beginners_Guide.md)         │
│ → Connects to Dynamics 365                                  │
│ → Identifies top 20% customers                              │
│ → Creates ICP analysis dashboards                           │
│ → Exports data for next steps                               │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Airtable (Option 2 Only)                                   │
│ "Organizes your workflow"                                   │
│                                                              │
│ OPTIONAL (Only if choosing Hybrid approach)                │
│ → Stores accounts with ICP scores                           │
│ → Tracks enrichment status                                  │
│ → Manages outreach campaigns                                │
│ → Connects all tools together                               │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Apollo.io                                                   │
│ "Finds and enriches contacts"                               │
│                                                              │
│ NEED TO PURCHASE                                            │
│ → Enriches company data                                     │
│ → Finds decision-makers                                     │
│ → Provides contact info (email, phone)                      │
│ → Automates outreach sequences                              │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ ChatGPT                                                     │
│ "Writes personalized messages"                              │
│                                                              │
│ NEED API ACCESS ($0.01 per message)                        │
│ → Generates personalized emails                             │
│ → Creates LinkedIn messages                                 │
│ → Writes call scripts                                       │
│ → Adapts to each account's context                          │
└────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Read this guide** to understand each tool (30 minutes)
2. **Try free trials** of Apollo.io and Airtable (1 hour)
3. **Request Dynamics 365 access** from your IT team (if you don't have it)
4. **Review Power_BI_Beginners_Guide.md** to set up Power BI
5. **Decide on Option 1, 2, or 3** based on budget and timeline
6. **Schedule developer consultation** to discuss implementation

---

**You now understand:**
✅ What Dynamics 365, Apollo.io, and Airtable are  
✅ What each tool does in your project  
✅ How they work together  
✅ How to get started with each one  

**Ready to proceed with the project!**

---

**Document Version:** 1.0  
**Created:** February 7, 2026  
**For:** Strikezone Consulting ERP Project  
**Status:** Supplemental Guide
