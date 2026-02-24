# StrikeZone Sales Signal Diagnostic™ 
## Client Discovery Interview Guide

**Purpose:** Gather requirements and clarify expectations for the Sales Signal Diagnostic feature  
**Duration:** 45-60 minutes  
**Participants:** Development Team, Product Owner, Client Stakeholders

---

## Opening (5 minutes)

*Start with a friendly introduction to set the tone.*

"Thanks so much for taking the time today! We're really excited about the Sales Signal Diagnostic feature. Based on the architecture diagram you shared, we want to make sure we fully understand your vision so we can build exactly what you need.

I have some questions that will help us nail down the details. Some might seem basic, but they'll help us avoid assumptions and make sure we're all on the same page. Sound good?"

---

## Section 1: Big Picture Understanding

### Q1. The Core Value Proposition
"Let's start with the big picture. In your own words, what problem does the Sales Signal Diagnostic solve for your clients? What's the main 'aha moment' you want them to have when they see the output?"

**Follow-up:** "If a client could only take away ONE insight from this diagnostic, what would it be?"

---

### Q2. Target Audience
"Who's the primary audience for these diagnostic reports? Is it the CEO, VP of Sales, Sales Ops, or a mix?"

**Follow-up:** "Do different stakeholders need different views? For example, does the CEO want a 30-second summary while Sales Ops needs the detailed data?"

---

### Q3. Current Pain Point
"Right now, how are your clients getting these insights? Are they doing it manually in Excel, or are they just not doing it at all?"

**Follow-up:** "What typically happens when they don't have this data? Do deals get missed? Do sales teams focus on the wrong accounts?"

---

## Section 2: Data & Analytics Requirements

### Q4. The 3-Year Dataset
"The architecture mentions a 'Fixed Schema – 3 Year Customer Dataset.' Can you walk me through what fields you expect in that data?"

**Prompt if needed:**
- Customer ID, Name, Industry, Location?
- Order history (revenue, margin, dates)?
- Product categories or SKUs?
- Any specific fields unique to your clients' ERP systems?

**Follow-up:** "What if a client only has 2 years of data, or even just 1 year? Do we still run the diagnostic, or is 3 years a hard requirement?"

---

### Q5. Revenue Quality Ranking
"You mentioned 'Revenue Quality Ranking' in the analytics engine. Is this the same as our current Top 20% by gross margin, or are you thinking of something different?"

**Follow-up:** "Should we rank by revenue, margin, or a combined score? Any specific formula you have in mind?"

---

### Q6. Growth Signal (CAGR)
"The CAGR calculation – that's new compared to what we have now. Can you tell me more about how you envision this?"

**Clarifying questions:**
- "Do we calculate CAGR per customer, per segment, or both?"
- "What's the minimum number of years needed to calculate a meaningful CAGR?"
- "How should we handle customers who are brand new (less than 2 years of history)?"
- "Do you want us to flag 'growing' vs 'declining' vs 'stable' customers?"

---

### Q7. Stability Score
"The Stability Score is interesting. Can you describe what 'stable' means in your context?"

**Clarifying questions:**
- "Is it about consistent ordering patterns? Like, they order every month versus once a year?"
- "Is it about revenue volatility? Like, low variance in order amounts?"
- "Should seasonality affect the score? Some industries have natural peaks and valleys."
- "Do you have a benchmark or threshold in mind? Like, 'stable' means less than 20% variance?"

---

### Q8. CIC Lite Extraction
"I see 'CIC Lite Extraction' in the analytics engine. CIC stands for... Customer ICP Characteristics, right? How is this different from the ICP traits we already extract?"

**Follow-up:** "When you say 'Lite' – does that mean a simplified version? Like the top 5 traits instead of the full analysis?"

---

### Q9. Segment Ranking
"For Segment Ranking, are we talking about the A/B/C tier system we already have, or something different?"

**Follow-up:** "Should segments be based on a single metric or a composite? For example: Tier A = High Revenue + High Growth + High Stability?"

---

## Section 3: Output Deliverables

### Q10. Executive PDF Summary
"Let's talk about the Executive PDF Summary. Paint me a picture – if you handed this to a CEO, what would they see on that one page?"

**Prompt if needed:**
- "Is it mostly numbers and charts, or more narrative text?"
- "Do you have an example or template you love that we could use as inspiration?"
- "Should it include recommendations or just the data?"

**Follow-up:** "How branded should it be? Client's logo, StrikeZone branding, or neutral?"

---

### Q11. 10-Slide Insight Deck
"The 10-Slide Insight Deck sounds great. Can you walk me through what each slide should cover?"

**Suggested structure to validate:**
1. Title / Executive Summary
2. Data Overview (what we analyzed)
3. Top 20% / High-Value Accounts
4. Growth Signal (who's growing)
5. Stability Analysis
6. Segment Breakdown (A/B/C)
7. CIC Profile (what good looks like)
8. Target Priorities / Recommendations
9. Next Steps / Action Items
10. Appendix or Methodology

**Follow-up:** "Is this deck meant to be self-explanatory, or is it designed to support a live presentation?"

---

### Q12. CIC Targeting Brief
"What's the CIC Targeting Brief? Is this like a one-pager that sales teams can take into their tools like Apollo or LinkedIn?"

**Follow-up:** 
- "What fields should be in there? Industry codes, company size ranges, geographic focus?"
- "Should it include ready-to-copy filter values for specific platforms?"

---

### Q13. HVT-Ready Data File
"HVT-Ready Data File – I'm assuming HVT means High Value Targets. What format should this be? CSV, Excel, JSON?"

**Follow-up:** 
- "What columns should be included?"
- "Is this the raw list of top accounts with all their metrics?"
- "Should it be importable directly into a CRM or sales tool?"

---

## Section 4: Workflow & User Experience

### Q14. Who Runs the Diagnostic?
"In terms of workflow – who actually runs this diagnostic? Is it your internal team running it for clients, or do clients log in and run it themselves?"

**Follow-up:** "If it's self-service, how technical are these users? Do we need to make it super simple, or can we assume they know what a CSV upload is?"

---

### Q15. Human Interpretation Layer
"I noticed there's a 'Human Interpretation Layer' – Executive Readout + Sales Alignment Workshop. Can you tell me more about that?"

**Clarifying questions:**
- "Is the software supposed to auto-generate talking points for this workshop?"
- "Or is this outside the software – something your consultants do separately?"
- "Do we need to capture notes or action items from the workshop back into the system?"

---

### Q16. Frequency & Refresh
"How often would a client run this diagnostic? Once a year? Quarterly? Monthly?"

**Follow-up:** "Should we store historical runs so they can see trends? Like, compare Q1 diagnostic to Q4?"

---

## Section 5: Integration & Expansion

### Q17. Connection to Existing Features
"We already have the look-alike generation, contact enrichment, and AI messaging built. How does the Sales Signal Diagnostic connect to those?"

**Follow-up:** "Is the diagnostic a standalone product, or should completing a diagnostic automatically feed into the look-alike generation pipeline?"

---

### Q18. Optional Expansion Path
"The diagram shows an 'Optional Expansion Path: CIC → HVT → SVT → CRM Activation → Outreach Execution.' Can you walk me through what SVT means?"

**Follow-up:** 
- "Is SVT = Strategic Value Targets? What makes them 'strategic' vs 'high value'?"
- "What does 'CRM Activation' look like? Are we pushing data to Salesforce, HubSpot, etc.?"

---

### Q19. Third-Party Integrations
"Are there any specific tools or platforms you want this to integrate with?"

**Examples to mention:**
- CRM (Salesforce, HubSpot, Dynamics)
- Sales engagement (Apollo, Outreach, Salesloft)
- Data providers (ZoomInfo, 6sense)
- Presentation tools (PowerPoint, Google Slides)

---

## Section 6: Timeline & Priorities

### Q20. MVP vs Full Vision
"If we had to ship a minimum viable version in 2 weeks, what would be the must-haves versus nice-to-haves?"

**Probe:**
- "If I could only build 3 of these features first, which 3?"
- "Is the PDF more important than the slide deck, or vice versa?"

---

### Q21. Success Metrics
"How will we know this feature is successful? What would make you say 'yes, this is exactly what I needed'?"

**Follow-up:** "Any specific client feedback or sales outcomes you're hoping for?"

---

### Q22. Timeline Expectations
"What's your ideal timeline for having this live? Any hard deadlines like a client demo or a sales presentation?"

---

## Section 7: Technical Clarifications

### Q23. Data Volume
"What's the typical size of a client's dataset? Are we talking hundreds of customers or tens of thousands?"

**Follow-up:** "Largest dataset you'd expect? This helps us plan for performance."

---

### Q24. Edge Cases
"What happens if the data quality is poor? Missing fields, bad dates, duplicates?"

**Follow-up:** 
- "Should we reject the file, or process what we can and flag issues?"
- "Do we need a 'data quality score' as part of the output?"

---

### Q25. Security & Access
"Any specific security requirements? Do different users have different access levels?"

**Follow-up:** "Should the generated reports be downloadable by anyone, or restricted?"

---

## Closing (5 minutes)

"This has been super helpful! Just a few quick wrap-up questions:"

### Q26. Anything We Missed?
"Is there anything about the Sales Signal Diagnostic that we haven't covered? Any features or requirements you're thinking about that we should know?"

---

### Q27. Reference Examples
"Do you have any examples of reports or dashboards from other tools that you really like? Even if they're unrelated, it helps us understand your taste and style."

---

### Q28. Next Steps
"What would be the best next step? Should we put together a quick mockup of the PDF and deck, or jump straight into building the analytics engine?"

---

## Post-Interview Actions

After the interview, document:

1. **Key Decisions Made:**
   - [ ] CAGR calculation method confirmed
   - [ ] Stability Score definition confirmed
   - [ ] Output format priorities (PDF vs Deck vs Brief)
   - [ ] MVP scope defined

2. **Open Questions to Research:**
   - [ ] Any items that need follow-up

3. **Timeline Commitment:**
   - [ ] Agreed delivery date

4. **Risk Flags:**
   - [ ] Any concerns about scope, data quality, or expectations

---

## Quick Reference: Acronyms

| Acronym | Meaning |
|---------|---------|
| CIC | Customer ICP Characteristics |
| HVT | High Value Targets |
| SVT | Strategic Value Targets |
| CAGR | Compound Annual Growth Rate |
| ICP | Ideal Customer Profile |

---

*Document prepared for Sales Signal Diagnostic feature discovery meeting.*
