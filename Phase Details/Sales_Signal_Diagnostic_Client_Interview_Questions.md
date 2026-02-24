# StrikeZone Sales Signal Diagnostic™ 
## Client Interview Guide

---

## Workflow Diagram

*Show this diagram to the client first to give them a visual overview:*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SALES SIGNAL DIAGNOSTIC WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │   CLIENT ERP     │
    │  (Dynamics, SAP, │
    │   QuickBooks,    │
    │   NetSuite, etc) │
    └────────┬─────────┘
             │
             │ Export 3 years of customer data
             ▼
    ┌──────────────────┐
    │   DATA UPLOAD    │  ←── CSV file: Customers, Orders, Revenue, Margin
    │   (Step 1)       │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  DATA VALIDATION │  ←── Quality checks: missing fields, duplicates, dates
    │   (Step 2)       │
    └────────┬─────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                         ANALYTICS ENGINE (Step 3)                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐        │
│   │ Revenue Quality │   │  Growth Signal  │   │ Stability Score │        │
│   │    Ranking      │   │     (CAGR)      │   │                 │        │
│   │                 │   │                 │   │                 │        │
│   │  Top 20% by     │   │ Year-over-year  │   │ Order frequency │        │
│   │  gross margin   │   │ growth rate     │   │ & consistency   │        │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘        │
│                                                                            │
│   ┌─────────────────┐   ┌─────────────────┐                               │
│   │ Segment Ranking │   │ CIC Extraction  │                               │
│   │                 │   │                 │                               │
│   │  Tier A / B / C │   │ Industry, Size, │                               │
│   │  classification │   │ Location, Buying│                               │
│   │                 │   │ patterns        │                               │
│   └─────────────────┘   └─────────────────┘                               │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
             │
             ▼
    ┌──────────────────┐
    │    INSIGHTS      │  ←── High-Value Accounts, Growth Segments,
    │   (Step 4)       │      Target Priorities
    └────────┬─────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                       OUTPUT DELIVERABLES (Step 5)                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│   │  Executive  │  │  10-Slide   │  │    CIC      │  │  HVT-Ready  │     │
│   │  PDF Summary│  │ Insight Deck│  │  Targeting  │  │  Data File  │     │
│   │             │  │             │  │    Brief    │  │             │     │
│   │  1-page for │  │ Presentation│  │ Sales cheat │  │ CSV/Excel   │     │
│   │  the CEO    │  │  ready      │  │   sheet     │  │ for CRM     │     │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
             │
             ▼
    ┌──────────────────┐
    │     HUMAN        │  ←── Executive Readout + Sales Alignment Workshop
    │  INTERPRETATION  │
    │   (Step 6)       │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │              OPTIONAL EXPANSION PATH                                  │
    │  CIC → HVT → Look-alikes → Contact Enrichment → Outreach Execution   │
    └──────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Feature Walkthrough (Explain This First)

*Read this to the client to set context before asking questions:*

---

"Let me walk you through how the Sales Signal Diagnostic works, step by step.

**Step 1: Data Upload**
First, your client exports their customer data from their ERP system – things like customer names, order history, revenue, and margins over the past 3 years. They upload it as a simple CSV file into our platform.

**Step 2: Data Validation**
The system automatically checks the data quality. It looks for missing fields, bad dates, duplicates – anything that could cause problems. If there are issues, we flag them so they can be fixed before we run the analysis.

**Step 3: The Analytics Engine**
Here's where the magic happens. The system analyzes every customer and calculates several key metrics:
- **Revenue Quality Ranking** – Who are your most profitable customers? We identify the Top 20% that generate the most value.
- **Growth Signal (CAGR)** – Which customers are growing year over year, and which ones are declining? This helps you spot opportunity and risk.
- **Stability Score** – How consistent are they? Do they order regularly, or are they unpredictable? Stable customers are lower risk.
- **Segment Ranking** – We group customers into tiers: A, B, and C, based on their overall value.
- **CIC Extraction** – CIC stands for Customer ICP Characteristics. It's basically 'what do your best customers have in common?' – industry, size, location, buying patterns.

**Step 4: Insight Generation**
From that analysis, we generate insights like:
- Here are your High-Value Accounts
- Here are your Growth Segments – customers that are trending up
- Here are your Target Priorities – where should sales focus next?

**Step 5: Output Deliverables**
Then we package everything into professional deliverables:
- **Executive PDF Summary** – A one-page snapshot for the CEO
- **10-Slide Insight Deck** – A presentation-ready slide deck
- **CIC Targeting Brief** – A cheat sheet for sales to find look-alike prospects
- **HVT-Ready Data File** – A clean export of High Value Targets, ready to load into a CRM or outbound tool

**Step 6: Human Interpretation**
Finally, you or your team sit down with the client to walk through the findings. This is the 'Executive Readout' – explaining what the data means and aligning the sales team on priorities.

**Optional Next Steps**
After the diagnostic, if the client wants to take action, we can feed those insights into look-alike prospecting, contact enrichment, and automated outreach – but that's an expansion, not part of the core diagnostic.

Does that make sense so far? Great – now I have a few questions to make sure we build this exactly how you need it."

---

## Part 2: Key Questions (Max 5)

### Question 1: What makes a customer "high quality"?

"You mentioned Revenue Quality Ranking. In your mind, what makes a customer 'high quality'? Is it total revenue, profit margin, how often they order, or some combination of those? And is this different for different industries or clients?"

---

### Question 2: How should we calculate growth and stability?

"For the Growth Signal and Stability Score – can you describe what 'growing' and 'stable' look like in real terms? For example, if a customer's revenue goes up 15% year over year, is that 'growing'? And for stability, is it about how often they order, or how much their order amounts vary?"

---

### Question 3: What should the PDF and Slide Deck look like?

"For the Executive PDF and the 10-Slide Deck – do you have an example of a report or presentation style you love? Even from another tool or industry. What's the vibe you want? Clean and minimal? Data-heavy with lots of charts? Narrative with recommendations? And how should it be branded – your logo, the client's logo, or both?"

---

### Question 4: Who runs this, and how often?

"Workflow question – who actually runs this diagnostic? Is it your internal team doing it on behalf of clients, or do clients log in and run it themselves? And how often do you see clients using it – once a year? Quarterly? After every board meeting?"

---

### Question 5: What's the MVP priority?

"If we could only ship the first version in 2 weeks, what's the must-have? Is it the analytics engine with basic outputs? Or is the PDF summary the most important piece? Help me understand what you'd demo to a client first."

---

## After the Interview

Document these decisions:
- [ ] Revenue Quality ranking formula
- [ ] Growth threshold (what % = growing)
- [ ] Stability definition
- [ ] Output priorities (PDF vs Deck vs Data)
- [ ] MVP timeline and scope

---

## Quick Reference

| Term | Meaning |
|------|---------|
| CIC | Customer ICP Characteristics |
| HVT | High Value Targets |
| CAGR | Compound Annual Growth Rate |
| ICP | Ideal Customer Profile |

---

*Keep the interview conversational and under 30 minutes.*
