# MVP Daily Reports - 6 Week Plan
**Project:** Customer Signal Engine (Strikezone)  
**Start Date:** Day 4 (Days 1-3 completed)  
**Total Duration:** 6 weeks (~30 working days)

---

## Week 1: Upload Pipeline + Customer Metrics
*(Days 1-3 already completed)*

### Day 4 — Upload UI Enhancement
- [ ] Ensure the upload UI supports drag/drop + browse
- [ ] Display: detected file type, rows processed, rows inserted, rows failed
- [ ] Display: validation errors (first 10 + "X more…") and QA missing-values summary
- [ ] Add "Upload another file" / reset flow
- [ ] Confirm UI works for all 4 CSVs in order (Customers → Products → Orders → OrderLines)

### Day 5 — Customer Metrics Engine
- [ ] Review `top20Service.js` calculateCustomerMetrics logic
- [ ] Verify: total_revenue, total_gross_margin, order_count calculations are accurate
- [ ] Confirm percentile ranking (is_top_20 flag) works correctly
- [ ] Test with sample data: verify top 20% calculation matches manual check
- [ ] Document customer metrics formula for client review

---

## Week 2: 3-Year CAGR Implementation

### Day 6 — CAGR Database Schema
- [ ] Add new columns to customer_metrics table:
  - revenue_year_1, revenue_year_2, revenue_year_3
  - cagr_3yr, is_consistent_grower
- [ ] Run schema migration on dev database
- [ ] Verify columns are properly indexed
- [ ] Create rollback script if needed
- [ ] Test schema changes don't break existing queries

### Day 7 — CAGR Calculation Logic (Part 1)
- [ ] Create yearly revenue aggregation query (group orders by year)
- [ ] Implement CAGR formula: ((Year3/Year1)^(1/3)) - 1
- [ ] Handle edge cases: Year1 = 0, missing years, negative values
- [ ] Add `is_consistent_grower` flag (Year3 > Year2 > Year1)
- [ ] Unit test CAGR calculation with known values

### Day 8 — CAGR Calculation Logic (Part 2)
- [ ] Integrate CAGR into `top20Service.js`
- [ ] Add `calculateYearlyMetrics()` method
- [ ] Update `calculateCustomerMetrics()` to include CAGR
- [ ] Test full pipeline: upload → metrics → CAGR
- [ ] Verify CAGR values in database match expected results

### Day 9 — CAGR API Endpoint
- [ ] Create `/api/analytics/cagr-analysis` endpoint
- [ ] Return: customers with CAGR data, summary stats
- [ ] Add filtering: top 20% only, consistent growers only
- [ ] Add sorting: by CAGR, by revenue, by margin
- [ ] Document API response format

### Day 10 — CAGR Testing & Edge Cases
- [ ] Test with minimal data (1 year only)
- [ ] Test with 3 full years of data
- [ ] Test with gaps in data
- [ ] Verify performance with large dataset
- [ ] Fix any bugs found during testing

---

## Week 3: Top 20% vs 80% Comparison

### Day 11 — Comparison API Backend
- [ ] Create `/api/analytics/top20-comparison` endpoint
- [ ] Calculate aggregates for Top 20%: count, revenue, margin, avg order value
- [ ] Calculate same aggregates for Others (80%)
- [ ] Calculate ratios/multipliers between groups
- [ ] Return structured comparison response

### Day 12 — Trait Distribution Comparison
- [ ] Add industry distribution for Top 20% vs Others
- [ ] Add state/region distribution for Top 20% vs Others
- [ ] Add product category distribution for Top 20% vs Others
- [ ] Calculate "lift" for each trait (how much more common in Top 20%)
- [ ] Add to comparison API response

### Day 13 — Differentiator Generation
- [ ] Create logic to auto-generate differentiator statements
- [ ] Example: "Top 20% have 3.2x higher avg order value"
- [ ] Example: "Manufacturing represents 45% of Top 20% vs 23% of others"
- [ ] Return top 5 differentiators in API response
- [ ] Test with sample data

### Day 14 — Comparison Frontend (Part 1)
- [ ] Add comparison section to CEO Dashboard
- [ ] Create side-by-side metric cards (Top 20% vs Others)
- [ ] Style cards with green/red indicators for differences
- [ ] Add loading states and error handling
- [ ] Test responsive design

### Day 15 — Comparison Frontend (Part 2)
- [ ] Add bar charts for visual comparison (Chart.js or Recharts)
- [ ] Add trait distribution comparison table
- [ ] Display auto-generated differentiators
- [ ] Add toggle: compare by Margin vs CAGR
- [ ] QA full comparison view

---

## Week 4: ICP & Lookalike Refinement

### Day 16 — ICP Lift Analysis Review
- [ ] Review existing `icpTraitsService.js` implementation
- [ ] Verify lift calculation is accurate
- [ ] Test trait extraction with real sample data
- [ ] Ensure all trait categories are captured (industry, state, naics, product)
- [ ] Document ICP methodology for client

### Day 17 — ICP by CAGR Segment
- [ ] Add option to calculate ICP traits using CAGR-based Top 20%
- [ ] Create parameter: `rankBy: 'margin' | 'cagr'`
- [ ] Re-run ICP traits with CAGR ranking
- [ ] Compare ICP results: margin-based vs CAGR-based
- [ ] Document differences for client insight

### Day 18 — ICP Dashboard Enhancements
- [ ] Update ICP Dashboard to show lift scores
- [ ] Add visual indicators for high-lift traits
- [ ] Add export ICP traits to CSV
- [ ] Add "Why this trait matters" tooltips
- [ ] QA dashboard with sample data

### Day 19 — Lookalike Generation Review
- [ ] Review `lookalikeGenerationService.js` implementation
- [ ] Verify ICP-based matching logic is correct
- [ ] Test Apollo/ZoomInfo API integration (mock if no creds)
- [ ] Confirm lookalike targets are stored correctly
- [ ] Document lookalike generation process

### Day 20 — Lookalike Scoring Refinement
- [ ] Review `scoringService.js` similarity scoring
- [ ] Verify weights: industry (35%), geo (20%), size (25%), revenue (20%)
- [ ] Test scoring with sample lookalike targets
- [ ] Add CAGR-based traits to scoring (if applicable)
- [ ] QA full lookalike pipeline

---

## Week 5: Winback & Approval Workflow

### Day 21 — Winback Service Enhancement
- [ ] Review `winbackService.js` implementation
- [ ] Make inactivity threshold configurable (default 365 days)
- [ ] Add parameter to API: `inactiveDays`
- [ ] Test winback generation with different thresholds
- [ ] Add "potential revenue from reactivation" estimate

### Day 22 — Winback Dashboard Integration
- [ ] Add winback section to CEO Dashboard
- [ ] Display inactive customer count and total historical value
- [ ] Add slider to adjust inactivity threshold
- [ ] Show top winback opportunities by historical margin
- [ ] QA winback display

### Day 23 — Approval Portal Review
- [ ] Review `approval-portal.js` functionality
- [ ] Verify target status flow: pending → approved/rejected
- [ ] Test bulk approve/reject actions
- [ ] Confirm audit logging works for all actions
- [ ] Document approval workflow for client

### Day 24 — Target Export Enhancement
- [ ] Verify CSV export includes all relevant fields
- [ ] Add CAGR data to export (if from customer data)
- [ ] Add ICP match score to export
- [ ] Test export with large dataset
- [ ] Document export file format

### Day 25 — End-to-End QA (Part 1)
- [ ] Full pipeline test: Upload → Metrics → CAGR → ICP → Lookalike
- [ ] Verify data flows correctly through all stages
- [ ] Check for data loss or corruption
- [ ] Performance test with realistic data volume
- [ ] Document any issues found

---

## Week 6: Polish, Testing & Demo Prep

### Day 26 — End-to-End QA (Part 2)
- [ ] Test all frontend pages for bugs
- [ ] Verify authentication flows work correctly
- [ ] Test error handling throughout app
- [ ] Mobile responsiveness check (if needed)
- [ ] Fix critical bugs found

### Day 27 — Bug Fixes & Polish
- [ ] Address all P1 bugs from QA
- [ ] Improve loading states and error messages
- [ ] Add helpful tooltips where needed
- [ ] Clean up console logs and debug code
- [ ] Code cleanup and comments

### Day 28 — Documentation Update
- [ ] Update README with current features
- [ ] Update GETTING_STARTED guide
- [ ] Document API endpoints for future reference
- [ ] Create "How to run a client analysis" guide
- [ ] Update deployment instructions

### Day 29 — Demo Preparation
- [ ] Prepare sample data for demo
- [ ] Create demo script/walkthrough
- [ ] Test demo flow end-to-end
- [ ] Prepare talking points for each feature
- [ ] Record backup screenshots/video if needed

### Day 30 — MVP Launch Ready
- [ ] Final sanity check on all features
- [ ] Confirm deployment to demo environment
- [ ] Share access with client for review
- [ ] Prepare list of Phase 2 features (future roadmap)
- [ ] **MVP COMPLETE** 🎉

---

## Summary Timeline

| Week | Focus Area | Key Deliverables |
|------|------------|------------------|
| Week 1 | Upload + Metrics | ✅ Data pipeline working |
| Week 2 | 3-Year CAGR | CAGR calculation + API |
| Week 3 | Top 20% vs 80% | Comparison dashboard |
| Week 4 | ICP + Lookalike | Refined targeting engine |
| Week 5 | Winback + Approval | Full workflow complete |
| Week 6 | QA + Demo Prep | **MVP Launch Ready** |

---

## Progress Tracking

**Completed Days:** 3/30  
**Remaining Days:** 27  
**Current Status:** Week 1, Day 4

---

*Last Updated: February 24, 2026*
