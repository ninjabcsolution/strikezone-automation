/**
 * Create or reset the admin user with a valid password hash
 * Run: node src/scripts/createAdmin.js
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'strikezone_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 1,
  });

  const adminEmail = 'admin@strikezone.io';
  const adminPassword = 'admin123';
  const adminName = 'System Admin';

  try {
    console.log('🔐 Creating admin user...');
    
    // Generate proper bcrypt hash
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    console.log(`   Password hash generated for: ${adminPassword}`);

    // Upsert admin user
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, full_name, company_name, role, status)
      VALUES ($1, $2, $3, 'Strikezone', 'admin', 'active')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $2,
        full_name = $3,
        role = 'admin',
        status = 'active',
        updated_at = CURRENT_TIMESTAMP
      RETURNING user_id, email, role, status
    `, [adminEmail, passwordHash, adminName]);

    console.log('✓ Admin user created/updated:');
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role: ${result.rows[0].role}`);
    console.log(`   Status: ${result.rows[0].status}`);
    
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
