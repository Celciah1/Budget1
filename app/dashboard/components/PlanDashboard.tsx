'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pool } from '@neondatabase/serverless';
import { useRouter } from 'next/navigation';

interface Plan {
  id: number;
  plan_name: string;
  start_date: string;
  end_date: string;
  monthly_payment: number;
  total_amount: number;
  amount_paid: number;
  is_active: boolean;
  last_payment_date?: string;
  created_at: string;
  payment_history?: Array<{
    id: number;
    amount: number;
    payment_date: string;
    created_at: string;
  }>;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function query(sql: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

export default function PlanDashboard() {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  
  // New plan form state
  const [newPlan, setNewPlan] = useState({
    plan_name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    monthly_payment: '',
    total_amount: ''
  });

  const router = useRouter();

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await query(`
        SELECT 
          p.*,
          json_agg(
            json_build_object(
              'id', ph.id,
              'amount', ph.amount,
              'payment_date', ph.payment_date,
              'created_at', ph.created_at
            ) ORDER BY ph.payment_date DESC
          ) FILTER (WHERE ph.id IS NOT NULL) as payment_history
        FROM plans p
        LEFT JOIN payment_history ph ON p.id = ph.plan_id
        WHERE p.is_active = true
        GROUP BY p.id
        ORDER BY p.end_date ASC
      `);
      
      const parsedPlans = result.rows.map(plan => ({
        ...plan,
        monthly_payment: Number(plan.monthly_payment),
        total_amount: Number(plan.total_amount),
        amount_paid: Number(plan.amount_paid),
        payment_history: plan.payment_history || []
      }));
      
      setPlans(parsedPlans);
      setError(null);
    } catch (err) {
      console.error('Database error:', err);
      setError('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleAddPayment = async () => {
    if (!selectedPlan || !paymentAmount || !paymentDate) {
      setError('Please fill all payment details');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    setLoading(true);
    try {
      await query('BEGIN');
      
      // Update plan with payment
      const newAmountPaid = selectedPlan.amount_paid + amount;
      await query(
        'UPDATE plans SET amount_paid = $1, last_payment_date = $2 WHERE id = $3',
        [newAmountPaid, paymentDate, selectedPlan.id]
      );

      // Record payment in history
      await query(
        'INSERT INTO payment_history (plan_id, amount, payment_date) VALUES ($1, $2, $3)',
        [selectedPlan.id, amount, paymentDate]
      );

      await query('COMMIT');
      await fetchPlans();
      setShowPaymentModal(false);
      setPaymentAmount('');
      setError(null);
    } catch (err) {
      await query('ROLLBACK');
      console.error('Payment failed:', err);
      setError('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewPlan = async () => {
    if (!newPlan.plan_name || !newPlan.start_date || !newPlan.end_date || 
        !newPlan.monthly_payment || !newPlan.total_amount) {
      setError('Please fill all plan details');
      return;
    }

    const monthly = parseFloat(newPlan.monthly_payment);
    const total = parseFloat(newPlan.total_amount);
    
    if (isNaN(monthly) || monthly <= 0 || isNaN(total) || total <= 0) {
      setError('Please enter valid payment amounts');
      return;
    }

    if (new Date(newPlan.start_date) > new Date(newPlan.end_date)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      await query(
        `INSERT INTO plans (
          plan_name, 
          start_date, 
          end_date, 
          monthly_payment, 
          total_amount,
          amount_paid,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, 0, true)`,
        [
          newPlan.plan_name,
          newPlan.start_date,
          newPlan.end_date,
          monthly,
          total
        ]
      );
      await fetchPlans();
      setShowNewPlanModal(false);
      setNewPlan({
        plan_name: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        monthly_payment: '',
        total_amount: ''
      });
      setError(null);
    } catch (err) {
      console.error('Failed to create plan:', err);
      setError('Failed to create new plan');
    } finally {
      setLoading(false);
    }
  };

  const getProgressData = (plan: Plan) => {
    const paid = plan.amount_paid;
    const total = plan.total_amount;
    const remaining = Math.max(0, total - paid);
    const progress = Math.min(100, (paid / total) * 100);
    const monthsPaid = Math.floor(paid / plan.monthly_payment);
    const totalMonths = Math.ceil(total / plan.monthly_payment);

    return {
      paid,
      total,
      remaining,
      progress,
      monthsPaid,
      totalMonths,
      completion: `${monthsPaid}/${totalMonths} months`
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Payment Plans Dashboard</h1>
        
        {/* Navigation Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 font-medium ${activeTab === 'plans' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            My Plans
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 font-medium ${activeTab === 'status' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Status Overview
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p>Loading...</p>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Payment Plans</h2>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setShowNewPlanModal(true)}
              >
                Add New Plan
              </button>
            </div>
            
            {plans.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500 mb-4">No active payment plans found</p>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => setShowNewPlanModal(true)}
                >
                  Create Your First Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => {
                  const progress = getProgressData(plan);
                  return (
                    <div key={plan.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold">{plan.plan_name}</h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(plan.start_date)} - {formatDate(plan.end_date)}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Paid: {formatCurrency(progress.paid)}</span>
                          <span>Total: {formatCurrency(progress.total)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              progress.progress >= 90 ? 'bg-green-500' :
                              progress.progress >= 50 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`} 
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Monthly Payment</p>
                          <p className="font-medium">{formatCurrency(plan.monthly_payment)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Remaining</p>
                          <p className="font-medium">{formatCurrency(progress.remaining)}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowPaymentModal(true);
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Add Payment
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Status Overview Tab */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Payment Status Overview</h2>
            
            {plans.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500">No active plans to display</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-700">Total Plans</p>
                      <p className="text-2xl font-bold">{plans.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-700">Total Paid</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(plans.reduce((sum, plan) => sum + plan.amount_paid, 0))}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-700">Total Remaining</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(plans.reduce((sum, plan) => sum + (plan.total_amount - plan.amount_paid), 0))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-semibold mb-4">Plan Progress</h3>
                  <div className="space-y-6">
                    {plans.map(plan => {
                      const progress = getProgressData(plan);
                      return (
                        <div key={plan.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{plan.plan_name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              progress.progress >= 90 ? 'bg-green-100 text-green-800' :
                              progress.progress >= 50 ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {progress.progress.toFixed(0)}% Complete
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full ${
                                progress.progress >= 90 ? 'bg-green-500' :
                                progress.progress >= 50 ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`} 
                              style={{ width: `${progress.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>{progress.completion}</span>
                            <span>{formatCurrency(progress.paid)} of {formatCurrency(progress.total)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Payment for {selectedPlan.plan_name}</h3>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPayment}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {loading ? 'Processing...' : 'Submit Payment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Plan Modal */}
        {showNewPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Create New Payment Plan</h3>
                <button 
                  onClick={() => setShowNewPlanModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={newPlan.plan_name}
                    onChange={(e) => setNewPlan({...newPlan, plan_name: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Car Loan, Mortgage"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newPlan.start_date}
                      onChange={(e) => setNewPlan({...newPlan, start_date: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newPlan.end_date}
                      onChange={(e) => setNewPlan({...newPlan, end_date: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                      min={newPlan.start_date}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment ($)</label>
                    <input
                      type="number"
                      value={newPlan.monthly_payment}
                      onChange={(e) => setNewPlan({...newPlan, monthly_payment: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
                    <input
                      type="number"
                      value={newPlan.total_amount}
                      onChange={(e) => setNewPlan({...newPlan, total_amount: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowNewPlanModal(false)}
                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewPlan}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
                  >
                    {loading ? 'Creating...' : 'Create Plan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}