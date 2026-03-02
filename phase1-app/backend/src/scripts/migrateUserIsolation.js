#!/usr/bin/env node
/**
 * Migration script to add user_id columns to all data tables
 * for multi-tenant data isolation.
 * 
 * Run: node src/scripts/migrateUserIsolation.js
 */

const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting user isolation migration...\n');
    
    // Read and execute the migration SQL
    const sqlPath = path.join(__dirname, '../models/user_isolation_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✓ Executed statement successfully');
      } catch (err) {
        // Some statements may fail if column already exists, that's OK
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log('⚠ Skipped (already exists):', err.message.slice(0, 50));
        } else {
          console.error('✗ Error:', err.message);
        }
      }
    }
    
    // Verify the migration
    console.log('\n--- Verifying migration ---');
    
    const tables = ['customers', 'products', 'orders', 'order_lines', 'customer_metrics', 'ingestion_logs'];
    for (const table of tables) {
      try {
        const result = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = 'user_id'
        `, [table]);
        
        if (result.rows.length > 0) {
          console.log(`✓ ${table}: user_id column exists`);
        } else {
          console.log(`✗ ${table}: user_id column NOT found`);
        }
      } catch (err) {
        console.log(`? ${table}: Could not verify - ${err.message}`);
      }
    }
    
    console.log('\n✅ Migration complete!');
    console.log('\nIMPORTANT: Existing data does not have user_id set.');
    console.log('Users will need to re-upload their data to associate it with their account.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
