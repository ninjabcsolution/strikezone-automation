# Look-Alike Tool Integration Strategy
## D&B Lattice Engine, 6sense, ZoomInfo + Apollo

---

## Client-Ready Response (Short)

**Question:** Should we use specialized look-alike tools (D&B Lattice Engine, 6sense, ZoomInfo) instead of only Apollo?

**Answer:**
*"Yes — we recommend using a specialized look-alike engine (D&B Lattice Engine, 6sense, or ZoomInfo) as the **primary targeting source**, and Apollo as the **enrichment layer**. Here's why:*

*Specialized tools use **intent signals, technographic data, and behavioral patterns** (not just firmographics) to generate higher-quality look-alikes. Apollo excels at **contact enrichment** (finding decision-makers once you have target accounts), but it's not designed for predictive look-alike modeling.*

*Our architecture supports this: the look-alike engine generates the target list → it flows into the approval portal for review → approved accounts get enriched via Apollo → contacts are ready for outreach. This gives you the best of both worlds: sophisticated targeting + contact-level enrichment."*

---

## Recommended Tool Selection

### Option 1: **6sense** (Best for intent + behavioral signals)
- **Strengths:** Intent data, technographic fit, buying stage signals
- **Use case:** New logo acquisition with buying intent
- **API:** Yes (6sense API for account lists)
- **Cost:** $$$ (enterprise pricing)

### Option 2: **ZoomInfo** (Best for scale + firmographics)
- **Strengths:** Massive database, good firmographic matching, contact data built-in
- **Use case:** Large-scale prospecting + contact enrichment in one
- **API:** Yes (ZoomInfo API)
- **Cost:** $$ (seat-based + API usage)

### Option 3: **D&B Lattice Engine** (Best for Dun & Bradstreet customers)
- **Strengths:** D&B firmographic quality, predictive modeling
- **Use case:** If you already use D&B for credit/risk
- **API:** Yes (D&B API)
- **Cost:** $$$ (enterprise)

### Apollo's Role
- **Primary function:** Contact enrichment (find decision-makers at target accounts)
- **Secondary function:** Firmographic validation (verify company data)
- **Not ideal for:** Predictive look-alike modeling (it doesn't use intent/behavioral signals)

---

## Integrated Architecture (Phase 3 Enhancement)

```
┌─────────────────────────────────────────────────────────────┐
│              Look-Alike Generation Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: ICP Extraction (from ERP Top 20%)                 │
│  ┌─────────────────────────────────────────────┐           │
│  │  Your Backend (Strikezone)                  │           │
│  │  - Extract ICP traits: industry, geo, size  │           │
│  │  - Behavioral patterns: frequency, breadth  │           │
│  └─────────────────┬───────────────────────────┘           │
│                    │ ICP Profile JSON                       │
│                    ▼                                        │
│  Step 2: Look-Alike Generation (Specialized Tool)          │
│  ┌─────────────────────────────────────────────┐           │
│  │  6sense / ZoomInfo / D&B Lattice API        │           │
│  │  - Send ICP traits                          │           │
│  │  - Request: top N look-alike accounts       │           │
│  │  - Receive: scored account list             │           │
│  └─────────────────┬───────────────────────────┘           │
│                    │ Look-alike accounts (firmographic)    │
│                    ▼                                        │
│  Step 3: Store in Approval Portal                          │
│  ┌─────────────────────────────────────────────┐           │
│  │  lookalike_targets table                    │           │
│  │  - status: 'pending_review'                 │           │
│  │  - similarity_score (from tool)             │           │
│  │  - reason_codes                             │           │
│  └─────────────────┬───────────────────────────┘           │
│                    │ Human review                          │
│                    ▼                                        │
│  Step 4: Approval Portal Review                            │
│  ┌─────────────────────────────────────────────┐           │
│  │  Your Frontend (React)                      │           │
│  │  - Show target list with scores             │           │
│  │  - Approve / Reject / Edit                  │           │
│  └─────────────────┬───────────────────────────┘           │
│                    │ Approved accounts                     │
│                    ▼                                        │
│  Step 5: Contact Enrichment (Apollo)                       │
│  ┌─────────────────────────────────────────────┐           │
│  │  Apollo.io API                              │           │
│  │  - Enrich: domain → contacts                │           │
│  │  - Job titles: VP Ops, Procurement, CFO     │           │
│  │  - Email + LinkedIn                         │           │
│  └─────────────────┬───────────────────────────┘           │
│                    │ Enriched contacts                     │
│                    ▼                                        │
│  Step 6: Ready for Outreach                                │
│  ┌─────────────────────────────────────────────┐           │
│  │  Export to CRM / Sales Engagement Platform  │           │
│  └─────────────────────────────────────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan (3 Weeks)

### Week 1: Tool Selection + API Setup
- [ ] Choose tool: 6sense, ZoomInfo, or D&B Lattice
- [ ] Obtain API credentials + sandbox access
- [ ] Test API with sample ICP profile
- [ ] Document API request/response format

### Week 2: Backend Integration
- [ ] Create `lookalikeToolService.js` (abstraction layer)
- [ ] Add tool-specific adapters:
  - `sixsenseAdapter.js`
  - `zoominfoAdapter.js`
  - `dblatticeAdapter.js`
- [ ] Update `/api/lookalike/generate` endpoint to call tool API
- [ ] Store results in `lookalike_targets` table with `source` field

### Week 3: Frontend + Workflow
- [ ] Update approval portal to show tool source + score
- [ ] Add "Re-run look-alike" button (if ICP changes)
- [ ] Add Apollo enrichment trigger after approval
- [ ] Test end-to-end: ICP → Tool → Approval → Apollo → Export

---

## Code Scaffold: Tool Abstraction Layer

### Create `backend/src/services/lookalikeToolService.js`

```javascript
const sixsenseAdapter = require('./adapters/sixsenseAdapter');
const zoominfoAdapter = require('./adapters/zoominfoAdapter');
const dblatticeAdapter = require('./adapters/dblatticeAdapter');

class LookalikeToolService {
  constructor() {
    // Configure which tool to use (from environment variable)
    this.provider = process.env.LOOKALIKE_PROVIDER || 'zoominfo'; // 'sixsense' | 'zoominfo' | 'dblattice'
  }

  async generateLookAlikes(icpProfile, limit = 100) {
    let adapter;
    
    switch (this.provider) {
      case 'sixsense':
        adapter = sixsenseAdapter;
        break;
      case 'zoominfo':
        adapter = zoominfoAdapter;
        break;
      case 'dblattice':
        adapter = dblatticeAdapter;
        break;
      default:
        throw new Error(`Unknown lookalike provider: ${this.provider}`);
    }

    // Call adapter to get look-alike accounts
    const results = await adapter.findLookAlikes(icpProfile, limit);
    
    // Normalize response format
    return results.map(account => ({
      company_name: account.name,
      domain: account.domain || account.website,
      industry: account.industry,
      naics: account.naics,
      city: account.city,
      state: account.state,
      country: account.country,
      employee_count: account.employeeCount,
      annual_revenue: account.revenue,
      similarity_score: account.score || account.fit_score,
      reason_codes: account.reasons || [],
      source: this.provider,
    }));
  }
}

module.exports = new LookalikeToolService();
```

### Create `backend/src/services/adapters/zoominfoAdapter.js` (Example)

```javascript
const axios = require('axios');

class ZoomInfoAdapter {
  constructor() {
    this.apiKey = process.env.ZOOMINFO_API_KEY;
    this.baseUrl = 'https://api.zoominfo.com/v1';
  }

  async findLookAlikes(icpProfile, limit) {
    // Build ZoomInfo search criteria from ICP profile
    const searchCriteria = {
      industries: icpProfile.industries,
      locations: icpProfile.states.map(state => ({ state })),
      employeeRange: {
        min: icpProfile.employee_range_min,
        max: icpProfile.employee_range_max,
      },
      revenueRange: {
        min: icpProfile.revenue_range_min,
        max: icpProfile.revenue_range_max,
      },
      limit,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/search/companies`,
        searchCriteria,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.companies.map(company => ({
        name: company.name,
        domain: company.website,
        industry: company.industry,
        naics: company.naicsCode,
        city: company.city,
        state: company.state,
        country: company.country,
        employeeCount: company.employees,
        revenue: company.revenue,
        score: company.fitScore || 85, // ZoomInfo may provide fit score
        reasons: this.buildReasons(company, icpProfile),
      }));
    } catch (error) {
      console.error('ZoomInfo API error:', error);
      throw new Error('Failed to fetch look-alikes from ZoomInfo');
    }
  }

  buildReasons(company, icpProfile) {
    const reasons = [];
    if (icpProfile.industries.includes(company.industry)) {
      reasons.push('Same industry');
    }
    if (icpProfile.states.includes(company.state)) {
      reasons.push('Target geography');
    }
    // Add more logic based on ICP matching
    return reasons;
  }
}

module.exports = new ZoomInfoAdapter();
```

---

## Environment Variables to Add

```env
# Look-alike tool selection
LOOKALIKE_PROVIDER=zoominfo  # 'sixsense' | 'zoominfo' | 'dblattice'

# Tool API credentials (add the one you choose)
ZOOMINFO_API_KEY=your_key_here
# SIXSENSE_API_KEY=your_key_here
# DBLATTICE_API_KEY=your_key_here

# Apollo (for enrichment after approval)
APOLLO_API_KEY=your_apollo_key
```

---

## Cost Comparison (Rough Estimates)

| Tool | Monthly Cost | Best For | API Included |
|------|-------------|----------|--------------|
| **6sense** | $3K–$10K+ | Intent + buying signals | Yes |
| **ZoomInfo** | $15K–$30K/year (seats) | Scale + contacts | Yes (API add-on) |
| **D&B Lattice** | Custom (enterprise) | D&B customers | Yes |
| **Apollo** | $49–$149/user/mo | Contact enrichment | Yes (limited) |

**Recommendation:** Start with **ZoomInfo** if you need scale, or **6sense** if you want intent data.

---

## Next Steps

1. **Choose tool:** Let me know which tool you prefer (6sense, ZoomInfo, or D&B Lattice).
2. **Get API access:** I'll help you set up the API integration.
3. **Update architecture:** I'll implement the adapter pattern + approval workflow.
4. **Test end-to-end:** ICP → Tool → Approval → Apollo → Export.

If you want me to build the full integration code for a specific tool, just tell me which one!
