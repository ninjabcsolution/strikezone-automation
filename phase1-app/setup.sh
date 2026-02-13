#!/bin/bash
# Strikezone Setup Script

echo "🚀 Strikezone Setup Script"
echo "=========================="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed. Aborting." >&2; exit 1; }

echo "✓ Prerequisites found"

# Setup Database
echo ""
echo "📦 Setting up database..."
sudo -u postgres psql << EOF
CREATE DATABASE IF NOT EXISTS strikezone_db;
CREATE USER IF NOT EXISTS strikezone_user WITH PASSWORD 'strikezone123';
GRANT ALL PRIVILEGES ON DATABASE strikezone_db TO strikezone_user;
\q
EOF

echo "✓ Database created"

# Run schemas
echo "📊 Creating database tables..."
psql -U postgres -d strikezone_db -f backend/src/models/schema.sql > /dev/null 2>&1
psql -U postgres -d strikezone_db -f backend/src/models/phase2_schema.sql > /dev/null 2>&1
echo "✓ Tables created"

# Setup Backend
echo ""
echo "⚙️  Setting up backend..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created .env file"
fi

if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    echo "✓ Backend dependencies installed"
else
    echo "✓ Backend dependencies already installed"
fi
cd ..

# Setup Frontend
echo ""
echo "🎨 Setting up frontend..."
cd frontend
if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
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
