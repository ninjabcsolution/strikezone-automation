# Phase 1: Technical Design Document
## Strikezone Consulting - ERP Data Analysis & GTM Automation

**Project Overview:** Building a data-driven system to connect Dynamics 365 ERP to Power BI for analysis, then connecting to ChatGPT/Copilot and Apollo.io for automated sales outreach.

---

## Table of Contents
1. [Current Strikezone Workflow Review](#1-current-strikezone-workflow-review)
2. [Identification of Automatable Components](#2-identification-of-automatable-components)
3. [High-Level System Architecture](#3-high-level-system-architecture)
4. [Technical Approach](#4-technical-approach)
5. [Power BI Explained (For Beginners)](#5-power-bi-explained-for-beginners)
6. [Assumptions & Suggestions](#6-assumptions--suggestions)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Current Strikezone Workflow Review

### Phase 2: ERP Data Extraction & Analysis
**Current Process:**
- Manual or semi-automated ERP access to Dynamics 365
- Extract customer master data, purchase history (36 months), payment terms, and geographic data
- Identify top 20% customers by gross margin
- Manual analysis of purchasing behavior, product mix, and financial patterns

**Pain Points:**
- Manual data extraction is time-consuming
- Limited visualization capabilities
- Difficult to spot trends without proper BI tools
- No real-time updates

### Phase 3: ICP Development & Look-Alike Identification
**Current Process:**
- Use Microsoft Copilot AI for optional visualization
- Analyze firmographic, behavioral, financial, and operational traits
- Manual collaboration to rank and prioritize accounts
- Manual matching against external sources

**Pain Points:**
- Heavy manual effort in ranking accounts
- Limited AI-assisted pattern recognition
- Difficult to scale ICP matching

### Phase 4: Account Enrichment
**Current Process:**
- Use Apollo.io to gather company data, org charts, and contact information
- Manual enrichment process

**Pain Points:**
- Manual data entry and enrichment
- No automated data flow

### Phase 5: Outreach Execution
**Current Process:**
- Build cadences in Apollo.io
- Manual execution of multi-channel outreach
- Manual response management

**Pain Points:**
- Labor-intensive outreach creation
- Limited personalization at scale
- Manual messaging creation

---

## 2. Identification of Automatable Components

### High Priority Automation Opportunities

#### A. ERP Data Extraction & Visualization (Phase 2)
**Automatable:**
- ✅ **Scheduled data extraction** from Dynamics 365 to Power BI
- ✅ **Automated reports** for top 20% customers by gross margin
- ✅ **Interactive dashboards** for purchasing behavior analysis
- ✅ **Automated alerts** when customer patterns change

**Tools:** Power BI + Dynamics 365 Connector

#### B. ICP Analysis & Scoring (Phase 3)
**Automatable:**
- ✅ **Automated ICP scoring algorithm** (0-100 scale)
- ✅ **AI-powered pattern recognition** using Azure OpenAI/ChatGPT
- ✅ **Automated account categorization** (A-Tier, B-Tier, Inactive, Strategic)
- ✅ **Look-alike identification** using external APIs

**Tools:** Power BI + Azure OpenAI/ChatGPT API + Apollo.io API

#### C. Account Enrichment Pipeline (Phase 4)
**Automatable:**
- ✅ **Automated data enrichment** via Apollo.io API
- ✅ **Contact information retrieval** for decision-makers
- ✅ **Org chart mapping**
- ✅ **Data validation and deduplication**

**Tools:** Custom UI + Apollo.io API + Copilot API

#### D. AI-Powered Messaging (Phase 5)
**Automatable:**
- ✅ **Personalized message generation** using ChatGPT/Copilot
- ✅ **Segment-specific messaging frameworks**
- ✅ **A/B testing message variations**
- ✅ **Automated cadence scheduling**

**Tools:** Custom UI + ChatGPT/Copilot API + Apollo.io API

---

## 3. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PHASE 1: DATA LAYER                      │
│                                                                   │
│  ┌───────────────────┐                                           │
│  │  Dynamics 365 ERP │                                           │
│  │  (Data Source)    │                                           │
│  └────────┬──────────┘                                           │
│           │                                                       │
│           │ Power BI Connector                                   │
│           │ (Scheduled Refresh)                                  │
│           ↓                                                       │
│  ┌───────────────────┐                                           │
│  │    Power BI       │ ← Interactive Dashboards                  │
│  │  Service/Desktop  │ ← ICP Analysis Reports                    │
│  │                   │ ← Customer Segmentation                   │
│  └────────┬──────────┘                                           │
│           │                                                       │
│           │ Export Data (CSV/Excel/API)                          │
│           │                                                       │
└───────────┼───────────────────────────────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  PHASE 2: AUTOMATION & AI LAYER                  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Custom Web Application (UI)                    │ │
│  │         (React/Next.js + Node.js Backend)                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│           │                    │                    │             │
│           │                    │                    │             │
│           ↓                    ↓                    ↓             │
│  ┌────────────┐      ┌────────────────┐   ┌─────────────────┐  │
│  │ Apollo.io  │      │   ChatGPT/     │   │   Power BI      │  │
│  │    API     │      │ Copilot API    │   │  Embedded API   │  │
│  │            │      │                │   │  (Optional)     │  │
│  │• Contact   │      │• ICP Analysis  │   │                 │  │
│  │  Enrichment│      │• Message Gen   │   │• Live Dashboards│  │
│  │• Org Charts│      │• Personalizat'n│   │• Data Refresh   │  │
│  │• Company   │      │• Scoring Logic │   │                 │  │
│  │  Data      │      │                │   │                 │  │
│  └────────────┘      └────────────────┘   └─────────────────┘  │
│           │                    │                                 │
│           └────────────────────┴─────────────────────┐          │
│                                                        │          │
│                                                        ↓          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Data Storage Layer                         │ │
│  │           (PostgreSQL / Azure SQL / MongoDB)                │ │
│  │                                                              │ │
│  │  • Enriched Contact Data                                    │ │
│  │  • ICP Scores                                               │ │
│  │  • Generated Messages                                       │ │
│  │  • Outreach Campaign Data                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                               │                                  │
└───────────────────────────────┼──────────────────────────────────┘
                                │
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                  PHASE 3: EXECUTION LAYER                        │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Apollo.io Cadences                         │ │
│  │                                                              │ │
│  │  • Automated Email Sequences                                │ │
│  │  • LinkedIn Outreach                                        │ │
│  │  • Phone Call Scheduling                                    │ │
│  │  • Response Tracking                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
1. ERP Data → Power BI (Daily Refresh)
2. Power BI → Analysis & Segmentation
3. Segmented Data → Custom UI Application
4. Custom UI → Apollo.io (Enrichment Request)
5. Custom UI → ChatGPT/Copilot (Message Generation)
6. Enriched Data + Messages → Database
7. Database → Apollo.io (Campaign Execution)
8. Apollo.io → Response Tracking → Database
9. Database → Power BI (Performance Dashboard)
```

---

## 4. Technical Approach

### Step 1: Power BI + Dynamics 365 Integration

#### Connection Methods
**Option A: Direct Connection (Recommended)**
- Use Power BI's native Dynamics 365 connector
- Real-time or scheduled refresh
- Secure authentication via OAuth 2.0

**Option B: Azure Data Factory**
- ETL pipeline for complex transformations
- Better for large datasets
- More control over data processing

**Option C: OData Feed**
- Dynamics 365 exposes OData endpoints
- Flexible but requires more setup

#### Implementation Steps
1. **Authenticate Power BI to Dynamics 365**
   - Use organizational credentials
   - Set up service principal for automation

2. **Select Required Tables**
   - Customer Master
   - Sales Orders (36 months)
   - Product Catalog
   - Payment Terms
   - Geographic Data

3. **Create Data Model**
   - Define relationships between tables
   - Create calculated columns (e.g., gross margin)
   - Build measures (e.g., top 20% threshold)

4. **Build Dashboards**
   - Customer segmentation view
   - Revenue/margin analysis
   - Product mix analysis
   - Time-series trends

### Step 2: Custom UI Application

#### Technology Stack
```
Frontend:
- React.js or Next.js (Modern, responsive UI)
- TypeScript (Type safety)
- Tailwind CSS (Styling)
- Chart.js or Recharts (Data visualization)

Backend:
- Node.js + Express (API server)
- OR Python + FastAPI (For AI/ML integration)

Database:
- PostgreSQL (Relational data)
- OR MongoDB (Flexible schema)

Hosting:
- Azure App Service (Microsoft ecosystem)
- OR Vercel (Easy deployment)
```

#### Core Features
1. **Data Import Module**
   - Import from Power BI (CSV/Excel/API)
   - Data validation and cleaning

2. **ICP Scoring Engine**
   - Automated scoring algorithm
   - AI-powered pattern recognition
   - Manual override capability

3. **Apollo.io Integration**
   - Contact enrichment API calls
   - Company data retrieval
   - Org chart visualization

4. **ChatGPT/Copilot Integration**
   - Message generation based on ICP scores
   - Personalization at scale
   - A/B testing variants

5. **Campaign Management**
   - Create outreach cadences
   - Schedule messages
   - Track responses

### Step 3: API Integrations

#### Apollo.io API
```javascript
// Example: Enrich contact
POST https://api.apollo.io/v1/people/match
Headers: {
  "x-api-key": "YOUR_API_KEY"
}
Body: {
  "email": "prospect@company.com",
  "company_name": "Target Company"
}
```

#### ChatGPT/Copilot API
```javascript
// Example: Generate personalized message
POST https://api.openai.com/v1/chat/completions
Headers: {
  "Authorization": "Bearer YOUR_API_KEY"
}
Body: {
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a sales outreach expert..."
    },
    {
      "role": "user",
      "content": "Generate a personalized email for..."
    }
  ]
}
```

### Step 4: Workflow Automation

```
1. Daily Job: Power BI refreshes from Dynamics 365
2. Weekly Job: Export new/updated accounts from Power BI
3. Automated: Import to Custom UI
4. Automated: Run ICP scoring algorithm
5. Automated: Enrich via Apollo.io
6. AI-Assisted: Generate personalized messages
7. Manual Review: Sales team reviews and approves
8. Automated: Push to Apollo.io cadences
9. Automated: Track responses and update database
10. Daily Dashboard: Power BI shows campaign performance
```

---

## 5. Power BI Explained (For Beginners)

### What is Power BI?
Power BI is Microsoft's business intelligence and data visualization tool. Think of it as Excel on steroids – it can:
- Connect to multiple data sources (like your Dynamics 365 ERP)
- Transform and clean data automatically
- Create interactive dashboards and reports
- Update automatically on a schedule
- Share insights with your team

### Key Components

#### 1. Power BI Desktop (Free)
- Desktop application for creating reports
- Design dashboards and visualizations
- Build data models

#### 2. Power BI Service (Cloud - Requires License)
- Online platform to share reports
- Schedule automatic data refreshes
- Collaborate with team members
- **Cost:** $10-20/user/month (Pro) or $20/user/month (Premium)

#### 3. Power BI Gateway (Free)
- Connects cloud Power BI to on-premises data
- Required if Dynamics 365 is hosted locally

### How Power BI Connects to Dynamics 365

```
Step 1: Open Power BI Desktop
Step 2: Click "Get Data"
Step 3: Search for "Dynamics 365"
Step 4: Enter your Dynamics 365 URL
Step 5: Authenticate with your credentials
Step 6: Select the tables you need
Step 7: Click "Load" or "Transform"
```

### Data Transformation (Power Query)
Before loading data, you can:
- Filter rows (e.g., only last 36 months)
- Remove duplicates
- Create calculated columns (e.g., gross margin)
- Merge tables (e.g., customers + orders)
- Group data (e.g., by customer, by product)

### Creating Dashboards

#### Example Dashboard 1: Top 20% Customers
**Visuals:**
- Bar chart: Top customers by gross margin
- Line chart: Revenue trend over 36 months
- Table: Customer details with metrics
- Card: Total revenue, average margin
- Map: Geographic distribution

#### Example Dashboard 2: ICP Analysis
**Visuals:**
- Scatter plot: Order frequency vs. margin
- Treemap: Product mix by customer segment
- Funnel: Customer journey stages
- Matrix: Behavioral traits comparison

### Scheduling Automatic Refresh
```
1. Publish report to Power BI Service
2. Go to dataset settings
3. Configure scheduled refresh (e.g., daily at 6 AM)
4. Set up credentials for Dynamics 365
5. Enable refresh notifications
```

### Power BI Advantages for This Project
✅ **Native Dynamics 365 integration** – No custom coding needed
✅ **Automatic refresh** – Always up-to-date data
✅ **Interactive dashboards** – Click to drill down
✅ **AI insights** – Built-in AI features to detect anomalies
✅ **Mobile access** – View on phone/tablet
✅ **Sharing** – Easy to share with sales team
✅ **Export options** – Export to Excel, CSV, or API

### Power BI Limitations
❌ **Not a database** – It's for analysis, not storage
❌ **Limited automation** – Can't trigger actions automatically
❌ **No direct API calls** – Can't enrich data from Apollo.io directly

**Solution:** Use Power BI for Phase 2 (analysis), then export data to Custom UI for Phases 3-5 (automation).

---

## 6. Assumptions & Suggestions

### Assumptions

1. **Dynamics 365 Access**
   - You have admin or read-only access to Dynamics 365
   - Data is structured with customer, orders, and product tables
   - Historical data (36 months) is available

2. **Power BI Licensing**
   - You will purchase Power BI Pro licenses ($10-20/user/month)
   - OR use Power BI Desktop only (free, but no cloud sharing)

3. **API Access**
   - Apollo.io API access is available (paid plan required)
   - ChatGPT/Copilot API access is available (OpenAI or Azure OpenAI)

4. **Technical Resources**
   - You have access to a web developer for custom UI
   - OR you're willing to use low-code/no-code tools

5. **Data Security**
   - Compliance with GDPR, CCPA (if applicable)
   - Secure handling of customer data
   - NDA and DPA in place

### Suggestions

#### Option 1: Full Custom Build (Recommended for Scale)
**Pros:**
- Complete control over features
- Scalable to thousands of accounts
- Custom ICP scoring logic
- Seamless integrations

**Cons:**
- Higher upfront cost ($15k-30k development)
- 2-3 months development time
- Requires ongoing maintenance

**Tech Stack:**
- Power BI → Custom UI (React + Node.js) → Apollo.io + ChatGPT
- PostgreSQL database
- Azure hosting

#### Option 2: Hybrid (Low-Code + Custom)
**Pros:**
- Faster to market (4-6 weeks)
- Lower cost ($5k-15k)
- Easier to modify

**Cons:**
- Limited customization
- May not scale as well

**Tech Stack:**
- Power BI → Airtable/SmartSuite (low-code database) → Zapier/Make.com (automation) → Apollo.io + ChatGPT
- OR Power Automate (Microsoft's automation tool)

#### Option 3: Manual + Power BI Only (Phase 1 Only)
**Pros:**
- Lowest cost ($1k-3k)
- Quick start (1-2 weeks)

**Cons:**
- Heavy manual work for Phases 3-5
- Not scalable

**Tech Stack:**
- Power BI only
- Manual export to Excel
- Manual Apollo.io and ChatGPT usage

### Recommended Tools

#### For Look-Alike Identification (Phase 3)
1. **Apollo.io** (Recommended)
   - 250M+ contacts
   - Good industrial coverage
   - API available
   - Cost: $99-$149/user/month

2. **LinkedIn Sales Navigator**
   - Best for B2B prospecting
   - Advanced search filters
   - Cost: $99/user/month

3. **D&B Hoovers**
   - Excellent industrial data
   - Comprehensive company profiles
   - Cost: Custom pricing (expensive)

**Suggestion:** Start with Apollo.io, add LinkedIn Sales Navigator if needed.

#### For AI Message Generation
1. **ChatGPT API (OpenAI)** (Recommended)
   - Most flexible
   - Best quality outputs
   - Cost: ~$0.002 per 1k tokens (~$0.01 per message)

2. **Azure OpenAI**
   - Same as ChatGPT but hosted on Azure
   - Better for enterprise (compliance, SLA)
   - Microsoft ecosystem integration

3. **Microsoft Copilot for Sales**
   - Built into Dynamics 365
   - Less customization
   - Included with some Microsoft licenses

**Suggestion:** Use ChatGPT API for Phase 1, migrate to Azure OpenAI if needed for compliance.

#### For Custom UI Development
1. **Full Custom Web App**
   - React + Node.js + PostgreSQL
   - Most flexible

2. **Low-Code Platforms**
   - Retool, Bubble.io, or OutSystems
   - Faster development

3. **Microsoft Power Apps**
   - Integrates with Power BI and Dynamics 365
   - Limited customization

**Suggestion:** Full custom web app for scalability and control.

### Data Security & Compliance
- Use OAuth 2.0 for all API connections
- Encrypt data at rest and in transit
- Implement role-based access control (RBAC)
- Regular security audits
- Compliance with relevant regulations (GDPR, CCPA)

---

## 7. Implementation Roadmap

### Phase 1: Discovery & Technical Design (Current - 2 weeks)
✅ Review workflow
✅ Identify automatable components
✅ Design system architecture
✅ Document technical approach

### Phase 2: Power BI Setup (Weeks 3-4)
- [ ] Set up Power BI Desktop
- [ ] Connect to Dynamics 365
- [ ] Build data model
- [ ] Create dashboards for:
  - Top 20% customer analysis
  - ICP trait identification
  - Product mix analysis
  - Customer segmentation
- [ ] Test and refine visualizations
- [ ] Set up scheduled refresh

**Deliverable:** Interactive Power BI dashboard showing top customers and ICP traits

### Phase 3: Custom UI Development (Weeks 5-10)
- [ ] Set up development environment
- [ ] Design UI/UX mockups
- [ ] Build frontend (React)
- [ ] Build backend API (Node.js)
- [ ] Set up database (PostgreSQL)
- [ ] Implement data import from Power BI
- [ ] Build ICP scoring engine
- [ ] Integrate Apollo.io API
- [ ] Integrate ChatGPT API
- [ ] Testing and bug fixes

**Deliverable:** Custom web application with enrichment and messaging capabilities

### Phase 4: Integration & Testing (Weeks 11-12)
- [ ] End-to-end testing
- [ ] User acceptance testing (UAT)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Training documentation

**Deliverable:** Production-ready system

### Phase 5: Deployment & Training (Week 13)
- [ ] Deploy to production (Azure)
- [ ] Train Strikezone team
- [ ] Monitor initial usage
- [ ] Gather feedback
- [ ] Iterate and improve

**Deliverable:** Live system with trained users

### Ongoing: Support & Maintenance
- [ ] Monitor system performance
- [ ] Regular updates
- [ ] Feature enhancements
- [ ] Technical support

---

## Budget Estimates

### Option 1: Full Custom Build
| Item | Cost |
|------|------|
| Power BI Pro licenses (5 users × $20/month × 12 months) | $1,200/year |
| Apollo.io (2 users × $149/month × 12 months) | $3,576/year |
| ChatGPT API usage (~5,000 messages/month) | $600/year |
| Custom UI development (250-400 hours × $75-150/hour) | $18,750-60,000 |
| Azure hosting | $100-300/month |
| **Total Year 1** | **$25,000-70,000** |
| **Ongoing (Year 2+)** | **$6,500-10,000/year** |

### Option 2: Hybrid (Low-Code)
| Item | Cost |
|------|------|
| Power BI Pro licenses | $1,200/year |
| Apollo.io | $3,576/year |
| ChatGPT API | $600/year |
| Zapier/Make.com Professional | $600/year |
| Custom integration development (100 hours) | $7,500-15,000 |
| **Total Year 1** | **$13,500-21,000** |
| **Ongoing (Year 2+)** | **$6,000/year** |

### Option 3: Manual + Power BI Only
| Item | Cost |
|------|------|
| Power BI Pro licenses | $1,200/year |
| Apollo.io (manual use) | $3,576/year |
| ChatGPT subscription | $240/year |
| Power BI setup & training | $2,000-5,000 |
| **Total Year 1** | **$7,000-10,000** |
| **Ongoing (Year 2+)** | **$5,000/year** |

---

## Success Metrics

### Phase 2 Metrics (Power BI)
- ✅ Dashboards update daily without manual intervention
- ✅ Sales team can identify top 20% customers in < 30 seconds
- ✅ ICP traits are clearly visualized
- ✅ Reports are accessible to all stakeholders

### Phase 3-5 Metrics (Full System)
- ✅ Time to enrich 100 accounts: < 5 minutes (vs. hours manually)
- ✅ Personalized messages generated in < 30 seconds each
- ✅ 90%+ data accuracy (enriched contacts)
- ✅ 3x increase in outreach volume
- ✅ 50%+ time savings on manual tasks

### Business Metrics
- ✅ Meeting booking rate: 5-10% (industry average)
- ✅ Pipeline generated: Track over 3-6 months
- ✅ Cost per qualified meeting
- ✅ ROI on automation investment

---

## Next Steps

1. **Review and approve this technical design document**
2. **Select your preferred option (Full Custom, Hybrid, or Manual)**
3. **Confirm budget and timeline**
4. **Sign off on Phase 1 deliverable**
5. **Proceed to Phase 2: Power BI implementation**

---

## Questions for Client

Before proceeding, please clarify:

1. **Dynamics 365 Access:**
   - Is your Dynamics 365 cloud-based or on-premises?
   - Do you have admin access or need to request it?
   - Which Dynamics 365 modules do you use (Sales, Finance, Operations)?

2. **Budget & Timeline:**
   - What is your budget for this project?
   - What is your preferred timeline?
   - Are you open to phased rollout?

3. **Technical Resources:**
   - Do you have in-house developers?
   - Do you prefer to hire external developers?
   - Are you interested in low-code options?

4. **Tool Preferences:**
   - Do you have existing Apollo.io account?
   - Preference for ChatGPT vs. Copilot?
   - Any other tools already in use?

5. **Scope Prioritization:**
   - Is Power BI setup (Phase 2) highest priority?
   - Do you want to start with manual processes first?
   - Any specific features that are must-have vs. nice-to-have?

---

**Document Version:** 1.0  
**Date:** February 7, 2026  
**Author:** Technical Consultant  
**Status:** Pending Client Approval
