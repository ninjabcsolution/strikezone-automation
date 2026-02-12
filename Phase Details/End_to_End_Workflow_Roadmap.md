# End-to-End Workflow Roadmap
## Strikezone — ERP Data Intelligence → Look‑Alikes → Enrichment → AI Outreach → Learning Loop

This roadmap covers the **entire workflow**, not just Phase 3.

It is written to support two execution modes:
1) **Pilot (fast proof-of-value)** using CSV/Excel exports first
2) **Production (full automation)** with scheduled ingestion + orchestration

---

## A) Guiding principles (so it works across many ERPs)

1. **Universal Landing Format**
   - Standardize on a minimal set of CSVs (Customers, Orders, optional OrderLines)
   - Everything downstream becomes repeatable and ERP‑agnostic

2. **Explainability > Black box**
   - Every target recommendation should include “reason codes” (why it was selected)

3. **Ship value weekly**
   - Start with a working list + outreach, then iterate on models and automation

---

## B) Roadmap Option 1 — Pilot (2–3 weeks to first outreach)

**Goal:** launch outreach quickly, validate ROI, confirm requirements for 40+ hours/week build.

### Week 0 (2–3 days) — Kickoff & readiness
**Deliverables**
- Confirm objectives, segments, outreach channels
- Confirm CSV templates and required fields
- Confirm tool access: Apollo, email domain warmup plan, AI usage policy

**Dependencies**
- Sample exports from ERP/CRM

### Week 1 — Step 1: Identify Best Customers (Top 20%)
**Work**
- Import CSVs and clean/standardize
- Compute customer rollups:
  - revenue, margin (or proxy), order frequency, recency, category breadth
- Produce **Top 20% list**

**Deliverables**
- Top 20% list (table)
- Short “why these are best” summary (3–5 bullets)

### Week 1–2 — Step 2: Define ICP traits (simple + explainable)
**Work**
- Compare Top 20% vs the rest
- Identify key traits:
  - industry, size, geo, behavior, financial patterns

**Deliverables**
- 1-page ICP summary
- Initial ICP filters for external search (Apollo/LinkedIn)

### Week 2 — Step 3: Find Look‑Alikes (candidate generation)
**Work**
- Translate ICP into external filters
- Generate **net-new prospect list**
- Exclude existing customers (domain/name matching)
- Create **inactive/win-back list** from internal data

**Deliverables**
- Candidate list (Strategic net-new)
- Win-back list (inactive)

### Week 2 — Step 4: Prioritize targets (lightweight)
**Work**
- Tier A/B/C prioritization using simple rules:
  - fit to ICP + growth/intent signals + internal notes

**Deliverables**
- Tier A/B/C target list
- Reason codes per target (top 2–3 reasons)

### Week 2–3 — Step 5: Enrich contacts + personalize outreach
**Work**
- Use Apollo to pull decision-makers
- Draft AI-assisted messaging per segment
- Human review + edits

**Deliverables**
- Contacts for Tier A
- Message pack (Email 1/2/3 + LinkedIn DM + call opener)

### Week 3 — Step 6: Launch outreach + track results
**Work**
- Launch Apollo sequences
- Track replies and meetings
- Weekly iteration loop

**Deliverables**
- Outreach live
- Weekly performance report template

---

## C) Roadmap Option 2 — Production (Full Automation Build, ~6–12 weeks)

**Goal:** minimize manual work via scheduled ingestion, repeatable data pipeline, automated enrichment + AI drafting + tracking.

### Workstream 1 — Data ingestion (ERP‑agnostic to multi‑ERP)

**Phase 1: Universal CSV ingestion (1–2 weeks)**
- Implement ingestion checks:
  - column validation, data types, duplicates, missing values
- Standardize mapping into internal schema

**Phase 2: Connector strategy (2–6 weeks, parallel)**
- Add connectors incrementally (per ERP):
  - API, read-only DB, or ETL tool
- Implement scheduled refresh

**Deliverables**
- Stable “landing format” ingestion pipeline
- Data dictionary + mapping per ERP

### Workstream 2 — Analytics layer (Top 20% + ICP)
**Time:** 2–4 weeks (can start immediately)

**Build**
- Standard rollups and reusable measures
- Top 20% module
- ICP trait extraction module

**Deliverables**
- Reusable dataset and outputs for multiple clients
- Explainable ICP trait report

### Workstream 3 — Look‑Alike engine (AI/ML + external sources)
**Time:** 3–6 weeks

**Build**
- Candidate generation connectors:
  - Apollo company search + firmographics
  - Optional: LinkedIn/D&B enrichment
- Similarity scoring (rules → ML upgrade path)
- Opportunity/intent scoring
- Reason codes and explainability

**Deliverables**
- Ranked strategic prospect list
- Ranked win-back list
- Per-target “why” explanations

### Workstream 4 — Orchestration app (optional but recommended)
**Time:** 4–8 weeks (parallel)

**Build**
- Internal UI (React/Next.js)
- Backend orchestration (Node.js)
- DB schema (accounts/contacts/messages/events)
- Job processing (enrichment + AI) + rate limiting
- Approvals + audit log

**Deliverables**
- End-to-end operational workflow tool

### Workstream 5 — Outreach + learning loop
**Time:** starts in Week 3 onward (continuous)

**Build**
- Standard sequences by segment
- Outcome ingestion (replies/meetings)
- Weekly model calibration

**Deliverables**
- Continuous improvement loop
- KPI dashboard

---

## D) Suggested sprint plan (end-to-end, build mode)

Below is a practical sprint plan if you switch to **40+ hours/week**.

### Sprint 0 (2–3 days)
- Finalize universal landing templates + success metrics

### Sprint 1 (Week 1)
- Top 20% engine + rollups
- Output tables + initial dashboard

### Sprint 2 (Week 2)
- ICP traits + explainability
- Draft external filters

### Sprint 3 (Week 3)
- External candidate generation (Apollo)
- Entity matching + dedupe + exclusions

### Sprint 4 (Week 4)
- Ranking model v1 (rules-based)
- Reason codes

### Sprint 5 (Week 5)
- Enrichment automation + message drafting pipeline

### Sprint 6 (Week 6)
- Outreach execution integration + outcomes tracking

### Sprint 7–8 (Weeks 7–8)
- ML upgrades (optional): classifier + similarity search
- Performance tuning + reliability hardening

---

## E) What funders should see (proof of differentiation)

To demonstrate “why Strikezone wins,” show these outputs:

1. **Top 20% list** (margin/frequency breakdown)
2. **ICP traits** (lift, archetypes, driver explanations)
3. **Look‑alike ranked list** (Similarity score + Opportunity score + reason codes)
4. **Outreach results loop** (reply rates and learning feedback)

---

## F) Key dependencies / decisions (unlock speed)

1. Margin availability (gross margin vs proxy)
2. External source choice (Apollo only vs Apollo + LinkedIn + D&B)
3. AI policy (ChatGPT vs Azure OpenAI; what data is allowed)
4. Manual vs automated ERP refresh (CSV now, connectors later)
5. Who approves messaging + outreach (workflow ownership)
