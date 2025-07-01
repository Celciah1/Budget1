'use server';

import { neon } from '@neondatabase/serverless';

interface LoginResult {
  error?: string;
  success?: boolean;
}

export async function loginAction(prevState: LoginResult, formData: FormData): Promise<LoginResult> {
  const sql = neon(process.env.DATABASE_URL!);

  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'Missing credentials', success: false };
  }

  try {
    const result = await sql`
      SELECT * FROM users_signup 
      WHERE email = ${email} AND password = ${password}
    `;

    return result.length > 0 
      ? { success: true } 
      : { error: 'Invalid email or password', success: false };
    
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login', success: false };
  }
}