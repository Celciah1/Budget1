'use client';

import React, { useActionState } from 'react';
import { loginAction } from './action';

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, { error: '' });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-200 via-blue-200 to-purple-200">
      <form
        action={formAction}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        {state?.error && (
          <div className="text-red-600 text-center font-medium">{state.error}</div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
