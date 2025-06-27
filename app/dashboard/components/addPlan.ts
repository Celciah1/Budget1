// app/actions/addPlan.ts
'use server';

import { neon } from '@neondatabase/serverless';

export async function addPlan(formData: FormData) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const planName = formData.get('planName')?.toString();
  const startDate = formData.get('startDate')?.toString();
  const endDate = formData.get('endDate')?.toString();
  const totalAmount = formData.get('totalAmount')?.toString();
  const monthlyAmount = formData.get('monthlyAmount')?.toString();

  if (!planName || !startDate || !endDate || !totalAmount || !monthlyAmount ) {
    throw new Error('Missing fields');
  }

  await sql`
    INSERT INTO budget_plans (plan_name, start_date, end_date, total_amount, monthly_amount)
    VALUES (${planName}, ${startDate}, ${endDate}, ${totalAmount}, ${monthlyAmount})
  `;
}
