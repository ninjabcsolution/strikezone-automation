# Milestone Document (Updated) — ERP-Neutral with Approval Portal
## Strikezone: Data-Driven ICP → Look-Alikes → Approval Portal → Automated Outreach

**Timeline:** Phase 0 (4 days) + Phases 1–5 (12 weeks max)  
**Approach:** ERP-neutral design, phased delivery, client approval checkpoints

---

## Executive Summary

We will build a **data-driven outbound automation system** that:

1. Works with **any ERP** (ERP-neutral via CSV/Excel exports)
2. Identifies **Top 20% best customers** and extracts **ICP patterns** from real margin data
3. Finds **look-alike companies** (inactive/win-back + net-new) using Apollo + AI
4. Provides a **client approval portal** (review/edit/approve targets + messaging before launch)
5. Automates **contact enrichment** (Apollo) and **personalized messaging** (ChatGPT)
6. Launches **outreach** via Apollo sequences and **tracks results** with continuous learning

---

## Phase 0 — CEO Version (Proof of Concept)

**Timeline:** 4 business days  
**Goal:** Validate feasibility and demonstrate outputs using Power BI

### Deliverables
- **Power BI Dashboard** (.pbix file + PDF export):
  - Page 1: Executive Overview (Top 20% KPI, revenue/margin trends)
  - Page 2: Top 20% Customer List (bar chart, table, slicers by industry/state)
  - Page 3: ICP Patterns (industry distribution, geo map, frequency vs margin)
- **1-page findings summary** (Top 20% list + ICP traits)

### What this proves
✅ Top 20% customers can be identified from ERP data  
✅ ICP traits can be extracted from real performance  
✅ Workflow is feasible and valuable  

---

## Phase 1 — Foundation + ERP-Neutral Ingestion

**Timeline:** Weeks 1–2  
**Goal:** Build universal data ingestion (works with any ERP)

### Deliverables
1. **Universal CSV templates**:
   - `Customers.csv` (customer_id, name, industry, location, employee_count, annual_revenue)
   - `Orders.csv` (order_id, order_date, customer_id, order_revenue, gross_margin or revenue+COGS)
   - `OrderLines.csv` (optional: order_id, product_id, product_category, quantity, line_revenue)

2. **Ingestion UI** (React):
   - CSV upload interface
   - Column validation
   - QA report (missing values, duplicates, date format issues)

3. **Backend ingestion service** (Node.js + PostgreSQL):
   - Normalize and store data
   - Standardized database schema (customers, orders, order_lines, products tables)
   - Repeatable ingestion process (<10 min per client)

### What this enables
✅ Works with **any ERP** (SAP, Oracle, Netsuite, Dynamics, Epicor, Infor, etc.)  
✅ Repeatable client onboarding  
✅ Clean, standardized data foundation  

### Checkpoint 1
**Decision:** Can we ingest client data successfully? Adjust templates or QA rules if needed.

---

## Phase 2 — Intelligence Layer (Top 20% + ICP + Look-Alikes)

**Timeline:** Weeks 3–6  
**Goal:** Automate best customer identification, ICP extraction, and look-alike targeting

### Deliverable 2A — Top 20% Engine (Week 3)
**What we build:**
- Customer rollups (revenue, margin, frequency, recency, consistency, product mix)
- Top 20% selection logic
- UI: "Best Customers" dashboard (list + filters + export)

**Output:**  
✅ Top 20% customer list with metrics (Revenue, Margin, Order Count, AOV, Mix Breadth)

---

### Deliverable 2B — ICP Trait Extraction (Week 4)
**What we build:**
- Compare Top 20% vs rest (lift analysis)
- Find patterns: industry, size, geo, buying behavior, margin profile
- Output: ICP summary (1-page, explainable)
- UI: ICP traits dashboard

**Output:**  
✅ ICP summary report (what "good" looks like, data-backed)  
✅ Filters ready for external search (Apollo/LinkedIn)

---

### Deliverable 2C — Look-Alike Company Generation (Weeks 5–6)
**What we build:**
- **Win-back targeting:** identify inactive customers (no orders in 6–12 months) with historically high value
- **Net-new targeting:** use Apollo API to find companies matching ICP traits
- Entity matching + dedupe + exclude current customers
- Candidate list generation (hundreds+)

**Output:**  
✅ Ranked look-alike company list (win-back + net-new prospects)  
✅ Automated ICP-to-Apollo filter translation

### Checkpoint 2
**Decision:** Is look-alike list quality good? Are ICP traits accurate? Adjust if needed.

---

## Phase 3 — Scoring + Target Approval Portal

**Timeline:** Weeks 7–8  
**Goal:** Prioritize targets and give client control via approval portal

### Deliverable 3A — ICP Scoring + Prioritization (Week 7)
**What we build:**
- **Similarity Score** (ICP fit): how closely target matches Top 20% traits
- **Opportunity Score** (intent/growth): hiring, funding, expansion signals
- **Tier assignment:** A (85–100), B (70–84), C (50–69)
- **Reason codes:** "why selected" for every target (e.g., "NAICS 333xxx, 200–500 emp, Midwest")

**AI Model Recommendation for ICP Scoring:**

We recommend a **hybrid approach** (rules + ML):

#### Option 1 — Weighted Rules (fast MVP, Week 7)
- Assign weights to ICP traits (industry match = 30%, size match = 20%, geo = 15%, behavior = 25%, financial = 10%)
- Compute similarity score: `Σ(weight × trait_match)`
- Fast, explainable, no training data required

#### Option 2 — ML Classifier (upgrade in Phase 5 if ROI warrants)
- Train a **binary classifier** (Best Customer = 1, Others = 0) using:
  - **Logistic Regression** (explainable via coefficients)
  - **Random Forest** (handles non-linear patterns, feature importance)
  - **XGBoost** (best accuracy, still interpretable via SHAP)
- Features: industry, employee_count, location, margin_profile, order_frequency, product_mix
- Output: probability score (0–100) that target is "like best customers"

#### Option 3 — Similarity Search (if scaling to thousands of targets)
- Embed ICP traits into vectors (using sentence transformers or manual feature engineering)
- Use **k-NN** or **FAISS** to find nearest neighbors to Top 20% customers
- Fast retrieval at scale

**Our recommendation for Week 7:** Start with **Option 1 (weighted rules)** for speed and explainability. Add ML in Phase 5 if data volume and feedback loop justify it.

**Output:**  
✅ Tier A/B/C target list with reason codes  
✅ Similarity + Opportunity scores  

---

### Deliverable 3B — Target Approval Portal (Week 8)
**What we build:**

**Client portal (React UI)** where users can:
- **View** target lists (Tier A/B/C companies) with reason codes
- **Filter/search** by tier, industry, state, score
- **Edit** (change tier, add notes, remove targets)
- **Approve** (mark as "ready for enrichment")
- **Export** (Excel/CSV)
- **Audit trail** (who approved what, when)

**Backend (Node.js):**
- Workflow states: Draft → Pending Review → Approved → Enriching → Messaged → Sent
- Role-based access: Admin, Sales Manager, Rep
- Database: `targets`, `approvals`, `audit_log` tables

**Output:**  
✅ Target approval portal live  
✅ Client controls what goes to outreach  

### Checkpoint 3
**Decision:** Is the approval UX intuitive? Adjust workflow or UI if needed.

---

## Phase 4 — Enrichment + Messaging + Approval

**Timeline:** Weeks 9–10  
**Goal:** Automate contact enrichment and message generation, with client approval

### Deliverable 4A — Contact Enrichment (Week 9)
**What we build:**
- For approved Tier A/B targets, call **Apollo API** to:
  - Pull decision-makers (procurement, ops, plant managers)
  - Get contact details (name, title, email, phone, LinkedIn)
- Role mapping + dedupe
- Store enriched contacts in database
- UI: Contacts per account (table view + export)

**Output:**  
✅ Enriched contact database (2–5 contacts per Tier A/B account)  

---

### Deliverable 4B — AI Messaging Generation + Approval (Week 10)
**What we build:**
- **Prompt library** (by segment: win-back vs strategic)
- Call **ChatGPT API** to generate:
  - Email sequence (Email 1/2/3)
  - LinkedIn DM
  - Call opener script
- A/B variants (2–3 versions per segment)
- **Messaging approval portal**:
  - Client reviews drafts
  - Can edit inline
  - Approves before launch
  - Audit trail

**Output:**  
✅ AI-generated messaging library  
✅ Messaging approval portal  
✅ Approved messaging packs ready for Apollo  

### Checkpoint 4
**Decision:** Is message quality good? Adjust prompts or Apollo filters if needed.

---

## Phase 5 — Launch + Tracking + Learning Loop

**Timeline:** Weeks 11–12  
**Goal:** Push to outreach, track results, continuous learning

### Deliverable 5A — Push to Apollo Sequences (Week 11)
**What we build:**
- Create/update Apollo sequences (multi-touch campaigns)
- Enroll approved contacts with approved messaging
- Track enrollment status
- UI: Campaign launch dashboard

**Output:**  
✅ Outreach integration live  
✅ Contacts enrolled in Apollo sequences  

---

### Deliverable 5B — Outcome Tracking + Learning Loop (Week 12)
**What we build:**
- Capture outcomes from Apollo:
  - Sent, opened, clicked, replied, meeting booked, opportunity created
- Pull via Apollo exports/webhooks (where available)
- Weekly learning report:
  - Which ICP traits correlate with replies?
  - Which industries/personas convert best?
  - Recommended adjustments to scoring
- Feed learnings back into ranking model

**Output:**  
✅ Outcome tracking dashboard  
✅ Weekly learning reports  
✅ Closed-loop learning (targeting → results → refinement)  

---

### Deliverable 5C — Production Hardening (Week 12)
**What we build:**
- **Security:** Role-based access (RBAC), Azure Key Vault (secrets), audit logs
- **Reliability:** Rate limiting, retries, job queue (Bull/BullMQ), error handling
- **Documentation:** Onboarding checklist, CSV templates, runbook
- **Deployment:** Production environment (Azure App Service), monitoring (Application Insights)

**Output:**  
✅ Production-ready system  
✅ Documentation for client handoff  

### Checkpoint 5 (Final)
**Decision:** System complete. Choose:
- **Option A:** Hand off to client team (with training)
- **Option B:** Ongoing support retainer
- **Option C:** Managed service (we run campaigns)

---

## Technical Architecture

### Stack
- **Frontend:** React / Next.js (approval portal + dashboards)
- **Backend:** Node.js (Express / NestJS)
- **Database:** PostgreSQL
- **AI Messaging:** ChatGPT (OpenAI API)
- **Enrichment + Outreach:** Apollo.io
- **Analytics:** Power BI (CEO dashboards + reporting)
- **Hosting:** Azure App Service, Azure Key Vault, Azure Storage

### Why this stack
- **React + Node:** Fast to build, great for API integrations, easy to hire/maintain
- **PostgreSQL:** Reliable, handles structured + JSON, scales well
- **ChatGPT:** Best-in-class text generation, easy API
- **Apollo:** 250M+ companies, enrichment + sequences in one platform
- **Power BI:** Enterprise-standard, CEO-friendly, integrates with Azure

---

## Summary: Deliverables by Phase

| Phase | Timeline | Key Deliverables | Checkpoint |
|-------|----------|------------------|------------|
| **Phase 0** | 4 days | Power BI CEO dashboard + findings summary | Proceed to build? |
| **Phase 1** | Weeks 1–2 | CSV ingestion UI, database schema, repeatable onboarding | Data quality OK? |
| **Phase 2** | Weeks 3–6 | Top 20% list, ICP summary, look-alike candidates | List quality OK? |
| **Phase 3** | Weeks 7–8 | Scoring + target approval portal + audit trail | Portal UX OK? |
| **Phase 4** | Weeks 9–10 | Enriched contacts + AI messaging + messaging approval portal | Message quality OK? |
| **Phase 5** | Weeks 11–12 | Apollo sequences, outcome tracking, learning loop, production launch | Handoff or support? |

---

## What we need from you to start

### For Phase 0 (CEO version, 4 days)
1. **ERP export** (CSV/Excel): Customers + Orders (12–36 months)
2. **Margin field** definition (gross_margin, or revenue + COGS)

### For Phases 1–5 (full build, 12 weeks)
3. **Apollo account** access (API plan recommended)
4. **OpenAI policy** approval (what data can be sent to ChatGPT)
5. **Decision-makers** (who reviews/approves at each checkpoint)
6. **Approval of phased roadmap**

---

## Why this roadmap is funding-ready

✅ **Clear deliverables** at each phase (not "in progress" work)  
✅ **Built-in checkpoints** (adjust after each phase based on learnings)  
✅ **ERP-neutral** (works with any ERP from Day 1)  
✅ **Client control** (approval portal for targets + messaging)  
✅ **Proven tech stack** (React, Node, PostgreSQL, ChatGPT, Apollo, Power BI)  
✅ **Aligned to CEO version** (Phase 0 proves concept, Phases 1–5 automate it)  
