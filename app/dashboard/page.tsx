'use client';

import { useState } from 'react';
import AddPlanForm from './components/AddPlanForm';
import ExistingPlans from './components/ExistingPlans';
import PlanStatus from './components/planStatus';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('existing');

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-6">📊 Budget Planner</h2>
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => setActiveTab('existing')}
              className={`w-full text-left p-2 rounded-lg hover:bg-blue-100 ${activeTab === 'existing' && 'bg-blue-200'}`}
            >
              🗂️ Existing Plans
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('add')}
              className={`w-full text-left p-2 rounded-lg hover:bg-blue-100 ${activeTab === 'add' && 'bg-blue-200'}`}
            >
              ➕ Add New Plan
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('deadlines')}
              className={`w-full text-left p-2 rounded-lg hover:bg-blue-100 ${activeTab === 'deadlines' && 'bg-blue-200'}`}
            >
              ⏰ Plan Deadlines
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('status')}
              className={`w-full text-left p-2 rounded-lg hover:bg-blue-100 ${activeTab === 'status' && 'bg-blue-200'}`}
            >
              📈 Plan Status
            </button>
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-8">
        {activeTab === 'existing' && <ExistingPlans />}
        {activeTab === 'add' && <AddPlanForm />}
        {activeTab === 'status' && <PlanStatus />}
      </main>
    </div>
  );
}
