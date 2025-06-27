// app/api/signin/route.ts
{/*import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { full_name, email, phone, password, confirm_password, address, dob } = data;

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone, password, confirm_password, address, dob)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [full_name, email, phone, password, confirm_password, address, dob]
    );

    return NextResponse.json({ success: true, user: result.rows[0] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}*/}
