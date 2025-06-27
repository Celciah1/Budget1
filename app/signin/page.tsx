import { neon } from '@neondatabase/serverless';

export default function Page() {
  async function create(formData: FormData) {
    'use server';
    const sql = neon(`${process.env.DATABASE_URL}`);

    const username = formData.get('username')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();
    const confirmPassword = formData.get('confirmPassword')?.toString();
    const phone = formData.get('phone')?.toString().trim();

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!emailRegex.test(email || '')) {
      throw new Error('Invalid email format.');
    }

    if (!phoneRegex.test(phone || '')) {
      throw new Error('Phone number must be 10 digits.');
    }

    if ((password || '').length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    await sql`
      INSERT INTO users_signup (username, email, password, phone)
      VALUES (${username}, ${email}, ${password}, ${phone})
    `;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
      <form
        action={create}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Sign Up</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password (min 6 chars)"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number (10 digits)"
          pattern="[0-9]{10}"
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
