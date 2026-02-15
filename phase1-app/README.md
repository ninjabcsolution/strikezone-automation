# Strikezone ERP Data Intelligence Platform

Complete ERP-neutral data ingestion and analytics system.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- 4GB RAM minimum

### 1. Setup Database

```bash
# Install PostgreSQL (if needed)
sudo apt update && sudo apt install postgresql postgresql-contrib

# Create database + user
sudo -u postgres psql << EOF
CREATE USER strikezone_user WITH PASSWORD 'strikezone123';
CREATE DATABASE strikezone_db OWNER strikezone_user;
GRANT ALL PRIVILEGES ON DATABASE strikezone_db TO strikezone_user;
EOF

# Run schemas (or use `npm run db:init:all` from the backend folder)
psql -h localhost -U strikezone_user -d strikezone_db -f backend/src/models/schema.sql
psql -h localhost -U strikezone_user -d strikezone_db -f backend/src/models/phase2_schema.sql
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:init:all
npm run dev
# Backend runs on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

## Usage

### Upload Data
1. Go to http://localhost:3000
2. Drag & drop CSV files (Customers, Orders, OrderLines, Products)
3. View validation results and QA reports

### Run Analytics
```bash
# Calculate Top 20% customers
curl -X POST http://localhost:5000/api/analytics/calculate

# Get Top 20% list
curl http://localhost:5000/api/analytics/top20

# Get stats
curl http://localhost:5000/api/analytics/stats
```

## Project Structure

```
phase1-app/
├── backend/
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── models/        # SQL schemas
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── server.js      # Express server
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/         # Next.js pages
    │   ├── services/      # API client
    │   └── styles/        # CSS
    └── package.json
```

## API Endpoints

### Upload
- `POST /api/upload` - Upload CSV file
- `GET /api/upload/logs` - Get ingestion logs

### Analytics
- `POST /api/analytics/calculate` - Calculate customer metrics
- `GET /api/analytics/top20` - Get Top 20% customers
- `GET /api/analytics/stats` - Get summary statistics

### Phase 3: Targets + Approval Portal
- `GET /api/targets` - List targets (filters: status, tier, q)
- `POST /api/targets` - Create target (manual)
- `PATCH /api/targets/:id` - Edit target (tier/notes/etc.)
- `POST /api/targets/:id/approve` - Approve/Reject target (body: {action: approved|rejected})
- `GET /api/targets/:id/approvals` - Approval history
- `GET /api/targets/export.csv` - Export targets CSV

### Phase 3: Look-alike Generation
- `GET /api/lookalike/icp-profile` - Auto-derived ICP profile from Top 20%
- `POST /api/lookalike/generate` - Generate targets from Apollo (requires `APOLLO_API_KEY`)

### Health
- `GET /api/health` - Check API status

## Features

### Phase 1 (Weeks 1-2)
- ✅ CSV file upload (any ERP)
- ✅ Data validation
- ✅ QA reporting
- ✅ PostgreSQL storage

### Phase 2 (Weeks 3-6)
- ✅ Top 20% identification
- ✅ Customer analytics
- ⏳ ICP extraction
- ⏳ Look-alike generation

## Testing with Sample Data

```bash
# Test with provided sample data
curl -X POST http://localhost:5000/api/upload \
  -F "file=@../sample_data_ceo/Customers.csv"

curl -X POST http://localhost:5000/api/upload \
  -F "file=@../sample_data_ceo/Orders.csv"
```

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `.env`

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: `npm run dev -- -p 3001`

## Next Steps

1. Upload your ERP data (CSV exports)
2. Run analytics to identify Top 20%
3. Review ICP traits
4. Use the Approval Portal to review/edit/approve targets (Phase 3)

## Support

For issues, check the implementation guides:
- `Phase1_Implementation_Guide.md`
- `Phase2_Implementation_Guide.md`
