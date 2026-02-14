#!/bin/bash
set -euo pipefail

# Strikezone Setup Script

echo "🚀 Strikezone Setup Script"
echo "=========================="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed. Aborting." >&2; exit 1; }

echo "✓ Prerequisites found"

# Setup Database
echo ""
echo "📦 Setting up database..."

DB_NAME="strikezone_db"
DB_USER="strikezone_user"
DB_PASSWORD="strikezone123"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} LOGIN PASSWORD '${DB_PASSWORD}';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
  END IF;
END
\$\$;

SELECT format('CREATE DATABASE %I OWNER %I', '${DB_NAME}', '${DB_USER}')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOF

echo "✓ Database created"

# Setup Backend
echo ""
echo "⚙️  Setting up backend..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created .env file"
fi

if [ ! -d "node_modules" ]; then
    npm install
    echo "✓ Backend dependencies installed"
else
    echo "✓ Backend dependencies already installed"
fi

echo "📊 Initializing database tables..."
npm run db:init:all
echo "✓ Tables created"
cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up frontend..."
cd frontend
if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
    npm install
    echo "✓ Frontend dependencies installed"
elif [ ! -f "package.json" ]; then
    echo "⚠️  Frontend package.json not found (will be created)"
else
    echo "✓ Frontend dependencies already installed"
fi
cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "To start the application:"
echo "  1. Backend:  cd backend && npm run dev"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo ""
