'use server';

import pool from '@/lib/db'; 
export async function getPlans() {
  try {
    const res = await pool.query(`SELECT id, plan_name, start_date, end_date, total_amount, monthly_amount 
      FROM budget_plans 
      ORDER BY start_date ASC`);
    return res.rows;
  } catch (error) {
    console.error('Error fetching plans:', error);
    return []; 
  }
}
