# Phased Roadmap (ERP-Neutral with Approval Portal)
## Strikezone: Data-Driven ICP → Look-Alikes → Approval Portal → Automated Outreach

**Total Timeline:** 12 weeks max (broken into 4–5 phases with checkpoints)

---

## Overview: Phased approach aligned to CEO version

We start with the **CEO version** (proof of concept) to validate feasibility, then build production automation in phases. Each phase has a **checkpoint** where you can review deliverables and make adjustments before proceeding.

### Key design principles
1. **ERP-neutral**: Works with CSV/Excel exports from any ERP (SAP, Oracle, Netsuite, Dynamics, Epicor, etc.)
2. **Look-alike workflow**: Automates finding companies that resemble your best customers
3. **Approval portal**: Client can log in to review/edit/approve target lists and messaging before outreach
4. **Phased delivery**: Each phase delivers working functionality + checkpoint

---

## Phase 0 — CEO Version (Proof of Concept) — **4 business days**

**Goal:** Validate feasibility and show what the outputs look like.

### What we build
- **Power BI dashboard** (3 pages):
  - Page 1: Executive Overview (Top 20% KPI, Revenue/Margin trends)
  - Page 2: Top 20% Customer List (bar chart, table, slicers: Industry/State)
  - Page 3: ICP Patterns (industry distribution, geo map, frequency vs margin scatter)

### Deliverables
- Power BI dashboard file (.pbix)
- PDF export of dashboard
- 1-page findings summary (Top 20% list + ICP traits)

### What it proves
✅ We can identify your real best customers (Top 20%)  
✅ We can extract ICP patterns from actual data  
✅ The workflow is feasible  

### Checkpoint 0
**Decision point:** Does the CEO version demonstrate enough value to proceed with full build?

---

## Phase 1 — Foundation + ERP-Neutral Ingestion — **Weeks 1–2**

**Goal:** Build the foundation so any ERP can feed data into the system.

### What we build
1. **Universal CSV/Excel templates** (Customers, Orders, optional OrderLines)
2. **Ingestion service**:
   - Upload CSVs via web UI
   - Validate columns/data types
   - Normalize and store in PostgreSQL database
   - QA report (missing values, duplicates, date formats)
3. **Core data model** (customers, orders, products, rollups)
4. **App skeleton** (React UI + Node API + database)

### Deliverables
- Ingestion UI (upload CSVs)
- Standardized database schema
- Repeatable ingestion process (<10 min per client)

### What this enables
✅ Any ERP can feed the system (ERP-neutral)  
✅ Repeatable onboarding (CSV templates + how-to)  
✅ Clean, standardized data for all downstream analytics  

### Checkpoint 1
**Decision point:** Can we successfully ingest client data? Does the data quality meet expectations? Adjust templates or add QA rules if needed.

---

## Phase 2 — Top 20% + ICP + Look-Alike Generation — **Weeks 3–6**

**Goal:** Automate the "intelligence" layer (who's best, what they look like, who else looks like them).

### What we build

#### 2A — Top 20% Engine (Week 3)
- Customer rollups: revenue, margin, frequency, recency, consistency, product mix
- Top 20% selection logic
- UI: "Best Customers" list + filters + export

#### 2B — ICP Trait Extraction (Week 4)
- Compare Top 20% vs rest
- Find patterns: industry, size, geo, behavior, financial traits
- Output: ICP summary (1-page, explainable)
- UI: ICP dashboard

#### 2C — Look-Alike Company Generation (Weeks 5–6)
- **Win-back targeting** (inactive customers from internal data)
- **Net-new targeting** (Apollo company search based on ICP filters)
- Entity matching + dedupe + exclude current customers
- Candidate list (hundreds+)

### Deliverables
- Top 20% customer list (with metrics)
- ICP summary report
- Look-alike company candidate list (win-back + net-new)
- Automated filters translating ICP → Apollo search

### What this enables
✅ Repeatable identification of best customers  
✅ Data-backed ICP (not guesses)  
✅ Automated generation of look-alike targets  

### Checkpoint 2
**Decision point:** Does the look-alike list quality meet expectations? Are ICP traits accurate? Adjust scoring logic or Apollo filters if needed.

---

## Phase 3 — Scoring + Approval Portal — **Weeks 7–8**

**Goal:** Prioritize targets and give the client control to review/edit/approve.

### What we build

#### 3A — Scoring + Prioritization (Week 7)
- Similarity score (ICP fit)
- Opportunity score (growth/intent signals)
- Tier A/B/C assignment
- Reason codes ("why selected") per target

#### 3B — Approval Portal (Week 8)
**This is a key differentiator.**

The client logs into a portal where they can:
- **Review target lists** (Tier A/B/C companies)
- **See reason codes** (why each target was selected)
- **Edit** (change tier, remove targets, add notes)
- **Approve** (mark lists as "ready for enrichment")
- **Audit trail** (who approved what, when)

Portal features:
- Role-based access (admin, sales manager, rep)
- Table view with filters + search
- Bulk approve/reject
- Export (Excel/CSV)

### Deliverables
- Ranked target list (Tier A/B/C with reason codes)
- Approval portal UI (React)
- Backend workflow states (Draft → Pending Review → Approved → Enriching)
- Audit log

### What this enables
✅ Prioritized targeting (focus on highest-probability accounts first)  
✅ Human oversight (client controls what goes to outreach)  
✅ Trust + transparency (explainability + approval workflow)  

### Checkpoint 3
**Decision point:** Is the approval workflow intuitive? Does the portal meet client needs? Adjust UI or approval steps if needed.

---

## Phase 4 — Enrichment + Messaging + Approvals — **Weeks 9–10**

**Goal:** Automate contact enrichment and message generation, with client approval.

### What we build

#### 4A — Contact Enrichment (Week 9)
- For approved Tier A/B targets, call Apollo API to pull decision-makers
- Role mapping (procurement, ops, plant manager, etc.)
- Dedupe contacts
- Store in database
- UI: Contacts per account (name, title, email, phone, LinkedIn)

#### 4B — AI Messaging Generation + Approval (Week 10)
- Prompt library (by segment: win-back vs strategic)
- Call ChatGPT API to generate:
  - Email sequence (1/2/3)
  - LinkedIn DM
  - Call opener script
- A/B variants
- **Messaging approval portal**:
  - Client reviews drafts
  - Can edit inline
  - Approves before launch
  - Audit trail (who approved which messages)

### Deliverables
- Enriched contact database
- AI-generated messaging library
- Messaging approval portal (similar UX to target approval)
- Approved messaging packs (ready to push to Apollo)

### What this enables
✅ Automated contact enrichment (saves 10–20 hours per rep per month)  
✅ AI-assisted messaging (consistent, personalized, scalable)  
✅ Client control (review + edit before outreach)  

### Checkpoint 4
**Decision point:** Is messaging quality good? Does enrichment pull the right contacts? Adjust prompts or Apollo filters if needed.

---

## Phase 5 — Launch + Tracking + Learning Loop — **Weeks 11–12**

**Goal:** Push to outreach, track outcomes, and enable continuous improvement.

### What we build

#### 5A — Push to Apollo Sequences (Week 11)
- Create/update Apollo sequences
- Enroll approved contacts with approved messaging
- Track enrollment status
- UI: Campaign launch screen

#### 5B — Outcome Tracking + Feedback Loop (Week 12)
- Capture outcomes:
  - Sent, opened, clicked, replied, meeting booked, opportunity created
- Pull from Apollo exports/webhooks (where available)
- Weekly learning report:
  - What traits correlate with replies?
  - Which industries/personas convert?
  - Recommended adjustments to ICP/scoring
- Feed learnings back into ranking model

#### 5C — Production Hardening (Week 12)
- Security: role-based access, secrets management (Azure Key Vault)
- Reliability: rate limiting, retries, job queue stability
- Documentation: onboarding checklist, runbook
- Deployment: production environment + monitoring

### Deliverables
- Working outreach integration (Apollo sequences)
- Outcome tracking dashboard
- Weekly learning reports
- Production-ready system with docs

### What this enables
✅ End-to-end automation (CSV upload → outreach live)  
✅ Closed-loop learning (targeting → results → refinement)  
✅ Repeatable weekly pipeline  

### Checkpoint 5 (Final)
**Decision point:** System is production-ready. Options:
- **Option A:** Hand off to client team (with training)
- **Option B:** Ongoing support retainer (monitoring, tuning, adding connectors)
- **Option C:** Managed service (we run campaigns for client)

---

## Summary: 5 Phases with Checkpoints

| Phase | Duration | Goal | Key Deliverable | Checkpoint Decision |
|-------|----------|------|-----------------|---------------------|
| **Phase 0** | 4 days | CEO version (POC) | Power BI dashboard | Proceed to build? |
| **Phase 1** | Weeks 1–2 | ERP-neutral foundation | CSV ingestion + DB | Data quality OK? |
| **Phase 2** | Weeks 3–6 | Top 20% + ICP + look-alikes | Candidate lists | List quality OK? |
| **Phase 3** | Weeks 7–8 | Scoring + approval portal | Target approval UI | Portal UX OK? |
| **Phase 4** | Weeks 9–10 | Enrichment + messaging + approval | Messaging portal | Message quality OK? |
| **Phase 5** | Weeks 11–12 | Launch + tracking + learning | Production system | Handoff or support? |

---
