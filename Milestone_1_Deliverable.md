# Milestone 1 Deliverable — Discovery & Technical Design (25%)
## Strikezone Consulting — ERP Data Intelligence & GTM Automation

**Client:** Strikezone Consulting  
**Milestone:** 1 — Discovery & Technical Design  
**Status:** Ready for Client Review & Acceptance  
**Date:** 2026-02-09  

---

## 0) Milestone Scope (Per SOW)

**Milestone 1 – Discovery & Technical Design (25%)**

### Deliverables
- Review of current StrikeZone workflow
- Identification of automatable components
- High-level system architecture / flow diagram
- Technical approach and assumptions documented
- Suggestions on tools

### Acceptance Criteria
- Client approval of documented automation plan and architecture

## 1) Executive Summary

This Milestone 1 deliverable documents the **current Strikezone BDaaS workflow**, identifies which steps can be **automated**, and proposes a **high-level technical architecture** and **implementation approach** for a data-driven system that:

1. Connects **Dynamics 365 ERP** to **Power BI** (analysis and dashboards)
2. Uses an **ICP scoring model (0–100)** to categorize accounts (A/B/Win-Back/Strategic)
3. Integrates with **Apollo.io** for account and contact enrichment
4. Leverages **AI (ChatGPT/Copilot/Azure OpenAI)** to generate hyper-personalized outreach messaging
5. Supports execution via **Apollo.io sequences/cadences**, with tracking and reporting

**Outcome:** a clear, client-approved automation plan and architecture that can be implemented in subsequent phases.

---

## 2) Source Documents Reviewed (Inputs)

The following documents were analyzed and synthesized into this milestone:

- **SOW v1 - Konnor H.pdf** (Milestone 1 deliverables + acceptance criteria)
- **Strikezone Process v1.pdf** (BDaaS process phases 1–5 + ICP scoring model)
- **Strikezone Process v2.pdf** (refined BDaaS process + expanded notes on AI/ML use)
- **Strikezone_BDaaS_One_Pager.pdf** (one-page overview of governance → data intelligence → outreach)
- **Phase1_Technical_Design_Document.md** (detailed technical design + architecture + roadmap)
- **PROJECT_SUMMARY_AND_NEXT_STEPS.md** (client-facing summary + decision framework)
- **Tools_Explained_For_Beginners.md** (plain-English explanation of tools)
- **Client_Discovery_Questionnaire.md** (requirements gathering template)

---

## 3) Current Strikezone Workflow (High-Level)

Strikezone’s BDaaS process (as provided) is a multi-phase approach:

1. **Governance & Setup** — agreements, secure access, legal/data readiness
2. **ERP Data Intelligence** — identify top 20% customers by gross margin; analyze behavior/product mix
3. **ICP & Look-Alike Targeting** — define ideal traits; find similar companies inside/outside ERP/CRM
4. **Account Enrichment** — decision-makers, firmographics, org chart, contact details
5. **Outreach Execution** — segmented, multi-channel outreach → qualified meetings

### Key Observations
- Current steps involve **significant manual work** (extracting data, analyzing, enriching, writing messages).
- The process is **well-defined** and can be standardized into a repeatable pipeline.
- Automation will increase throughput and consistency while preserving human review where needed.

---

## 4) Identification of Automatable Components

### Phase 2 — ERP Data Extraction & Analysis (High Priority)
**Automate:**
- Scheduled extraction/refresh from **Dynamics 365 → Power BI**
- Standard dashboards:
  - Top 20% customers by gross margin (last 36 months)
  - Order frequency, AOV, margin trends
  - Product mix breadth and category penetration
  - Geographic / industry distribution

### Phase 3 — ICP Development & Scoring
**Automate:**
- ICP scoring engine (0–100) aligned to Strikezone’s model:
  - Financial fit (25)
  - Behavioral fit (25)
  - Operational fit (20)
  - Firmographic fit (20)
  - Strategic fit (10)
- Automated segmentation:
  - **A-tier:** 85–100
  - **B-tier:** 70–84
  - **C-tier:** 50–69
  - **Low fit:** 0–49
- “Look-alike” suggestions using external data sources (Apollo/LinkedIn/Hoovers), with a manual review loop

### Phase 4 — Enrichment
**Automate:**
- Enrichment requests via **Apollo.io API** (company details + contacts)
- Deduping + normalization (company naming, titles, locations)
- Store enriched results in a database for reuse

### Phase 5 — Messaging & Outreach Execution
**Automate:**
- AI-assisted personalization at scale:
  - cold email copy
  - LinkedIn DM
  - call scripts
  - variants for A/B testing
- Packaging approved messaging into Apollo sequences/cadences
- Status tracking + performance reporting

---

## 5) High-Level System Architecture (Proposed)

### 5.1 Architecture Overview

**Data Layer (Analytics):**
- Dynamics 365 ERP → Power BI dataset (scheduled refresh)

**Automation & AI Layer (Operational):**
- A lightweight **web app + backend** (or low-code alternative) that:
  - imports scored/segmented accounts
  - triggers enrichment
  - generates AI messaging
  - stores outputs and campaign metadata

**Execution Layer (Outreach):**
- Apollo.io sequences/cadences + response tracking

### 5.2 Data Flow (Milestone 1 Design)

1. **Dynamics 365 → Power BI** (daily/weekly refresh)
2. **Power BI → Segmented export** (A/B/Win-Back/Strategic)
3. **Segmentation → Enrichment** (Apollo API)
4. **Enriched data → AI messaging generation** (ChatGPT/Copilot/Azure OpenAI)
5. **Approved messages → Apollo sequences**
6. **Apollo responses/results → stored + visualized** (Power BI)

---

## 6) Technical Approach & Assumptions

### 6.1 Recommended Tooling
- **Power BI** for dashboards and analysis (native Dynamics 365 connector)
- **Apollo.io** for enrichment + sequences/cadences
- **AI**: ChatGPT API or **Azure OpenAI** (enterprise/compliance-friendly option)
- **Data storage** (for automation layer): PostgreSQL / Azure SQL (recommended)

### 6.2 Key Assumptions
- Client can provide **read-only or admin access** to Dynamics 365.
- Client has (or will obtain) required licenses/plan levels:
  - Power BI Pro (if sharing via Power BI Service)
  - Apollo plan with API access (if automating enrichment)
- Data history of **36 months** is available (per Strikezone process).
- Security/legal agreements (NDA/MSA/SOW/DPA) can be executed prior to data access.

### 6.3 Risks / Dependencies
- Data quality issues (duplicates, missing margin fields, inconsistent product categories)
- API limits and credit usage (Apollo)
- Compliance constraints (whether data can be sent to 3rd-party AI; Azure OpenAI may be preferred)

---

## 7) Deliverables (Milestone 1 — As Defined in SOW)

Milestone 1 – **Discovery & Technical Design (25%)**

### 7.1 Delivered Artifacts
1. **Review of current StrikeZone workflow**  
   - Captured in: `Phase1_Technical_Design_Document.md` (Section 1) and summarized in this document

2. **Identification of automatable components**  
   - Captured in: `Phase1_Technical_Design_Document.md` (Section 2) and summarized in this document

3. **High-level system architecture / flow diagram**  
   - Captured in: `Phase1_Technical_Design_Document.md` (Section 3) and summarized in this document

4. **Technical approach and assumptions documented**  
   - Captured in: `Phase1_Technical_Design_Document.md` (Sections 4–6) and summarized in this document

5. **Suggestions on tools**  
   - Captured in: `Phase1_Technical_Design_Document.md` + supporting guide: `Tools_Explained_For_Beginners.md`

### 7.2 Supporting / Client-Facing Documents
- `PROJECT_SUMMARY_AND_NEXT_STEPS.md` (shareable summary + next actions)
- `Client_Discovery_Questionnaire.md` (to finalize requirements and access details)

---

## 8) Acceptance Criteria (Milestone 1)

Per SOW, Milestone 1 is accepted when:

✅ **Client approves the documented automation plan and architecture**.

**Payment:** via Upwork platform, due upon acceptance (Milestone 1 = 25%).

---

## 9) Open Items / Questions for Client (To Confirm Before Phase 2)

1. Is Dynamics 365 **cloud** or **on-prem**? Which modules are in use (Sales, Finance, Supply Chain, Business Central)?
2. Who can grant **read-only/admin** access and what is the expected timeline?
3. Which data fields are available for **gross margin** and **payment behavior**?
4. Tool decisions:
   - Apollo plan + API availability
   - AI approach: ChatGPT vs Azure OpenAI vs Copilot
5. Preferred delivery approach:
   - Option 1: Full custom build
   - Option 2: Hybrid low-code
   - Option 3: Power BI only (manual downstream)

---

## 10) Recommended Next Step (Post-Milestone 1)

Proceed to **Phase 2: Power BI Setup**:

- Connect Power BI to Dynamics 365
- Build the initial datasets and data model
- Publish dashboards for:
  - Top 20% accounts by margin
  - ICP traits and segmentation
- Validate results with stakeholders and lock in export format for automation layer

---

## 11) Client Sign-Off

By signing below, the client acknowledges that Milestone 1 deliverables have been received and accepted.

| Name | Title | Signature | Date |
|------|-------|-----------|------|
|  |  |  |  |

---

## Appendix A — References (Where the Details Live)

If the client wants deeper detail beyond this Milestone 1 summary:

- **Detailed technical design + diagrams:** `Phase1_Technical_Design_Document.md`
- **High-level client summary:** `PROJECT_SUMMARY_AND_NEXT_STEPS.md`
- **Tool explanations for non-technical stakeholders:** `Tools_Explained_For_Beginners.md`
- **Discovery questions to finalize Phase 2 implementation:** `Client_Discovery_Questionnaire.md`
