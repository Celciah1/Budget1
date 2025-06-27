// scripts/test-db.js
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // For Neon or Vercel PostgreSQL with SSL
  },
});

async function testAndInsert() {
  try {
    // Test connection
    const timeRes = await pool.query('SELECT NOW()');
    console.log('✅ Connected at:', timeRes.rows[0].now);

    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        confirm_password TEXT NOT NULL,
        address TEXT,
        dob DATE
      );
    `);

    console.log('✅ Table checked/created');

    // Insert sample users
    const insertQuery = `
      INSERT INTO users (full_name, email, phone, password, confirm_password, address, dob)
      VALUES 
        ('Alice Johnson', 'alice@example.com', '1234567890', 'password123', 'password123', '123 Main St, NY', '1995-04-23'),
        ('Bob Smith', 'bob@example.com', '9876543210', 'bobpass456', 'bobpass456', '456 Oak Ave, CA', '1990-08-15'),
        ('Clara Brown', 'clara@example.com', '5556667777', 'clarapass789', 'clarapass789', '789 Pine Rd, TX', '1992-12-30')
      ON CONFLICT (email) DO NOTHING;
    `;
    await pool.query(insertQuery);

    console.log('✅ Sample users inserted (or already exist)');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}

testAndInsert();
