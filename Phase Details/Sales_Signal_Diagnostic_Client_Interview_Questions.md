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
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐          │
│   │ Revenue Quality │   │  Growth Signal  │   │ Stability Score │          │
│   │    Ranking      │   │     (CAGR)      │   │                 │          │
│   │                 │   │                 │   │                 │          │
│   │  Top 20% by     │   │ Year-over-year  │   │ Order frequency │          │
│   │  gross margin   │   │ growth rate     │   │ & consistency   │          │
│   └─────────────────┘   └─────────────────┘   └─────────────────┘          │
│                                                                            │
│   ┌─────────────────┐   ┌─────────────────┐                                │
│   │ Segment Ranking │   │ CIC Extraction  │                                │
│   │                 │   │                 │                                │
│   │  Tier A / B / C │   │ Industry, Size, │                                │
│   │  classification │   │ Location, Buying│                                │
│   │                 │   │ patterns        │                                │
│   └─────────────────┘   └─────────────────┘                                │
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
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │  Executive  │  │  10-Slide   │  │    CIC      │  │  HVT-Ready  │       │
│   │  PDF Summary│  │ Insight Deck│  │  Targeting  │  │  Data File  │       │
│   │             │  │             │  │    Brief    │  │             │       │
│   │  1-page for │  │ Presentation│  │ Sales cheat │  │ CSV/Excel   │       │
│   │  the CEO    │  │  ready      │  │   sheet     │  │ for CRM     │       │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
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
    │              OPTIONAL EXPANSION PATH                                 │
    │  CIC → HVT → Look-alikes → Contact Enrichment → Outreach Execution   │
    └──────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Quick Overview (Say This First)

*Give the client a brief summary before diving into questions:*

---

"Here's the Sales Signal Diagnostic in a nutshell: Your client uploads 3 years of customer data from their ERP, and our system analyzes it to find their best customers, who's growing, who's stable, and what traits they have in common. Then we package everything into professional deliverables – an executive PDF, a slide deck, and data files they can use for targeting. Finally, you walk them through the insights in a readout session. After that, they can optionally expand into look-alike prospecting and outreach automation."

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
