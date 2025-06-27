'use client';

import { useState } from 'react';
import { addPlan } from './addPlan';

export default function AddPlanForm() {
  const [message, setMessage] = useState('');

  async function handleSubmit(formData: FormData) {
    try {
      await addPlan(formData);
      setMessage('✅ Plan added successfully!');
    } catch  {
      setMessage('❌ Error adding plan');
    }
  }

  return (
    <form
      action={handleSubmit}
      className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl mx-auto space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 text-center">Add New Budget Plan</h2>

      {message && <p className="text-center text-sm text-green-600">{message}</p>}

      {/* Plan Name */}
      <div>
        <label htmlFor="planName" className="block text-sm font-semibold mb-1">
          Plan Name
        </label>
        <input
          id="planName"
          type="text"
          name="planName"
          placeholder="Enter plan name"
          required
          className="w-full border px-4 py-2 rounded-lg"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-semibold mb-1">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            name="startDate"
            required
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-semibold mb-1">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            name="endDate"
            required
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="totalAmount" className="block text-sm font-semibold mb-1">
            Total Amount
          </label>
          <input
            id="totalAmount"
            type="number"
            name="totalAmount"
            placeholder="Total amount"
            required
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>
        <div>
          <label htmlFor="monthlyAmount" className="block text-sm font-semibold mb-1">
            Per Month Amount
          </label>
          <input
            id="monthlyAmount"
            type="number"
            name="monthlyAmount"
            placeholder="Monthly amount"
            required
            className="w-full border px-4 py-2 rounded-lg"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Add Plan
      </button>
    </form>
  );
}
