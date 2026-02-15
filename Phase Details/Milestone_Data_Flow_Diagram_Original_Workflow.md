# Milestone — Data Flow Diagram (Original Workflow)

This repo is intended to support the **original Strikezone workflow** shown in the PNG diagrams in this folder:

**Dynamics 365 → Power BI → Segmented Target Export → Custom App (Approval Portal) → Apollo / AI → Apollo Sequences → Results → Reporting**

The important point is:
- **Power BI remains the analytics/scoring layer** (Top 20%, ICP patterns, tiers, segments)
- The **custom app** operationalizes the workflow (review/edit/approve/audit/export; then enrichment + messaging + launch)

---

## 1) End-to-end (simple)

```mermaid
flowchart LR
  D365[Dynamics 365\nERP/CRM] -->|refresh/schedule| PBI[Power BI\nDashboards + Scoring]
  PBI -->|export CSV/Excel\n(A/B/WinBack/Strategic)| EXPORT[Segmented Target Export]

  EXPORT --> APP[Custom App (this repo)\nApproval Portal + Audit]
  APP -->|approved targets| APOLLO[Apollo\nEnrich + Sequences]
  APP -->|draft messaging| AI[OpenAI\nMessaging]
  APOLLO --> OUT[Outreach Results\n(open/click/reply/meetings)]
  OUT -->|KPIs| REPORT[Reporting\n(Power BI optional)]
```

---

## 2) Where this repo fits

The **Custom App** layer is implemented by `phase1-app/`:

### Import segmented exports from Power BI
You can import a target list into the approval portal in two ways:

1) **JSON import** (API)
   - `POST /api/powerbi/import/targets`

2) **CSV import** (recommended for Power BI table exports)
   - `POST /api/powerbi/import/targets-csv` (multipart file upload)

Imported records are stored in **`lookalike_targets`** with:
- `source = powerbi`
- `source_external_id = account_id` (or fallback to domain)
- optional fields like `tier`, `segment`, `similarity_score`, `opportunity_score`, `reason_codes`

### Review / Approve
UI:
- `http://localhost:3000/approval-portal`

Approvals & edits:
- `POST /api/targets/:id/approve`
- `PATCH /api/targets/:id`
- `GET /api/targets/:id/approvals`

### Export approved targets
- `GET /api/targets/export.csv?status=approved`

---

## 3) Apollo note
Some Apollo endpoints (including the company search used for net-new look-alikes) may require a paid plan.
Even without Apollo generation enabled, the **original workflow still works**:
Power BI → Export → Approval Portal → Export Approved → (manual Apollo import / later automation).
