# Phase 3 (Detailed) — Top 20% → ICP Traits → Look‑Alike Targeting (AI/ML + External Data)
## Strikezone — ERP-Agnostic Design (CSV/Excel first, connectors later)

**Purpose of this doc:** make Phase 3 extremely clear to stakeholders and funders:
- *How* we identify the **top 20% customers** (profit drivers)
- *How* we extract **ICP traits** from those customers
- *How* we use **AI/ML + external data sources** to find **inactive/win-back** and **net-new strategic look‑alikes**

---

## 1) Phase 3 Overview (What we are building)

Phase 3 is the “differentiation engine.” It takes internal performance signals (ERP/CRM) and turns them into:

1. **Best Customer Set** (Top 20% by margin or profit proxy)
2. **ICP Trait Model** (what “good” looks like in the real world)
3. **Look‑Alike Generator** (find similar companies)
4. **Target Ranking** (who to outreach first)
5. **Reason Codes** (explainability: *why* a target is recommended)

Outputs are **actionable lists** your sales team can use immediately.

---

## 2) Inputs Required (ERP‑agnostic “universal landing format”)

### 2.1 Internal (ERP/CRM)

Minimum recommended CSVs (templates):
- **Customers.csv**: customer_id, name, industry (if available), location, etc.
- **Orders.csv**: order_id, order_date, customer_id, order_revenue, gross_margin (or revenue + COGS)
- *(Optional)* **OrderLines.csv**: order_id, product_id, product_category, line_revenue

Optional but high value:
- Payment behavior (days-to-pay)
- Returns/credits
- Sales rep ownership
- Quote/win data from CRM

### 2.2 External (for look‑alikes)

Primary sources (API-driven where possible):
- **Apollo.io** (companies + people + filters)
- **LinkedIn / Sales Navigator** (firmographics + headcount growth signals)
- **D&B Hoovers** or industrial datasets (NAICS/SIC, corporate hierarchies)
- Optional: company websites/news feeds (growth signals)

We treat external sources as **enrichment + candidate generation**; internal ERP is still the “truth” for what good looks like.

---

## 3) Step-by-step: How we identify Top 20% customers

### 3.1 Define the “value metric” (profitability)

Preferred (best):
- **Gross Margin $** over last 12–36 months

If margin isn’t available yet:
- Revenue $ (proxy)
- Repeat rate / order frequency
- Consistency (months active)
- Category breadth (product mix)

### 3.2 Compute customer rollups
For each customer_id we calculate:
- Total revenue (period)
- Total margin (period)
- Margin %
- Order frequency (orders / month)
- Recency (days since last order)
- Consistency (active months / total months)
- Category breadth (# categories purchased)

### 3.3 Select Top 20%
Common implementations:
- Sort customers by **Total Gross Margin** descending → take top 20% count
- Or take customers contributing to top 80% of margin (Pareto)

### 3.4 Create “labels” for ML
We label customers to train models:
- **Best (1)**: Top 20%
- **Not-best (0)**: Others

This becomes training data for: *propensity* and *similarity* modeling.

---

## 4) Step-by-step: How we extract ICP traits (the “why”)

We build an **ICP Trait Model** that is both:
- **Human readable** (CEO / Sales can understand)
- **Machine usable** (AI/ML can score look‑alikes)

### 4.1 Trait categories

**Firmographic traits (external + internal):**
- Industry (NAICS/SIC)
- Company size (employees, revenue)
- Geography (region, proximity to branches)

**Behavioral traits (internal ERP):**
- Order frequency
- Consistency
- Category expansion patterns (cross-sell behavior)

**Financial traits (internal ERP):**
- Margin profile
- AOV (average order value)
- Payment behavior

**Operational traits (mixed):**
- Lead-time sensitivity (if available)
- Ship-to locations / facility count
- Contract / EDI usage (if available)

### 4.2 Methods to find the patterns

We use a combination of simple analytics + AI/ML so it’s robust:

1) **Descriptive analytics (fast, explainable)**
- Compare Top 20% vs everyone else for each feature
- Produce “lift” metrics (e.g., Top 20% are 2.4× more likely to be in NAICS X)

2) **Segmentation / clustering (optional)**
- Cluster top accounts into 2–5 archetypes (e.g., “High-frequency MRO buyers”, “Large project buyers”)
- Each archetype gets its own ICP definition + messaging angle

3) **Feature importance (predictive modeling)**
- Train a simple model to predict “Best customer” label
- Use feature importance / SHAP to explain drivers

**Key output:** a short list of the strongest ICP traits + reasons.

---

## 5) The Differentiator: AI/ML Look‑Alike Targeting

This is where you “separate yourselves.”

### 5.1 Look‑alike problem framing

We want to find companies that look like our best customers, but are:
- **Inactive / Win‑Back**: exist in ERP/CRM but not ordering recently
- **Strategic Net‑New**: not customers yet

### 5.2 Candidate Generation (create a pool to rank)

We generate a candidate list from multiple sources:

**A) Internal inactive pool (Win‑Back)**
- All customers with `days_since_last_order > X`
- Filter to historically valuable: past margin, broad mix, good payment

**B) External prospect pool (Strategic)**
- Use Apollo / LinkedIn / D&B filters derived from ICP traits
- Retrieve: company list + firmographics + domains
- Exclude current customers (by domain/name matching)

### 5.3 Scoring / Ranking (AI/ML)

We recommend a 2-score approach (simple + powerful):

#### Score 1 — Similarity Score (Look‑alike fit)
Measures: “How close is this company to the profile of Best Customers?”

Implementation options:
- **Rules + weighted traits** (fast MVP)
- **ML classifier** trained on Top20 vs others (stronger)
- **Similarity search** (kNN) using normalized firmographic + behavioral features
- **Embeddings** (optional) from company descriptions / NAICS text (advanced)

#### Score 2 — Opportunity / Intent Score (likelihood to buy now)
Signals include:
- Headcount growth
- Hiring
- Recent expansion news
- Technology stack changes
- Recency of engagement (for inactive customers)
- Sales team notes / CRM signals

Final ranking = `SimilarityScore * w1 + OpportunityScore * w2`.

### 5.4 Explainability (critical for trust)
Every recommended target should have “reason codes”, e.g.:
- “Matches ICP: NAICS 333xxx, 200–500 employees, Midwest footprint”
- “Similar to Best Customer: ABC Manufacturing (92% similarity)”
- “Growth signal: hiring +15 roles; opened new facility”

This is what makes sales leadership adopt the list.

---

## 6) Detailed Phase 3 Data Flow Diagram (Mermaid)

Copy/paste this into Mermaid tools:

```mermaid
flowchart TB
  subgraph IN[Inputs]
    ERP[ERP/CRM Data\nCustomers, Orders, Order Lines]
    EXT[External Data\nApollo, LinkedIn, DnB, Web Signals]
  end

  subgraph FE[Feature Engineering]
    ROLLUP[Customer rollups\nRevenue, Margin, Frequency, Recency, Mix]
    CLEAN[Normalize & match entities\nCompany name, domain, dedupe]
  end

  subgraph TOP20[Best Customer Identification]
    TOP[Select Top 20%\nby Gross Margin (or proxy)]
    LABEL[Label data\nBest=1, Others=0]
  end

  subgraph ICP[ICP Trait Model]
    TRAITS[Find ICP traits\nLift tables, archetypes, drivers]
    ARCH[Optional archetypes\n2-5 best-customer clusters]
  end

  subgraph LOOK[Look-alike Targeting]
    CAND[Candidate generation\nInactive pool + external prospects]
    SIM[Similarity score\nRules/ML/kNN]
    OPP[Opportunity score\nIntent/growth signals]
    RANK[Ranked targets\nwith reason codes]
  end

  subgraph OUT[Outputs]
    LISTA[Tier A targets\n1st outreach]
    LISTB[Tier B targets\nnext]
    WIN[Win-back list\ninactive customers]
  end

  ERP --> ROLLUP --> TOP --> LABEL --> TRAITS
  ERP --> CLEAN
  EXT --> CLEAN --> CAND
  TRAITS --> CAND --> SIM --> RANK
  OPP --> RANK
  ARCH --> RANK
  RANK --> LISTA
  RANK --> LISTB
  RANK --> WIN
```

---

## 7) Roadmap (Phase 3 — detailed, build-ready)

Below is a build roadmap that starts ERP-agnostic (CSV) and grows to automation.

### Sprint 0 (2–3 days): Confirm data templates + sample exports
- Deliverable: agreed CSV templates + sample files from 1 client
- Output: data dictionary + mapping

### Sprint 1 (1 week): Top 20% engine (internal)
- Build customer rollups
- Compute Top 20% by margin (or proxy)
- Output: Top 20% list + dashboard/table

### Sprint 2 (1 week): ICP trait extraction (explainable)
- Lift analysis: Top20 vs rest
- Create 5–10 strongest traits
- Output: 1-page ICP summary + “reason codes”

### Sprint 3 (1–2 weeks): Look‑alike candidate generation (external)
- Translate ICP into Apollo/LinkedIn filters
- Pull companies + firmographics
- Entity matching + dedupe + exclude customers
- Output: candidate list (hundreds/thousands)

### Sprint 4 (1–2 weeks): Ranking model (Similarity + Opportunity)
- MVP: weighted rules + thresholds
- Optional: train ML classifier (Top20 label)
- Add opportunity signals
- Output: ranked list + explainability text

### Sprint 5 (1 week): Operationalization + handoff
- Export formats for outreach tools
- “Reason codes” included with each target
- QA checks + stakeholder review
- Output: production-ready target list

### Sprint 6+ (ongoing): Continuous learning loop
- Track outreach outcomes
- Calibrate ranking model based on responses
- Improve templates, filters, and signals

---

## 8) What to show funders (quick wins)

If you want to accelerate buy-in, show these 3 artifacts:

1) **Top 20% list** (real margin/frequency numbers)
2) **ICP trait summary** (5–10 bullet traits, with lift)
3) **Look‑alike ranked list** with *reason codes* and *sample targets*

That demonstrates the “engine” clearly without needing full product UI.
