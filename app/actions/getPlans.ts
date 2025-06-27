'use server';

import pool from '@/lib/db';

export async function getPlans() {
  const res = await pool.query('SELECT * FROM budget_plans ORDER BY start_date ASC');
  return res.rows;
}
