'use server';

import pool from '@/lib/db';

export async function updatePlanPayment(planId: number, month: string, isPaid: boolean) {
  const status = isPaid ? 'Paid' : 'Not Paid';

  const existing = await pool.query(
    'SELECT * FROM plan_payments WHERE plan_id = $1 AND payment_month = $2',
    [planId, month]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      'UPDATE plan_payments SET status = $1 WHERE plan_id = $2 AND payment_month = $3',
      [status, planId, month]
    );
  } else {
    await pool.query(
      'INSERT INTO plan_payments (plan_id, payment_month, status) VALUES ($1, $2, $3)',
      [planId, month, status]
    );
  }
}
