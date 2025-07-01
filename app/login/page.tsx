'use client';

import { useActionState, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from './action';

interface LoginState {
  error?: string;
  success?: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [state, formAction] = useActionState<LoginState, FormData>(async (prevState, formData) => {
    setIsPending(true);
    try {
      const result = await loginAction(prevState, formData);
      if (result.success) {
        setShouldRedirect(true);
      }
      return result;
    } finally {
      setIsPending(false);
    }
  }, {});

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/dashboard');
    }
  }, [shouldRedirect, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-200 via-blue-200 to-purple-200">
      <form
        action={formAction}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>

        {state.error && (
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
          disabled={isPending}
          className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition ${
            isPending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}