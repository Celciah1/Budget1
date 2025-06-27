'use server';

import { neon } from '@neondatabase/serverless';

export async function loginAction(prevState: unknown, formData: FormData) {
  const sql = neon(`${process.env.DATABASE_URL}`);

  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Missing credentials' };
  }

  const result = await sql`
    SELECT * FROM users_signup WHERE email = ${email} AND password = ${password}
  `;

  if (result.length === 0) {
    return { error: 'Invalid email or password' };
  }
}
