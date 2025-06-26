'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Our App</h1>
        <p className="text-gray-600 mb-8">Please sign in or log in to continue</p>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/signin')}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
