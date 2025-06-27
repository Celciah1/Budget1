// scripts/test-db.ts
require('dotenv').config(); // if you're using env variables
import pool from '@/lib/db';

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected at:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Connection failed:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
