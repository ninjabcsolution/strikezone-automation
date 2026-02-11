# Project Kickoff Meeting — Single-Page Content
## Strikezone: ERP Data Intelligence → ICP → Look-Alikes → Automated Outreach

---

## 1) Why we need this project

**Current problem:**
- Sales teams spend 60–80% of their time on manual research and list-building
- Most companies guess at their ICP instead of deriving it from actual profit data
- Cold outbound has low conversion because targeting is not data-driven
- No systematic way to find companies that look like your best customers

**This project solves:**
✅ Automatically identifies your **real** best customers (Top 20% by margin)  
✅ Reverse-engineers **what "good" looks like** from actual performance data  
✅ Finds **net-new look-alike companies** using external data + AI  
✅ Automates contact enrichment and personalized messaging  
✅ Creates a **repeatable weekly pipeline** with continuous learning  

---

## 2) What you get (benefits)

### Business benefits
- **3–5× better conversion** vs generic cold outbound (targeting companies that resemble proven winners)
- **70–90% reduction** in manual research time per rep
- **Predictable weekly pipeline** (refresh targets → enrich → message → launch → track)
- **Data-backed decisions** (stop guessing at ICP; use margin data instead)

### Competitive advantage
- Most competitors use static buyer personas. You'll use **dynamic, data-derived ICP** that evolves weekly.
- **Explainability**: every target includes "why selected" (builds trust with sales team).
- **Closed loop**: targeting → outreach → results → learning (most tools stop at lists).

---

## 3) The workflow (6 steps)

### Step 1 — Identify your best customers (Top 20%)
- Ingest ERP/CRM data (CSV/Excel): Customers + Orders (12–36 months)
- Analyze: Revenue, Gross Margin, Order Frequency, Consistency, Product Mix
- **Output:** Top 20% customer list with metrics

### Step 2 — Define what "good" looks like (ICP)
- Find patterns across best customers: Industry, Company Size, Geography, Buying Behavior
- **Output:** Simple ICP summary (1-page, data-backed)

### Step 3 — Find look-alike companies
- Use external databases (Apollo.io) to find companies matching ICP traits
- Identify inactive/win-back customers from internal data
- **Output:** Ranked list of net-new prospects + win-back targets

### Step 4 — Score and prioritize targets (Tier A/B/C)
- Rank by: ICP fit + growth/intent signals + strategic importance
- **Output:** Tier A/B/C lists with "reason codes" (why each was selected)

### Step 5 — Enrich contacts and personalize outreach
- Pull decision-makers via Apollo (Procurement, Ops, Plant leaders)
- Generate personalized messaging via ChatGPT (Email, LinkedIn, Call Script)
- Human approval before launch
- **Output:** Approved contacts + messaging packs

### Step 6 — Launch outreach and track results
- Push to Apollo sequences (multi-touch campaigns)
- Track: Replies, Meetings Booked, Opportunities Created
- Continuously refine targeting based on what converts
- **Output:** Weekly pipeline + learning reports

---

## 4) Phased approach: CEO version first, then full build

### Phase 1 — CEO Version (Proof of Concept) — **4 business days**

**Goal:** Prove feasibility and show what outputs look like.

**What we build:**
- Power BI dashboard (3 pages):
  - Page 1: Executive Overview (Top 20% KPI, Revenue/Margin trends)
  - Page 2: Top 20% Customer List (bar chart + table + slicers)
  - Page 3: ICP Patterns (industry, geo, frequency vs margin)

**What it includes:**
- Uses sample CSV data (or client's real data if available)
- Shows Top 20% customers and their contribution to margin
- Shows ICP traits (what best customers have in common)
- Demonstrates the concept of look-alike targeting (manual filter example)

**Deliverable (Day 4):**
- Power BI dashboard file (.pbix)
- PDF export of dashboard
- 1-page summary of findings

**Limitations of CEO version:**
- Does NOT automate Apollo enrichment
- Does NOT generate AI messaging
- Does NOT push to outreach sequences
- This is a **feasibility demo**, not production automation

---

### Phase 2 — Full Build (Production Automation) — **12 weeks max**

**Goal:** End-to-end automation (CSV upload → look-alikes → enrichment → messaging → outreach → tracking).

**Timeline:**
- **Week 1:** Foundation (CSV templates, DB schema, app skeleton)
- **Week 2:** CSV ingestion + validation
- **Week 3:** Top 20% engine
- **Week 4:** ICP trait extraction
- **Week 5:** Win-back targeting
- **Week 6:** Look-alike candidate generation (Apollo)
- **Week 7:** Scoring + Tier A/B/C + reason codes
- **Week 8:** Contact enrichment (Apollo people)
- **Week 9:** AI messaging generation (ChatGPT) + approvals
- **Week 10:** Push to Apollo sequences + launch
- **Week 11:** Outcome tracking + feedback loop
- **Week 12:** Hardening + docs + production launch

**Deliverable (Week 12):**
- Fully working production system
- Custom app (React UI + Node API)
- PostgreSQL database
- Integrations: Apollo + ChatGPT
- Onboarding docs for new clients

---

## 5) When can I make a first version?

**CEO version (feasibility demo):** **4 business days** from data delivery  
**First working automation (Weeks 1–6 complete):** **6 weeks** from project start  
**Full production system:** **12 weeks max** from project start  

---

## 6) Why Power BI?

**Power BI is used for:**
- **Data analysis and dashboards** (Top 20%, ICP traits, trends)
- **CEO-friendly visualization** (executives can see KPIs at a glance)
- **Repeatable reporting** (scheduled refresh for monthly/weekly updates)

**Why Power BI specifically:**
- Integrates well with Microsoft ecosystem (Azure, Dynamics 365)
- Handles large datasets efficiently
- Easy to export/share (PDF, web publish)
- Familiar to most enterprises

**What Power BI does NOT do:**
- Cannot call external APIs (Apollo, ChatGPT)
- Cannot run workflow orchestration (Ready → Enriched → Approved → Sent)
- Cannot push data into outreach tools automatically

That's why we need a **Custom App** for automation.

---

## 7) Why Custom App?

**The Custom App is the "automation brain" between Power BI and Apollo/ChatGPT.**

**What the Custom App does:**
1. **Ingests outputs from Power BI** (Top 20%, ICP, segmented targets)
2. **Calls Apollo API** to enrich companies + find contacts
3. **Calls ChatGPT API** to generate personalized messaging
4. **Manages approvals** (sales reviews drafts before launch)
5. **Pushes to Apollo sequences** (enrolls contacts + messages)
6. **Tracks outcomes** (replies, meetings, opportunities)
7. **Stores everything in a database** (audit trail, traceability)

**Why we can't do this in Power BI alone:**
- Power BI is a visualization tool, not an orchestration platform
- No way to call external APIs repeatedly and securely
- No way to manage state (which targets are enriched, approved, sent)
- No way to store AI-generated messages or track approvals

---

## 8) Tech stack

### Frontend (Custom App UI)
- **React** or **Next.js**
- Why: Fast to build, easy to maintain, great for internal tools

### Backend (Custom App API)
- **Node.js** (Express or NestJS)
- Why: Great for API integrations (Apollo, ChatGPT), handles async jobs well

### Database
- **PostgreSQL**
- Why: Reliable, handles structured + JSON data, scales well

### AI Messaging
- **ChatGPT (OpenAI API)**
- Why: Best-in-class text generation, easy API, supports custom prompts

### Enrichment + Outreach
- **Apollo.io**
- Why: 250M+ companies, 60M+ contacts, has enrichment + sequences in one platform

### Dashboards + Analysis
- **Power BI**
- Why: Enterprise-standard, integrates with Azure, CEO-friendly

### Hosting (recommended)
- **Azure App Service** (aligns with Microsoft ecosystem)
- **Azure Key Vault** (secrets management)
- **Azure Storage** (file uploads, exports, logs)

---

## 9) What we need from you to start

### To build CEO version (4 days)
1. **ERP export** (CSV/Excel): Customers + Orders (12–36 months)
2. **Margin field** (gross_margin, or revenue + COGS)

### To build full automation (12 weeks)
3. **Apollo account** access
4. **OpenAI policy** approval (which data can be sent to ChatGPT)
5. **Decision-makers** (who approves ICP, target lists, messaging)

---

## 10) Next steps

1. ✅ **Agree on CEO version scope** (4 days, Power BI dashboard)
2. ✅ **Lock data delivery date** (when can you provide CSV exports?)
3. ✅ **Confirm full build timeline** (12 weeks max, phased delivery)
4. ✅ **Schedule follow-up** (review CEO version, decide on full build)
