# Strikezone Automation - VPS Deployment Guide

This guide explains how to deploy Strikezone Automation on an Ubuntu VPS with external IP access.

## Prerequisites

- Ubuntu 20.04+ VPS with public IP
- At least 2GB RAM, 20GB disk
- Root or sudo access
- Domain name (optional but recommended)

## Quick Deploy Steps

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

### 2. Setup PostgreSQL

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE USER strikezone WITH PASSWORD 'your_secure_password';
CREATE DATABASE strikezone_db OWNER strikezone;
GRANT ALL PRIVILEGES ON DATABASE strikezone_db TO strikezone;
\q
EOF
```

### 3. Clone and Setup Project

```bash
# Clone repository
cd /opt
sudo git clone https://github.com/your-repo/strikezone-automation.git
sudo chown -R $USER:$USER strikezone-automation
cd strikezone-automation/phase1-app

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 4. Configure Environment

```bash
# Backend configuration
cat > /opt/strikezone-automation/phase1-app/backend/.env << 'EOF'
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=strikezone_db
DB_USER=strikezone
DB_PASSWORD=your_secure_password

# Server
PORT=5002
NODE_ENV=production

# API Keys (set your actual keys)
OPENAI_API_KEY=your_openai_key
APOLLO_API_KEY=your_apollo_key

# JWT Secret (generate a secure random string)
JWT_SECRET=your_very_secure_jwt_secret_at_least_32_chars

# Frontend URL (for CORS)
FRONTEND_URL=http://YOUR_VPS_IP:5000
EOF
```

### 5. Initialize Database

```bash
cd /opt/strikezone-automation/phase1-app/backend

# Import schema
PGPASSWORD=your_secure_password psql -h localhost -U strikezone -d strikezone_db -f database_schema.sql

# Or import from individual schema files
PGPASSWORD=your_secure_password psql -h localhost -U strikezone -d strikezone_db -f src/models/schema.sql
PGPASSWORD=your_secure_password psql -h localhost -U strikezone -d strikezone_db -f src/models/auth_schema.sql
PGPASSWORD=your_secure_password psql -h localhost -U strikezone -d strikezone_db -f src/models/phase2_schema.sql
PGPASSWORD=your_secure_password psql -h localhost -U strikezone -d strikezone_db -f src/models/phase3_schema.sql
PGPASSWORD=your_secure_password psql -h localhost -U strikezone -d strikezone_db -f src/models/phase4_schema.sql
PGPASSWORD=your_secure_password psql -h localhost -U strikezone -d strikezone_db -f src/models/cagr_schema.sql

# Create admin user
node src/scripts/createAdmin.js
```

### 6. Configure Frontend API URL

```bash
# Edit frontend config to point to your VPS IP
cat > /opt/strikezone-automation/phase1-app/frontend/src/utils/api.js << 'EOF'
const API_URL = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' 
    ? 'http://localhost:5002' 
    : `http://${window.location.hostname}:5002`)
  : 'http://localhost:5002';

export function getApiUrl() {
  return API_URL;
}
EOF
```

### 7. Build Frontend for Production

```bash
cd /opt/strikezone-automation/phase1-app/frontend
npm run build
```

### 8. Start Services with PM2

```bash
# Start backend
cd /opt/strikezone-automation/phase1-app/backend
pm2 start src/server.js --name strikezone-backend

# Start frontend (production mode)
cd /opt/strikezone-automation/phase1-app/frontend
pm2 start npm --name strikezone-frontend -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 9. Configure Nginx Reverse Proxy (Recommended)

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/strikezone << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/strikezone /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 10. Configure Firewall

```bash
# Allow HTTP, HTTPS, and application ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5000/tcp  # Frontend (if not using Nginx)
sudo ufw allow 5002/tcp  # Backend API (if not using Nginx)
sudo ufw enable
```

---

## Direct IP Access (Without Nginx)

If you want to access directly via IP without Nginx:

### 1. Update Backend to Allow External Connections

The server.js already listens on `0.0.0.0`, so it's accessible externally.

### 2. Update Frontend to Allow External Connections

```bash
# Edit next.config.js to allow external access
cat >> /opt/strikezone-automation/phase1-app/frontend/next.config.js << 'EOF'

// Allow external access
module.exports = {
  ...module.exports,
  hostname: '0.0.0.0',
}
EOF
```

### 3. Start Services

```bash
# Backend - already listens on 0.0.0.0
cd /opt/strikezone-automation/phase1-app/backend
pm2 start src/server.js --name strikezone-backend

# Frontend with external binding
cd /opt/strikezone-automation/phase1-app/frontend
pm2 start npm --name strikezone-frontend -- start -- -H 0.0.0.0 -p 5000
```

### 4. Access via IP

- **Frontend:** `http://YOUR_VPS_IP:5000`
- **Backend API:** `http://YOUR_VPS_IP:5002/api/health`

---

## SSL/HTTPS Setup (Recommended for Production)

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

---

## Migrate Local Database to VPS

### Export from Local

```bash
# Export schema only (for fresh install)
PGPASSWORD=postgres pg_dump -h localhost -U postgres -d strikezone_db --schema-only > database_schema.sql

# Export with data (full backup)
PGPASSWORD=postgres pg_dump -h localhost -U postgres -d strikezone_db > database_full.sql
```

### Import to VPS

```bash
# Copy file to VPS
scp database_schema.sql user@YOUR_VPS_IP:/tmp/

# On VPS - import schema only
PGPASSWORD=your_secure_password psql -h localhost -U strikezone -d strikezone_db -f /tmp/database_schema.sql

# Or import full backup
PGPASSWORD=your_secure_password psql -h localhost -U strikezone -d strikezone_db -f /tmp/database_full.sql
```

---

## Monitoring and Management

### View Logs
```bash
# PM2 logs
pm2 logs

# Backend logs
pm2 logs strikezone-backend

# Frontend logs
pm2 logs strikezone-frontend
```

### Restart Services
```bash
pm2 restart all
# or individually
pm2 restart strikezone-backend
pm2 restart strikezone-frontend
```

### Check Status
```bash
pm2 status
```

### Update Application
```bash
cd /opt/strikezone-automation
git pull

# Reinstall dependencies if needed
cd phase1-app/backend && npm install
cd ../frontend && npm install && npm run build

# Restart services
pm2 restart all
```

---

## Quick Start Script

Create a deploy script:

```bash
#!/bin/bash
# deploy.sh - Quick deploy script

set -e

echo "=== Strikezone VPS Deployment ==="

# Pull latest code
cd /opt/strikezone-automation
git pull

# Install dependencies
cd phase1-app/backend && npm install
cd ../frontend && npm install && npm run build

# Restart services
pm2 restart all

echo "=== Deployment Complete ==="
pm2 status
```

---

## Current Database Stats (Reference)

| Table | Count |
|-------|-------|
| Targets | 34 |
| Contacts | 8 |
| Messages | 8 |
| Customers | 120 |
| Orders | 2,837 |

### Sample Targets:
- ID 2: PBI Export Example Inc (approved)
- ID 14: PowerBI CSV Example LLC (approved)
- ID 50: Global Solutions 25 (pending_review)

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :5002

# Kill process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connectivity
psql -h localhost -U strikezone -d strikezone_db -c "SELECT 1;"
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```
