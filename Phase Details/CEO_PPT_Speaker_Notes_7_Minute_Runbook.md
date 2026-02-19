# CEO PPT Speaker Notes — 7 Minute Runbook (ERP-neutral, Retention-focused)

Use this as **speaker notes** while presenting. It’s designed for ~7 minutes total.

**How to fill in numbers:** Replace placeholders like `{TOP20_PCT}` with your live Power BI values.

---

## Slide 1 — Title: “Customer Profit Protection from ERP Data” (0:30)
**Show:** Title slide + 1 simple flow diagram: ERP → Dashboard → Retention decisions.

**Say:**
“This is a retention-first executive view built from ERP data. The goal is simple: identify the customers that fund the business and protect them with measurable signals—not gut feel.”

**Why it matters:**
Sets the frame: this is an operating tool, not just reporting.

**Ask/Action:**
“If we agree these are the right signals, we’ll operationalize them into a retention cadence.”

---

## Slide 2 — Visual: Hero Metric “Top 20% customers generate {TOP20_PCT}% of margin” (0:45)
**Show:** Page 1 hero metric (Top 20% GM contribution).

**Say:**
“The headline is profit concentration: the top {TOP20_COUNT} customers—about 20% of the base—generate {TOP20_PCT}% of gross margin. If we lose even a small number of these accounts, profit is impacted immediately.”

**Why it matters:**
Creates urgency for retention prioritization.

**Ask/Action:**
“We should treat these as Tier A accounts with an explicit retention plan.”

---

## Slide 3 — Visual: KPI strip (Revenue, Gross Margin, GM%, Customer Count) (0:35)
**Show:** Total Revenue `{TOTAL_REV}`, Total Gross Margin `{TOTAL_GM}`, GM% `{GM_PCT}`, Customer Count `{CUST_COUNT}`.

**Say:**
“These are the baseline business totals. I’m calling them out because our retention strategy should protect margin dollars, not just revenue volume.”

**Why it matters:**
Aligns the CEO on margin as the retention priority.

**Ask/Action:**
“We’ll use margin contribution as the primary ‘account criticality’ signal.”

---

## Slide 4 — Visual: Gross Margin Trend (line chart) (0:40)
**Show:** Margin trend chart (monthly).

**Say:**
“This trend shows how margin behaves over time. We use it to detect volatility early. When we see a dip, the next question is which Tier A account behavior changed first—did ordering slow, did product breadth shrink, did recency increase?”

**Why it matters:**
Moves from lagging reporting to early-warning management.

**Ask/Action:**
“We’ll add a retention health view so a dip immediately points to the at-risk Tier A accounts.”

---

## Slide 5 — Visual: Elite customer list (Top customers table) (0:55)
**Show:** Page 2 table of top customers by gross margin (Top 10–25).

**Say:**
“These are the accounts behind the Pareto effect—our Tier A list. The reason we show revenue, margin, margin %, orders, and AOV is to separate ‘big’ from ‘healthy’. This is the list we protect first.”

**Why it matters:**
Turns the executive insight into a named retention portfolio.

**Ask/Action:**
“Assign an exec sponsor, retention owner, and QBR cadence for the top {TOP20_COUNT} accounts.”

---

## Slide 6 — Visual: Elite premium / multiplier (0:40)
**Show:** Avg margin/customer Top 20% vs Other 80% and multiplier `{MARGIN_MULT}x`.

**Say:**
“Elite customers are economically different. On average, an elite customer produces about {ELITE_AVG_GM} margin vs {OTHER_AVG_GM} for the rest—roughly a {MARGIN_MULT}x premium. That’s why retention focus isn’t optional.”

**Why it matters:**
Quantifies the cost of churn among Tier A.

**Ask/Action:**
“Retention investment should be proportional to this premium: higher-touch service for Tier A.”

---

## Slide 7 — Visual: Order frequency / Orders per customer (0:40)
**Show:** Orders per customer (elite vs others) or frequency KPI.

**Say:**
“This is one of our best early warning signals. Elite accounts typically order more frequently and more consistently. If frequency drops or recency rises, that’s the moment to intervene—before margin declines show up in the totals.”

**Why it matters:**
Defines leading indicators for churn risk.

**Ask/Action:**
“We’ll monitor Tier A recency/frequency weekly and trigger outreach when it degrades.”

---

## Slide 8 — Visual: Product breadth (Categories purchased / product mix) (0:40)
**Show:** Categories purchased elite vs others, and/or product mix donuts.

**Say:**
“Product breadth is stickiness. Elite accounts typically buy across more categories, which raises switching costs. If breadth drops, it can signal consolidation to a competitor. We can use this both as a retention risk indicator and as an expansion lever.”

**Why it matters:**
Gives a concrete lever: cross-sell can reduce churn risk.

**Ask/Action:**
“For Tier A: watch breadth for contraction. For Tier B: run cross-sell plays to increase breadth and stickiness.”

---

## Slide 9 — Visual: ICP traits (industry + geography) (0:45)
**Show:** Top industries by margin (elite) + geographic concentration map.

**Say:**
“This view shows what ‘good’ looks like based on the profit-driving accounts: which industries and regions correlate with high-margin repeat behavior. Even for a retention-first story, it helps us build segment-specific service and retention playbooks.”

**Why it matters:**
Prevents generic retention approaches; enables segment-specific playbooks.

**Ask/Action:**
“We’ll build playbooks for the top 2–3 elite segments and standardize QBR agendas around their drivers.”

---

## Slide 10 — Visual: Key Findings Summary (dynamic bullets) + Close (0:40)
**Show:** Dynamic Key Findings Summary bullets (KF01–KF06) + short roadmap.

**Say:**
“These findings are dynamic: they update automatically as ERP data refreshes, so we’re not relying on a stale deck. The operating model is: protect Tier A, monitor early warning signals, and execute retention actions when the signals degrade.”

**Why it matters:**
Creates confidence that leadership can trust the system over time.

**Ask/Action (close):**
“Approve Phase 1 completion and we’ll operationalize Tier A retention cadence plus drill-through detail views for executive reviews.”

---

# Placeholder Values to Fill (from Power BI)
- `{TOP20_PCT}` = Top 20% GM Contribution %
- `{TOP20_COUNT}` = Top 20% Customer Count
- `{TOTAL_REV}` = Total Revenue
- `{TOTAL_GM}` = Total Gross Margin
- `{GM_PCT}` = Gross Margin %
- `{CUST_COUNT}` = Customer Count
- `{ELITE_AVG_GM}` = Top 20% Avg GM / Customer
- `{OTHER_AVG_GM}` = Other 80% Avg GM / Customer
- `{MARGIN_MULT}` = Elite Avg GM / Other Avg GM
