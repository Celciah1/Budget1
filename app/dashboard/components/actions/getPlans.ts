'use server';

import pool from '@/lib/db';

export async function getPlans() {
  const plansRes = await pool.query('SELECT * FROM budget_plans ORDER BY id DESC');
  const plans = plansRes.rows;

  // Fetch payments for each plan
  for (const plan of plans) {
    const paymentsRes = await pool.query(
      'SELECT * FROM plan_payments WHERE plan_id = $1',
      [plan.id]
    );
    plan.payments = paymentsRes.rows;
  }

  return plans;
}
