# 12-Week Roadmap (Step-Aligned) — Build From Scratch → Production
## Strikezone Method: Top 20% → ICP → Look‑Alikes → Prioritize → Enrich+Personalize → Launch+Learn

**Deadline:** 12 weeks  
**Goal:** A production-ready MVP that implements your **6-step method**, supports **multiple ERPs** via a universal CSV/Excel landing format, and includes a CEO-friendly view.

---

## 0) What we are building (in plain English)

We are building a system that:

1. **Ingests ERP/CRM exports** (CSV/Excel) from any ERP
2. **Finds the Top 20% highest-value customers** (Step 1)
3. **Extracts ICP patterns** from those customers (Step 2)
4. **Finds look-alike companies** using external datasets (Step 3)
5. **Scores and prioritizes** targets into Tier A/B/C (Step 4)
6. **Enriches contacts and creates personalized messaging** (Step 5)
7. **Launches outreach and tracks results**, continuously improving targeting (Step 6)

---

## 1) Scope & constraints (to fit 12 weeks)

### ERP-agnostic by design
**Week 1–12 uses universal templates**:
- `Customers.csv`
- `Orders.csv`
- optional `OrderLines.csv`

Connectors (API/ETL) are optional after Week 12.

### Tools assumed
- External data + outreach: **Apollo**
- AI messaging: **ChatGPT/OpenAI**
- Storage: **PostgreSQL**
- App: **React/Next.js + Node.js**

---

## 2) “Done” definition (Week 12)

By Week 12, the system can do an end-to-end run:

✅ Upload ERP exports → normalize → store  
✅ Generate **Top 20% list** + metrics (Revenue/Margin/Frequency/Mix)  
✅ Generate **ICP summary** (patterns)  
✅ Generate **look-alike company list** (net-new) + exclude customers  
✅ Produce **Tier A/B/C** targets with reason codes  
✅ Enrich decision-makers and generate personalized messaging drafts  
✅ Human approval + push into Apollo sequences  
✅ Track replies/meetings and feed learnings back into ranking  
✅ CEO view: simple workflow + KPIs (one-pager / one screen)  

---

## 3) 12-week plan mapped to your 6 steps

### Week 1 — Foundation + universal landing format
**Objective:** unblock everything by standardizing data.

**Deliverables**
- Final CSV templates + data dictionary
- Repo + environments + DB baseline schema
- App skeleton: React UI + Node API

**CEO output (draft)**
- 1-slide “workflow overview” draft (Step 1–6)

**Exit criteria**
- One sample client export loads locally without manual fixes.

---

### Week 2 — Step 0: Ingestion MVP (CSV upload → DB + QA)
**Objective:** accept ERP data from any ERP.

**Deliverables**
- CSV upload UI
- Validation + QA report (missing fields, duplicates, date formats)
- Normalized tables in DB

**Exit criteria**
- Repeatable ingestion run in < 10 minutes for new client files.

---

### Week 3 — Step 1: Identify Top 20% customers
**Objective:** answer “Who makes you the most money?”

**Deliverables**
- Customer rollups:
  - revenue, gross margin (or proxy), order frequency, consistency, recency
  - product mix breadth (if OrderLines provided)
- Top 20% list output + filters
- Reason codes for “why top 20%” (e.g., margin $, frequency, breadth)

**Exit criteria**
- Top 20% list is validated by stakeholder sample spot-check.

---

### Week 4 — Step 2: Define ICP patterns from top customers
**Objective:** define “what good looks like” from real data.

**Deliverables**
- ICP traits report (explainable):
  - industry patterns, geo patterns, size proxies
  - behavioral patterns (frequency, consistency)
  - mix patterns (category breadth)
- Output: “ICP summary” (1 page) + filters for external search

**Exit criteria**
- Sales leadership can read ICP and agree it matches reality.

---

### Week 5 — Step 3a: Inactive / win-back targeting (internal)
**Objective:** identify strong accounts that went quiet.

**Deliverables**
- Inactive rules (e.g., no orders in 6–12 months)
- Win-back list prioritized by historical value + fit
- Reason codes: “historically high margin”, “broad mix”, “good pay history”

**Exit criteria**
- Win-back list is ready for enrichment and outreach.

---

### Week 6 — Step 3b: Look-alike company generation (external)
**Objective:** find net-new companies that match ICP.

**Deliverables**
- Convert ICP traits into Apollo company search filters
- Generate prospect company candidates (net-new)
- Entity matching + dedupe + exclude current customers

**Exit criteria**
- Candidate list (hundreds+) with firmographics and domains.

---

### Week 7 — Step 4: Score and prioritize targets (Tier A/B/C)
**Objective:** ranking and focus.

**Deliverables**
- Scoring v1:
  - Similarity score (ICP fit)
  - Opportunity score (growth/intent signals available)
- Tier assignment A/B/C
- Reason codes per account (“why A-tier”)

**Exit criteria**
- Sales can pick top 50–200 accounts and agree ranking is sensible.

---

### Week 8 — Step 5a: Enrich contacts (Apollo people)
**Objective:** get real decision-makers.

**Deliverables**
- For Tier A, pull:
  - procurement leaders
  - ops leaders
  - plant managers (as applicable)
- Dedupe contacts + choose primary persona

**Exit criteria**
- Each Tier A account has 2–5 usable contacts.

---

### Week 9 — Step 5b: Personalize outreach (ChatGPT/OpenAI) + approvals
**Objective:** produce relevant outreach, not generic blasts.

**Deliverables**
- Prompt library (by segment):
  - win-back messaging
  - strategic look-alike messaging
- Generate:
  - Email 1/2/3
  - LinkedIn DM
  - Call opener
- UI to review/edit/approve drafts

**Exit criteria**
- Messaging quality approved by sales leader.

---

### Week 10 — Step 6a: Launch outreach (Apollo sequences)
**Objective:** push into execution.

**Deliverables**
- Create/update sequences in Apollo
- Enroll approved contacts
- Track enrollment status

**Exit criteria**
- First production campaign launched to Tier A.

---

### Week 11 — Step 6b: Track results + feedback loop
**Objective:** measure and improve.

**Deliverables**
- Capture outcomes (export-based initially):
  - replies
  - meetings booked
  - opportunities created
- Weekly learning report:
  - what traits correlate with replies
  - what industries/personas convert

**Exit criteria**
- Weekly pipeline is repeatable with measurable KPIs.

---

### Week 12 — Production hardening + CEO view + handoff
**Objective:** reliable system, ready to onboard new clients.

**Deliverables**
- Security: RBAC, secrets mgmt, audit log
- Reliability: batching, retries, rate limits
- Documentation:
  - onboarding checklist
  - CSV templates + how-to
- CEO view (final):
  - 1-page one-pager PDF OR simple dashboard screen
- Production launch checklist complete

**Exit criteria**
- A new client can run from “CSV export” → “campaign launch” using documented steps.

---

## 4) Where your differentiation lives (Phase 3 focus)

To separate Strikezone, invest most heavily in Weeks 4–7:
- ICP trait model (explainable)
- External candidate generation (broad)
- Ranking (Similarity + Opportunity)
- Reason codes (trust)

---

## 5) Weekly checkpoints to keep funders aligned

Funders should see tangible outputs every week:

- W3: Top 20% list
- W4: ICP summary
- W6: Look-alike candidate list
- W7: Tier A/B/C ranked list with reasons
- W9: Messaging pack + approvals
- W10: Outreach launched
- W11: Results report
- W12: Production-ready onboarding
