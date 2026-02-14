/*
  Initialize / reset the Strikezone database schema.

  By default this applies `src/models/schema.sql` (Phase 1 tables).
  Use `--all` to also apply `src/models/phase2_schema.sql`.

  NOTE: `schema.sql` contains DROP TABLE statements (destructive).
*/

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

function printHelp() {
  // Keep this short so it’s readable in CI / terminals
  console.log(`\nStrikezone DB Init\n\nUsage:\n  node src/scripts/initDb.js [--all] [--phase2-only] [--help]\n\nOptions:\n  --all          Apply schema.sql then phase2_schema.sql\n  --phase2-only  Apply only phase2_schema.sql (non-destructive IF NOT EXISTS)\n  --help         Show this help\n`);
}

async function applySqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query(sql);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if (args.has('--help') || args.has('-h')) {
    printHelp();
    return;
  }

  const applyAll = args.has('--all');
  const phase2Only = args.has('--phase2-only');

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'strikezone_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 1,
  });

  const schemaV1Path = path.join(__dirname, '../models/schema.sql');
  const schemaV2Path = path.join(__dirname, '../models/phase2_schema.sql');

  const client = await pool.connect();
  try {
    console.log('📦 Initializing database schema...');
    console.log(`   DB: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'strikezone_db'}`);
    console.log(`   User: ${process.env.DB_USER || 'postgres'}`);

    await client.query('BEGIN');

    if (!phase2Only) {
      console.log('   • Applying Phase 1 schema.sql (DESTRUCTIVE: drops tables if they exist)');
      await applySqlFile(client, schemaV1Path);
    }

    if (applyAll || phase2Only) {
      console.log('   • Applying Phase 2 phase2_schema.sql (CREATE TABLE IF NOT EXISTS)');
      await applySqlFile(client, schemaV2Path);
    }

    await client.query('COMMIT');
    console.log('✓ Database schema initialized');
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('⚠️  Rollback failed:', rollbackErr.message);
    }
    console.error('❌ Database init failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
