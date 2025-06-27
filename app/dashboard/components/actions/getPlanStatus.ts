'use server';

import pool from '@/lib/db';

export async function getPlanStatus() {
  const result = await pool.query(`
    SELECT 
      bp.id AS plan_id,
      bp.plan_name,
      bp.total_amount,
      bp.monthly_amount,
      bp.start_date,
      bp.end_date,
      pp.payment_month,
      pp.status
    FROM budget_plans bp
    LEFT JOIN plan_payments pp ON bp.id = pp.plan_id
    ORDER BY bp.id, pp.payment_month
  `);

  return result.rows;
}
