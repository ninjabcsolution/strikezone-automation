# Project Kickoff Meeting — Preparation Guide
## Strikezone: ERP Data → ICP → Look-Alikes → Automated Outreach

---

## Meeting objective

Walk away with:
1. **Client agreement** that the project is feasible and valuable
2. **Access confirmed** (ERP export templates + tool credentials)
3. **Timeline locked** (pilot vs full build)
4. **Next steps scheduled** (data delivery date + follow-up)

---

## Meeting agenda (recommended 60–90 minutes)

### Part 1 — Context setting (10 min)
- Introductions
- Confirm client's current pain points (manual prospecting, guessing at ICP, low conversion)
- Align on the goal: repeatable, data-driven outbound pipeline

### Part 2 — Walkthrough of the 6-step method (20 min)
Present the workflow:
- Step 1: Identify Top 20% customers
- Step 2: Define ICP from real data
- Step 3: Find look-alikes (inactive + net-new)
- Step 4: Prioritize into Tier A/B/C
- Step 5: Enrich contacts + personalize messaging
- Step 6: Launch + track + learn

**What to show:** `CEO_One_Pager_Detailed.md` or slides covering the 6 steps.

### Part 3 — Demo (if available) (15 min)
If you've built the Power BI CEO dashboard using sample data:
- Show Top 20% KPI
- Show ICP traits
- Show what the output looks like

**What to show:** Power BI dashboard (or screenshots).

### Part 4 — Technical approach (10 min)
- ERP-agnostic design (CSV/Excel first)
- Tools: Power BI + Apollo + OpenAI
- Optional custom app for full automation

**What to show:** `Phase3_LookAlike_Targeting_Diagram_Fixed.png` or architecture overview.

### Part 5 — Timeline + what we need from you (10 min)
- Pilot: 2–3 weeks to first outreach
- Full build: 12 weeks to production
- What we need: ERP exports (Customers + Orders) + Apollo access + margin definition

**What to show:** `12_Week_Product_Build_Roadmap.md` summary.

### Part 6 — Q&A + Next steps (15 min)
- Answer client questions (see Q&A section below)
- Lock down data delivery date
- Schedule follow-up

---

## What to bring / show

### Must-have
1. **CEO one-pager** (`CEO_One_Pager_Detailed.md` or PDF export)
2. **12-week roadmap summary** (`12_Week_Product_Build_Roadmap.md`)
3. **CSV templates** (show `sample_data_ceo/` as example format)

### Nice-to-have
4. Power BI demo dashboard (if built)
5. Phase 3 diagram (`Phase3_LookAlike_Targeting_Diagram_Fixed.png`)
6. Milestone/workflow diagram (`Milestone_Data_Flow_Diagram_Detailed.png`)

---

## Key talking points (memorize these)

### Why this works
- "We reverse-engineer who *actually* makes you money, not who you *think* should."
- "Most companies guess at their ICP. We derive it from margin data."
- "Targeting companies that look like your best customers is 3–5× more effective than cold outbound."

### Why now
- "Sales teams waste 60–80% of their time on research and list-building. This automates that."
- "Every week you can generate fresh targets and measure what converts."

### Differentiation
- "Most tools stop at lead lists. We close the loop: targeting → messaging → outreach → results → learning."
- "Explainability: every target includes 'why' it was selected."

---

## Client questions + answers (Q&A prep)

### Q1: "What ERPs do you support?"
**A:** We're ERP-agnostic by design. We work with CSV/Excel exports first, which works with *any* ERP (SAP, Oracle, Netsuite, Dynamics, Epicor, Infor, etc.). Once the workflow proves ROI, we can add direct connectors per ERP. Starting with CSV avoids IT delays and gets you to value faster.

### Q2: "What if we don't have gross margin data?"
**A:** We can start with revenue as a proxy. Or, if you have revenue + COGS, we compute margin. Margin is preferred, but not required to start. We can add margin later and refine the model.

### Q3: "How do you find look-alike companies?"
**A:** We translate your ICP traits (industry, size, geo, behavior) into filters and query external databases like Apollo.io. Apollo has 250M+ companies and 60M+ contacts. We also exclude your current customers and known bad-fit accounts. Optionally, we can add LinkedIn Sales Navigator or D&B Hoovers for richer firmographics.

### Q4: "Do you integrate with our CRM?"
**A:** For the pilot, we work with exports (CSV). For full production, yes—we can push enriched contacts + messaging into your CRM (Salesforce, HubSpot, etc.) or keep them in Apollo sequences. This is configurable based on your sales team's workflow.

### Q5: "What about data security / compliance?"
**A:** 
- ERP exports stay within your control (you upload to us or a secure cloud folder).
- We recommend Azure-hosted solutions (aligns with Microsoft compliance).
- For AI, we can use **Azure OpenAI** (enterprise-compliant) instead of public ChatGPT.
- We follow SOC 2 / GDPR best practices (encrypt at rest, role-based access, audit logs).

### Q6: "How accurate is the targeting?"
**A:** Accuracy improves weekly. Week 1 targeting is based on ICP fit. By Week 4, we're calibrating based on actual reply rates. Typical results: 3–8% meeting rate on well-targeted lists (varies by industry). The key is the learning loop—we continuously refine who converts.

### Q7: "How long until we see results?"
**A:** 
- **Pilot to first outreach:** 2–3 weeks
- **First meetings booked:** Week 3–4
- **Statistically meaningful data:** 8–12 weeks (need volume)

### Q8: "What does this cost?" (if they ask)
**A:** Depends on scope:
- **Pilot (manual CSV, assisted analysis):** typically $15K–$35K fixed
- **Full automation build (12 weeks):** $80K–$150K depending on team size and integrations
- **Ongoing tooling:** Apollo ($100–$500/mo), OpenAI ($50–$200/mo), hosting ($50–$200/mo)

(Adjust pricing to your actual rates.)

### Q9: "Can we see this work with our real data before committing?"
**A:** Yes. That's why we start with a pilot. Give us a sample export (Customers + Orders, 12–36 months), and within 1 week we'll show you:
- Your Top 20% list
- ICP summary
- A sample look-alike target list (10–50 companies)

### Q10: "What if our sales team doesn't adopt it?"
**A:** Adoption is critical. That's why we include:
- **Explainability** (reason codes per target)
- **Human approval** (sales reviews messaging before launch)
- **Weekly learning reports** (shows what's working)

Sales teams adopt when they see the system is *helping* them focus, not replacing them.

### Q11: "Why Power BI? We use Tableau / Looker."
**A:** Power BI is one option. We're tool-agnostic. If you prefer Tableau or Looker, we can build dashboards there. Power BI is common because it integrates well with Azure and Dynamics 365, but the *analytics logic* (Top 20%, ICP traits) works in any BI tool.

### Q12: "What happens after the 12 weeks?"
**A:** You have a working production system. After Week 12:
- **Option A:** Hand off to your team (we train them)
- **Option B:** Ongoing support retainer (monitoring, tuning, adding new data sources)
- **Option C:** Managed service (we run campaigns for you)

### Q13: "Can you handle multiple brands / divisions?"
**A:** Yes. We segment by brand/division using a `brand_id` or `division` field in the export. Each gets its own Top 20%, ICP, and target list. Messaging is tailored per brand.

### Q14: "What if we want to pause outreach mid-campaign?"
**A:** You control Apollo sequences. You can pause/stop anytime in Apollo's UI. We track "paused" state in the system so you don't lose context.

### Q15: "Do you write the messaging or does AI?"
**A:** AI generates draft messaging based on segment, industry, and ICP traits. Your team reviews, edits, and approves before launch. Think of AI as a "first draft assistant," not autopilot.

---

## What to lock down by end of meeting

### Critical next steps
1. ✅ **ERP export delivery date** (when can they provide sample CSVs?)
2. ✅ **Margin field confirmation** (do they have gross_margin, or revenue + COGS?)
3. ✅ **Tool access timeline** (Apollo account? OpenAI policy approved?)
4. ✅ **Decision-maker confirmation** (who approves ICP, target lists, messaging?)
5. ✅ **Pilot vs full build** (do they want a 2–3 week pilot first, or go straight to 12-week build?)
6. ✅ **Follow-up meeting** (schedule next check-in)

---

## Follow-up checklist (send within 24 hours)

Email the client:
1. Meeting summary (what was agreed)
2. CSV templates (Customers.csv, Orders.csv examples)
3. CEO one-pager PDF (if not shared during meeting)
4. Next steps + timeline
5. Calendar invite for next meeting
