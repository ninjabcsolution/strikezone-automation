# CEO Version — PPT Guide (Explain Each Value + Why We Need It)

This guide helps you create a CEO-ready PowerPoint that explains **what each metric means**, **why it matters**, and **what action it drives**.

**Audience:** CEO only  
**Primary outcome:** Retention & profit protection (reduce churn risk in the accounts that fund the business)  
**Data source language:** ERP-neutral (no vendor-specific references)

It also answers: **“Can we add more drill-down options later?”** → **Yes** (see the last section).

---

## How to Use This Guide

1) Refresh your Power BI CEO report (Phase 0 / CEO version).  
2) Export visuals or pages to PowerPoint (or screenshot at high resolution).  
3) Use the slide outline below. Replace example numbers with your live values.

**CEO rule:** one idea per slide, and always end with a “So what / Action”.

---

## Recommended Deck Length

### 10-slide core deck (best for execs)
- Slides 1–10 below.

### Optional appendix
- Add 3–6 appendix slides for definitions / methodology / data caveats.

---

# Slide-by-Slide Outline (Core Deck)

## Slide 1 — Title / Why We Built This (Retention Narrative)
**Slide Title:** Strikezone Customer Intelligence from ERP Data  
**What you show:** Cover page + simple flow: ERP → Metrics → Decisions.

**Key message (1 sentence):**
We can identify the customers who fund the business and protect them with a measurable retention plan.

**Why this slide exists:**
Sets context: this is not “analytics for analytics”, it’s a GTM decision engine.

**Action:**
Align on a retention-first operating view: protect elite customers first.

---

## Slide 2 — Executive Summary (The One Metric That Matters)
**Slide Title:** Profit Concentration (Pareto Effect)

**What you show (from Page 1):**
Hero metric: **Top 20% Customers → X% of Gross Margin**.

**What it means:**
Top 20% customers (ranked by gross margin) generate **X%** of total gross margin.

**Why we need it:**
Shows where profit actually comes from—retention focus should match this concentration.

**Action:**
Create an “Elite Customer” retention program (service tiering + executive sponsorship + QBR cadence).

---

## Slide 3 — Revenue vs Gross Margin (Protect Profit, Not Just Volume)
**Slide Title:** Revenue Is Not Profit

**What you show:**
- Total Revenue
- Total Gross Margin
- Gross Margin %

**Definitions (plain English):**
- **Revenue:** total sales dollars.
- **Gross Margin:** profit after direct costs (COGS).
- **Gross Margin %:** margin divided by revenue.

**Why we need it:**
Revenue can mask risk. Margin dollars fund the company. Retention decisions should prioritize margin contribution.

**Action:**
Use gross margin contribution as the primary “account criticality” signal.

---

## Slide 4 — Who Are the Elite Customers? (The Accounts to Protect)
**Slide Title:** The Elite Customer List

**What you show (from Page 2):**
Top 10–25 customers by gross margin + columns: revenue, margin, margin %, orders, AOV.

**Why we need it:**
Turns the Pareto number into named accounts the exec team can act on.

**Action:**
Assign exec sponsor + QBR cadence + retention plan owners to top accounts.

---

## Slide 5 — Elite Premium (Why Losing One Elite Account Hurts)
**Slide Title:** Elite Customers Are Economically Different

**What you show:**
- Avg gross margin per elite customer vs other customers
- A “multiplier” (e.g., 4.2×)

**Why we need it:**
Quantifies risk: losing one elite account can equal losing many average accounts.

**Action:**
Create tiers (A/B/C). Put stronger retention controls and service guarantees on Tier A.

---

(Continued in next section)

---

## Slide 6 — Behavior: Frequency & Consistency (Early Warning Signals)
**Slide Title:** Elite Customer Behavior (Frequency)

**What you show:**
- Orders per customer (elite vs others)
- (Optional) trend of monthly orders for elite tier

**What it means:**
Elite customers typically order **more often** and **more consistently**.

**Why we need it:**
Explains *how* margin is produced (repeat behavior beats one-time big deals).

**Action:**
Define “account health” leading indicators (recency + frequency) and trigger retention outreach when they degrade.

---

## Slide 7 — Product Mix Breadth (Stickiness & Switching Cost)
**Slide Title:** Product Mix = Stickiness

**What you show:**
- Categories purchased (elite vs others)
- Donut: product mix for elite vs others

**What it means:**
If elite customers buy across more categories, they’re more embedded and harder to replace.

**Why we need it:**
Product breadth is a strong indicator of retention and expansion potential.

**Action:**
Use product breadth to set retention priority and expansion actions (cross-sell reduces churn risk).

---

## Slide 8 — What “Good” Looks Like (Retention Lens)
**Slide Title:** ICP = Data, Not Opinion

**What you show:**
- Top industries by margin (elite)
- Top states (elite)
- (Optional) scatter: margin % vs order count

**What it means:**
The ICP is derived from the customers who actually drive profit.

**Why we need it:**
This replaces “gut feel” targeting with evidence-based targeting.

**Action:**
Align retention playbooks to the traits that correlate with high margin + repeat behavior.

---

## Slide 9 — Key Findings Summary (Dynamic Narrative)
**Slide Title:** Key Findings (Auto-Updates)

**What you show:**
Your dynamic Key Findings page bullets (KF01–KF06).  

**What it means:**
The narrative is generated from DAX measures, so it updates when data refreshes.

**Why we need it:**
Stops the “stale slide deck” problem. Leadership can trust the dashboard.

**Action:**
Use this slide as the “exec recap” and the dashboard as the live source of truth.

---

## Slide 10 — What This Enables (Retention Operating System)
**Slide Title:** Dashboard → Revenue System

**What you show:**
A simple 3-step retention roadmap:
1) Identify elite customers (Top 20%)
2) Define early warning signals (recency, frequency, breadth)
3) Operationalize retention actions (QBRs, exec sponsorship, tiered service)

**Why we need it:**
Connects metrics to operating rhythm: targeting, outreach, pipeline.

**Action:**
Approve Phase 1 completion → proceed into automation for ongoing retention health and alerts.

---

# Appendix Slides (Optional)

## Appendix A — Metric Definitions (Simple)
Use this slide if the CEO asks “how is that calculated?”

- **Revenue** = sum(order_revenue)
- **Gross Margin** = sum(gross_margin) (or revenue − cogs)
- **Gross Margin %** = margin / revenue
- **Top 20%** = customers ranked by gross margin; top N = 20% of customer count
- **Orders per Customer** = total orders / customer count
- **Categories Purchased** = distinct product categories purchased

## Appendix B — Data Trust / QA
- Missing values detection
- Duplicate ID detection
- Date format validation
- Ingestion logs (who uploaded what, when)

## Appendix C — Assumptions & Caveats
- Margin accuracy depends on COGS / gross_margin correctness in ERP export.
- Credit memos/returns handling may change true margin.
- Parent/child customer rollups may change “top customer” rankings.

---

# Export Power BI → PowerPoint (Fast)

## Option 1 — Export from Power BI Service (recommended)
1. Publish report to Power BI Service
2. Open report → **File → Export → PowerPoint (.pptx)**
3. Choose “Embed live data” if your tenant supports it

## Option 2 — Screenshot (best design fidelity)
1. Power BI Desktop → View → Page view: Fit to width
2. Take 1920×1080 screenshot for each page
3. Paste into PPT and set image to full slide

---

# Drill-Down: Can We Add More Options Later?

**Yes.** As the model evolves you can add drill-down without breaking the CEO view.

## 1) Drill-down hierarchies in charts
Example: Industry → NAICS → Customer.
- Put a hierarchy on the axis
- Enable drill buttons

## 2) Drill-through pages (best pattern)
Create a “Customer Detail” page:
- Drill-through field: `customer_id` (or customer_name)
- Show: margin trend, order history, product mix, recency

## 3) Report tooltips
Hover on a customer bar → tooltip shows mini KPIs (margin %, AOV, frequency).

## 4) Decomposition Tree
Answer: “What drives margin?”
- Start with Gross Margin → break down by Industry, State, Category.

**Best practice:** Keep Page 1–2 simple; hide drill complexity behind clicks on Page 3+.

---

# Tailored Mode
This document is already tailored for:
- CEO only
- Retention-focused
- ERP-neutral
