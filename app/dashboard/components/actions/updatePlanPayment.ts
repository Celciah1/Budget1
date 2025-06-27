'use server';

import pool from '@/lib/db';

/**
 * Updates or inserts a plan payment status for a specific month.
 *
 * @param planId - The ID of the plan
 * @param month - Month in format YYYY-MM or YYYY-MM-DD
 * @param isPaid - Boolean flag to mark as paid (true) or not paid (false)
 */
export async function updatePlanPayment(planId: number, month: string, isPaid: boolean) {
  const status = isPaid ? 'Paid' : 'Not Paid';

  // Normalize month to full YYYY-MM-DD format (e.g., "2025-06" -> "2025-06-01")
  const formattedMonth = /^\d{4}-\d{2}$/.test(month)
    ? `${month}-01`
    : month;

  try {
    const existing = await pool.query(
      'SELECT 1 FROM plan_payments WHERE plan_id = $1 AND payment_month = $2',
      [planId, formattedMonth]
    );

    if (existing.rows.length > 0) {
      // If record exists, update it
      await pool.query(
        'UPDATE plan_payments SET status = $1 WHERE plan_id = $2 AND payment_month = $3',
        [status, planId, formattedMonth]
      );
    } else {
      // If not, insert a new record
      await pool.query(
        'INSERT INTO plan_payments (plan_id, payment_month, status) VALUES ($1, $2, $3)',
        [planId, formattedMonth, status]
      );
    }
  } catch (error) {
    console.error('Error updating plan payment:', error);
    throw new Error('Failed to update payment status');
  }
}
