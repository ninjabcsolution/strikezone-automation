# Strikezone Automation - Testing Guide

This guide provides step-by-step instructions to test all features of the Strikezone Automation platform with example data and expected outputs.

## Prerequisites

1. Backend running on `http://localhost:5002`
2. Frontend running on `http://localhost:5000`
3. PostgreSQL database configured and running

---

## 1. CEO Dashboard Testing

### 1.1 Upload Sample Data

**Via UI:**
1. Navigate to `http://localhost:5000/ceo-dashboard`
2. Upload CSV files from `sample_data_3yr/` directory:
   - `Customers.csv`
   - `Orders.csv`
   - `OrderLines.csv`
   - `Products.csv`

**Via API:**
```bash
# Upload Customers
curl -X POST http://localhost:5002/api/upload/customers \
  -F "file=@sample_data_3yr/Customers.csv"

# Expected Response:
# {"status":"success","message":"Uploaded 120 customers"}
```

### 1.2 View CAGR Analysis

**Via UI:**
- Navigate to CEO Dashboard → View "Customer Growth Analysis" section

**Via API:**
```bash
curl -s http://localhost:5002/api/analytics/cagr-summary | jq .

# Expected Response:
{
  "growing": 32,
  "stable": 45,
  "declining": 19,
  "noData": 24
}
```

---

## 2. ICP Dashboard Testing

### 2.1 Generate ICP Profile from Top 20 Customers

**Via API:**
```bash
curl -s http://localhost:5002/api/icp/profile | jq .

# Expected Response (sample):
{
  "industries": [
    { "value": "Industrial Machinery", "count": 6, "weight": 0.25 },
    { "value": "Petroleum & Coal", "count": 5, "weight": 0.21 }
  ],
  "states": [
    { "value": "TX", "count": 3, "weight": 0.125 },
    { "value": "CA", "count": 2, "weight": 0.083 }
  ],
  "employeeCount": { "p25": 378, "p75": 881 },
  "annualRevenue": { "p25": 72460000, "p75": 193647500 }
}
```

### 2.2 Get Top 20 Customers

```bash
curl -s http://localhost:5002/api/icp/top20 | jq '.customers | length'

# Expected Response: 20
```

---

## 3. Approval Portal Testing

### 3.1 List Targets

```bash
curl -s "http://localhost:5002/api/targets?limit=5" | jq '.targets | .[] | {id: .target_id, name: .company_name, status: .status}'

# Expected Response:
# { "id": 1, "name": "Demo Industrial Co", "status": "approved" }
# { "id": 2, "name": "PBI Export Example Inc", "status": "approved" }
# ...
```

### 3.2 Create a New Target

```bash
curl -s -X POST http://localhost:5002/api/targets \
  -H "Content-Type: application/json" \
  -H "X-Actor: test-user" \
  -d '{
    "company_name": "Test Manufacturing Corp",
    "domain": "testmfg.com",
    "industry": "Manufacturing",
    "state": "TX",
    "employee_count": 500,
    "annual_revenue": 50000000
  }' | jq '.target | {id: .target_id, name: .company_name, tier: .tier}'

# Expected Response:
# { "id": 35, "name": "Test Manufacturing Corp", "tier": "B" }
```

### 3.3 Approve a Target

```bash
# Approve target ID 35
curl -s -X POST http://localhost:5002/api/targets/35/approve \
  -H "Content-Type: application/json" \
  -H "X-Actor: test-user" \
  -d '{"action": "approved", "notes": "Good fit for our ICP"}' | jq '.target.status'

# Expected Response: "approved"
```

### 3.4 Update a Target

```bash
curl -s -X PATCH http://localhost:5002/api/targets/35 \
  -H "Content-Type: application/json" \
  -H "X-Actor: test-user" \
  -d '{"tier": "A", "notes": "High priority prospect"}' | jq '.target.tier'

# Expected Response: "A"
```

### 3.5 Export Targets as CSV

```bash
curl -s "http://localhost:5002/api/targets/export.csv?status=approved" | head -5

# Expected Response (CSV format):
# target_id,company_name,domain,industry,...
# 1,Demo Industrial Co,demo-industrial.example,Industrial Machinery,...
```

---

## 4. Messaging Portal Testing

### 4.1 Check OpenAI Configuration

```bash
curl -s http://localhost:5002/api/messaging/status | jq .

# Expected Response:
{
  "openai": {
    "configured": true,
    "model": "gpt-4-turbo-preview"
  }
}
```

### 4.2 List Enriched Contacts

```bash
curl -s http://localhost:5002/api/enrichment/contacts | jq '.contacts | .[] | {id: .id, name: .full_name, company: .company_name, title: .title}'

# Expected Response:
# { "id": 1, "name": "John Smith", "company": "Demo Industrial Co", "title": "VP of Operations" }
# { "id": 2, "name": "Sarah Johnson", "company": "Demo Industrial Co", "title": "Director of Procurement" }
# ...
```

### 4.3 Generate AI Message for Single Contact

```bash
curl -s -X POST http://localhost:5002/api/messaging/generate \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": 1,
    "messageType": "email",
    "customInstructions": "Focus on supply chain efficiency"
  }' | jq '{id: .message.id, subject: .message.subject, status: .message.approval_status}'

# Expected Response:
# { "id": 9, "subject": "Improving Supply Chain Operations at Demo Industrial Co", "status": "pending" }
```

### 4.4 Generate Batch Messages

```bash
curl -s -X POST http://localhost:5002/api/messaging/generate/batch \
  -H "Content-Type: application/json" \
  -d '{
    "contactIds": [1, 2, 3],
    "messageType": "email"
  }' | jq '{generated: .generatedCount, failed: .failedCount}'

# Expected Response:
# { "generated": 3, "failed": 0 }
```

### 4.5 List Pending Messages

```bash
curl -s "http://localhost:5002/api/messaging/messages?status=pending" | jq '.messages | length'

# Expected Response: 3 (or more depending on previous tests)
```

### 4.6 Approve a Single Message

```bash
curl -s -X POST http://localhost:5002/api/messaging/messages/9/approve | jq '.message.approval_status'

# Expected Response: "approved"
```

### 4.7 Bulk Approve Messages

```bash
curl -s -X POST http://localhost:5002/api/messaging/messages/bulk/approve \
  -H "Content-Type: application/json" \
  -d '{"ids": [10, 11, 12]}' | jq .

# Expected Response:
# { "approved": 3, "ids": [10, 11, 12] }
```

### 4.8 Edit and Approve a Message

```bash
curl -s -X POST http://localhost:5002/api/messaging/messages/9/edit \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Custom Subject Line",
    "body": "Dear John,\n\nThis is an edited message body.\n\nBest regards"
  }' | jq '.message | {status: .approval_status, subject: .subject}'

# Expected Response:
# { "status": "edited", "subject": "Custom Subject Line" }
```

### 4.9 Reject a Message

```bash
curl -s -X POST http://localhost:5002/api/messaging/messages/9/reject \
  -H "Content-Type: application/json" \
  -d '{"reason": "Not the right tone for this prospect"}' | jq '.message.approval_status'

# Expected Response: "rejected"
```

### 4.10 Get Message Statistics

```bash
curl -s http://localhost:5002/api/messaging/messages/stats | jq '.stats'

# Expected Response:
{
  "total": "15",
  "pending": "2",
  "approved": "10",
  "rejected": "1",
  "edited": "2"
}
```

### 4.11 Export Approved Messages

```bash
curl -s "http://localhost:5002/api/messaging/export" | head -3

# Expected Response (CSV format):
# "Contact Name","Email","Company","Subject","Body","Type","Approved At"
# "John Smith","john.smith@demo-industrial.example","Demo Industrial Co","..."
```

---

## 5. Lookalike Generation Testing

### 5.1 Generate Lookalikes (Demo Mode)

```bash
curl -s -X POST http://localhost:5002/api/lookalike/generate \
  -H "Content-Type: application/json" \
  -d '{"q": "industrial manufacturing", "perPage": 5}' | jq '{status: .status, inserted: .inserted, provider: .provider}'

# Expected Response (demo mode if Apollo not configured):
# { "status": "success", "inserted": 5, "provider": "demo" }
```

### 5.2 Generate Win-back Targets

```bash
curl -s -X POST http://localhost:5002/api/winback/generate \
  -H "Content-Type: application/json" \
  -d '{"inactiveDays": 180, "limit": 10}' | jq '{inserted: .inserted, updated: .updated, candidates: .totalCandidates}'

# Expected Response:
# { "inserted": 6, "updated": 0, "candidates": 10 }
```

---

## 6. Enrichment Testing

### 6.1 Run Contact Enrichment

```bash
curl -s -X POST http://localhost:5002/api/enrichment/run \
  -H "Content-Type: application/json" \
  -d '{"maxContactsPerCompany": 3}' | jq .

# Expected Response:
{
  "runId": 3,
  "enrichedCount": 6,
  "failedCount": 2,
  "companiesProcessed": 3
}
```

### 6.2 List Enrichment Runs

```bash
curl -s http://localhost:5002/api/enrichment/runs | jq '.runs | .[] | {id: .id, status: .status, enriched: .enriched_count}'

# Expected Response:
# { "id": 3, "status": "completed", "enriched": 6 }
# { "id": 2, "status": "completed", "enriched": 8 }
```

### 6.3 Export Enriched Contacts

```bash
curl -s "http://localhost:5002/api/enrichment/contacts/export" | head -3

# Expected Response (CSV format):
# "Full Name","Email","Title","Company","Domain","Phone","LinkedIn"
# "John Smith","john.smith@demo-industrial.example","VP of Operations",...
```

---

## 7. Power BI Import Testing

### 7.1 Import via JSON

```bash
curl -s -X POST http://localhost:5002/api/powerbi/import/targets \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "account_id": "PBI-TEST-001",
        "company_name": "Power BI Test Company",
        "domain": "pbitest.com",
        "tier": "A",
        "segment": "Strategic",
        "similarity_score": "95.5",
        "opportunity_score": "88.0"
      }
    ]
  }' | jq .

# Expected Response:
# { "totalRecords": 1, "inserted": 1, "updated": 0, "failed": 0 }
```

### 7.2 Import via CSV File

```bash
# Create test CSV
echo 'account_id,company_name,domain,tier,segment
PBI-CSV-001,CSV Test Corp,csvtest.com,B,Growth' > /tmp/test_pbi.csv

curl -s -X POST http://localhost:5002/api/powerbi/import/targets-csv \
  -F "file=@/tmp/test_pbi.csv" | jq .

# Expected Response:
# { "totalRows": 1, "inserted": 1, "updated": 0, "failed": 0 }
```

---

## 8. Health Check

```bash
curl -s http://localhost:5002/api/health | jq .

# Expected Response:
{
  "status": "ok",
  "timestamp": "2026-03-01T01:05:00.000Z",
  "database": "connected"
}
```

---

## Quick Full Workflow Test

Run this complete workflow test:

```bash
echo "=== 1. Check Health ==="
curl -s http://localhost:5002/api/health | jq -c .

echo -e "\n=== 2. Get ICP Profile ==="
curl -s http://localhost:5002/api/icp/profile | jq -c '{industries: .industries | length, states: .states | length}'

echo -e "\n=== 3. List Targets ==="
curl -s "http://localhost:5002/api/targets?limit=3" | jq -c '.targets | length'

echo -e "\n=== 4. List Contacts ==="
curl -s http://localhost:5002/api/enrichment/contacts | jq -c '.contacts | length'

echo -e "\n=== 5. Message Stats ==="
curl -s http://localhost:5002/api/messaging/messages/stats | jq -c '.stats'

echo -e "\n=== All Tests Complete ==="
```

Expected output:
```
=== 1. Check Health ===
{"status":"ok","timestamp":"...","database":"connected"}

=== 2. Get ICP Profile ===
{"industries":6,"states":10}

=== 3. List Targets ===
3

=== 4. List Contacts ===
8

=== 5. Message Stats ===
{"total":"15","pending":"0","approved":"13","rejected":"1","edited":"1"}

=== All Tests Complete ===
```

---

## Troubleshooting

### Common Issues

1. **500 Error on API calls**
   - Check backend logs: `tail -f /tmp/backend.log`
   - Verify database connection: `PGPASSWORD=postgres psql -h localhost -U postgres -d strikezone_db -c "SELECT 1;"`

2. **No contacts available**
   - Run enrichment: `curl -X POST http://localhost:5002/api/enrichment/run -H "Content-Type: application/json" -d '{"maxContactsPerCompany": 5}'`

3. **No targets found**
   - Generate lookalikes: `curl -X POST http://localhost:5002/api/lookalike/generate -H "Content-Type: application/json" -d '{"q": "manufacturing"}'`

4. **OpenAI not configured**
   - Set `OPENAI_API_KEY` in `backend/.env`
   - Restart backend

5. **Apollo API errors**
   - Set `APOLLO_API_KEY` in `backend/.env` 
   - Or use demo mode (enabled by default)
