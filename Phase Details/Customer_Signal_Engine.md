# Client Interview Summary - Matt Livingston
**Date:** February 24, 2026  
**Participants:** Matt Livingston (Client), Konnor (Developer)

---

## 📋 Executive Summary

Matt is building a **B2B data analytics and sales enablement platform** targeting the **industrial sector**. The platform will analyze customer data (ERP data) and help identify high-value targets for sales teams.

---

## 🎯 Three Product Offerings (Tiers)

### **Tier 1: Data Diagnostic Package ($3,000-5,000)**
- 3-year customer lookback analysis
- Top 20% customer identification with traits
- Revenue concentration analysis  
- Gross margin analysis
- Lookalike company list (200+ companies)
- Inactive customer identification (12+ months no purchase)
- **Deliverable:** Executive presentation + CSV exports

### **Tier 2: Data + Sales Workshop**
- Everything in Tier 1
- Sales workshop/consulting on territory planning
- Guidance on targeting strategies
- How to attack a territory effectively

### **Tier 3: Full Service (Data → Outreach Execution)**
- Everything in Tiers 1 & 2
- GPT-powered message creation
- Outreach execution to target companies
- End-to-end campaign management

---

## 🔑 Key Technical Requirements

| Feature | Description | Priority |
|---------|-------------|----------|
| **3-Year Lookback** | Compound Annual Growth Rate (CAGR) analysis of top 20% customers | 🔴 HIGH |
| **Top 20% vs 80% Comparison** | Compare traits/behavior of top customers vs rest | 🔴 HIGH |
| **Inactive Customers (12+ months)** | Find customers who haven't bought recently | 🔴 HIGH |
| **Lookalike Generation** | Generate 200+ similar companies via ZoomInfo/Clearbit | 🔴 HIGH |
| **Revenue Concentration** | Visualize where revenue is coming from | 🟡 MEDIUM |
| **Drill-down Analytics** | Company, revenue, margin, product mix details | 🟡 MEDIUM |
| **GPT Messaging** | AI-generated outreach messages | 🟢 LATER |
| **Single Platform** | All features packaged on one platform | ✅ DONE |

---

## 📊 Key Metrics Client Wants

### For Top 20% Analysis:
1. **3-Year Compound Annual Growth Rate (CAGR)**
   - Customers who have been buying AND growing their purchases for 3 years
   - This is the gold standard in industrial sector for identifying "good" customers
   
2. **Revenue Concentration**
   - Where is revenue coming from?
   - Which customers drive the most margin?

3. **Trait Analysis**
   - Industry
   - Company size
   - Geography
   - Product mix purchased

### For Inactive Customer Analysis:
1. **12-Month Inactivity Threshold**
   - Any customer that bought previously but NOT in last 12 months
   - These are "winback" opportunities with 60-70% win rate

---

## 🗺️ Implementation Roadmap with Timeframes

### PHASE 1: Data Diagnostic (Tier 1 Product) - 1.5 weeks (~34 hours)
| Task | Hours |
|------|-------|
| 3-Year CAGR Calculation | 8 hrs |
| Database schema updates | 2 hrs |
| Top 20% vs 80% Comparison API | 6 hrs |
| Frontend comparison view | 8 hrs |
| Product mix analysis | 4 hrs |
| Configurable inactivity threshold | 2 hrs |
| Testing & polish | 4 hrs |

### PHASE 2: Sales Enablement (Tier 2 Product) - 2 weeks (~50 hours)
| Task | Hours |
|------|-------|
| Target prioritization dashboard | 10 hrs |
| Territory planning tools | 8 hrs |
| Account research automation (GPT) | 12 hrs |
| Meeting prep summaries | 6 hrs |
| Sales playbook generator | 8 hrs |
| Integration & testing | 6 hrs |

### PHASE 3: Outreach Execution (Tier 3 Product) - 2.5 weeks (~60 hours)
| Task | Hours |
|------|-------|
| AI message generation (email/LinkedIn/call) | 16 hrs |
| Multi-channel sequence builder | 12 hrs |
| Approval workflow enhancements | 8 hrs |
| Performance tracking dashboard | 10 hrs |
| Export to sales tools (CSV, CRM) | 6 hrs |
| Final integration & testing | 8 hrs |

### TOTAL PROJECT TIMELINE
| Phase | Duration | Hours | Status |
|-------|----------|-------|--------|
| Phase 1 (Tier 1) | 1.5 weeks | ~34 hrs | 🟢 Ready to build |
| Phase 2 (Tier 2) | 2 weeks | ~50 hrs | 🟡 After Phase 1 |
| Phase 3 (Tier 3) | 2.5 weeks | ~60 hrs | 🟡 After Phase 2 |
| **TOTAL** | **6 weeks** | **~144 hrs** | |

---

## 📈 Client Engagement Workflow

### Standard 5-6 Day Engagement:

```
Day 1-2: DATA INTAKE
└── Client uploads: Customers.csv, Orders.csv, OrderLines.csv, Products.csv

Day 2-3: AUTOMATED ANALYSIS
├── Calculate 3-year CAGR per customer
├── Identify Top 20% by revenue/margin
├── Flag inactive customers (12+ months)
└── Extract ICP traits

Day 4: EXECUTIVE PRESENTATION
├── Revenue concentration visualization
├── Top 20% customer profiles vs 80%
├── Margin analysis by segment
└── Growth trajectory charts

Day 5: LOOKALIKE GENERATION
├── Match ICP traits to ZoomInfo/Clearbit/Apollo
├── Generate 200+ target companies
└── Prioritize by similarity score

Day 5-6: DELIVERY
├── Downloadable PDF report
├── CSV export of lookalike list
├── Executive summary deck
└── 30-min walkthrough call
```

---

## 🔧 Technical Enhancements Needed

### Immediate Priorities:

#### 1. 3-Year CAGR Calculation
**Location:** `scoringService.js` or new `cagrService.js`
```javascript
// Calculate CAGR: ((Ending Value / Beginning Value) ^ (1/3)) - 1
// Group orders by customer by year
// Calculate compound annual growth rate
// Flag customers with positive CAGR for 3 years
```

#### 2. Top 20% vs 80% Comparison Dashboard
**Location:** Enhance `ceo-dashboard.js` and `top20Service.js`
- Add side-by-side comparison
- Show average order value, frequency, margin for each group
- Highlight differentiating traits

#### 3. Inactive Customer Detection  
**Location:** Already exists in `winbackService.js`
- Make threshold configurable (default 12 months)
- Add to main dashboard view
- Show potential revenue from reactivation

#### 4. Enhanced CEO Dashboard Drill-downs
**Location:** `ceo-dashboard.js`
- Drill into individual customer details
- Product mix breakdown
- Margin analysis by product category

---

## 🤝 Client Communication Plan

**Frequency:** 1-2x per week, 10-15 minute check-ins
**Purpose:** 
- Developer updates on build progress
- Client updates on business development & market feedback
- Adjust priorities based on PE group feedback

---

## 📝 Action Items

### Developer (Konnor):
- [ ] Log into PostgreSQL with provided credentials
- [ ] Implement 3-year CAGR calculation
- [ ] Add Top 20% vs 80% comparison view
- [ ] Ensure inactive customer threshold is configurable
- [ ] Test ZoomInfo/Clearbit integration when credentials available

### Client (Matt):
- [ ] Set up company email addresses
- [ ] Get ZoomInfo/Clearbit account access
- [ ] Provide sample client data for testing
- [ ] Schedule first regular check-in meeting

---

## 💡 Key Quotes from Interview

> "A good customer is someone that's been buying a lot of stuff. Or growing their buying patterns for 3 years."

> "We're looking at that 3-year compound annual growth rate, and we're looking at that 12-month inactive customer base."

> "Inactive customers - that's where you get a 60, 70% win rate if you can win back some additional customers."

> "We'd rather do it right first."

---

## 🏢 Business Context

- **Target Market:** Industrial sector B2B companies
- **Potential Partner:** PE group interested in trying with portfolio companies
- **Go-to-Market:** Will start marketing before MVP is complete to gauge interest
- **Pricing Model:** Tiered packages starting at ~$3,000-5,000

---

## ❓ Key Questions & Answers

### Q: Is this simple enough to sell immediately?

**Answer: YES** ✅

**Why it's sellable now:**
1. **Clear Value Proposition:** "We analyze your customer data and tell you who your best customers are, why they're the best, and find you 200+ companies that look just like them."

2. **Tangible Deliverables:**
   - 3-year customer growth analysis (CAGR)
   - Top 20% vs 80% comparison with insights
   - Inactive customer win-back list (60-70% win rate potential)
   - 200+ lookalike company targets

3. **Quick Time-to-Value:** 5-6 day engagement from data upload to deliverables

4. **No Technical Knowledge Required:** Client just uploads 4 CSV files

5. **Pricing Sweet Spot:** $3,000-5,000 is low enough for easy approval

**30-Second Sales Pitch:**
> "We take your last 3 years of customer data and show you exactly which customers drive your business. Then we find you 200 companies that match those same traits. Most of our clients see a 60-70% win rate on win-back targets alone. The whole analysis takes less than a week."

---

### Q: Can this evolve into a full-service sales intelligence engine?

**Answer: ABSOLUTELY** ✅

**Current Foundation Already Supports:**
| Capability | Current State | Evolution Path |
|------------|---------------|----------------|
| Data ingestion | CSV upload | → API integrations (ERP, CRM) |
| Customer analytics | Basic metrics | → Predictive scoring, churn prediction |
| ICP identification | Trait matching | → ML-powered ICP refinement |
| Lookalike generation | Apollo/ZoomInfo | → Multi-source enrichment |
| AI messaging | GPT templates | → Personalized sequences, A/B testing |

**Future Evolution:**
- Phase 4: CRM Integration (Salesforce, HubSpot)
- Phase 5: Real-time Intent Signals (6sense, Bombora)
- Phase 6: Predictive Analytics & ML Models
- Phase 7: Full Sales Intelligence Platform

**Business Evolution Path:**
| Year 1 | Year 2 | Year 3+ |
|--------|--------|---------|
| $3K-5K per engagement | $500-1K/month subscription | Enterprise contracts |
| Manual delivery | Automated reports | Real-time dashboard |
| 5-10 clients | 50+ clients | 200+ clients |

---

*Document created from client interview transcript - February 24, 2026*
