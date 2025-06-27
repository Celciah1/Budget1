'use client';

import React, { useEffect, useState } from 'react';
import { getPlanStatus } from './actions/getPlanStatus';
import dayjs from 'dayjs';

interface PlanPaymentStatus {
  plan_id: number;
  plan_name: string;
  total_amount: string;
  monthly_amount: string;
  start_date: string;
  end_date: string;
  payment_month: string;
  status: string;
  paid_at?: string | null;
}

interface GroupedPlan {
  plan_id: number;
  plan_name: string;
  total_amount: number;
  monthly_amount: number;
  start_date: string;
  end_date: string;
  payments: {
    payment_month: string;
    status: string;
    paid_at?: string | null;
  }[];
}

export default function PlanStatus() {
  const [plans, setPlans] = useState<GroupedPlan[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data: PlanPaymentStatus[] = await getPlanStatus();

      const grouped: Record<number, GroupedPlan> = {};

      data.forEach((row) => {
        const planId = row.plan_id;

        if (!grouped[planId]) {
          grouped[planId] = {
            plan_id: planId,
            plan_name: row.plan_name,
            total_amount: parseFloat(row.total_amount),
            monthly_amount: parseFloat(row.monthly_amount),
            start_date: row.start_date,
            end_date: row.end_date,
            payments: [],
          };
        }

        if (row.payment_month) {
          grouped[planId].payments.push({
            payment_month: row.payment_month,
            status: row.status || 'Not Paid',
            paid_at: row.paid_at,
          });
        }
      });

      setPlans(Object.values(grouped));
    }

    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Plan Summary</h2>
      <table className="w-full border text-sm shadow rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Plan ID</th>
            <th className="p-2 text-left">Plan Name</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Balance Paid (₹)</th>
            <th className="p-2 text-center">Remaining (₹)</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => {
            const paidMonths = plan.payments.filter(p => p.status === 'Paid').length;
            const balanceAmount = paidMonths * plan.monthly_amount;
            const remainingAmount = plan.total_amount - balanceAmount;
            const status = remainingAmount <= 0 ? 'Completed' : 'In Progress';

            return (
              <React.Fragment key={plan.plan_id}>
                <tr className="border-t hover:bg-gray-50">
                  <td className="p-2">{plan.plan_id}</td>
                  <td className="p-2">{plan.plan_name}</td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-1 rounded text-white ${status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                      {status}
                    </span>
                  </td>
                  <td className="p-2 text-center">₹{balanceAmount.toFixed(2)}</td>
                  <td className="p-2 text-center">₹{remainingAmount.toFixed(2)}</td>
                </tr>

                {plan.payments.map((p, i) => (
                  <tr key={`${plan.plan_id}-${i}`} className="border-t bg-gray-50">
                    <td colSpan={2} className="p-2 pl-8 text-sm text-gray-700">
                      Month: {p.payment_month}
                    </td>
                    <td className="p-2 text-center">
                      {p.status === 'Paid' ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <span className="text-red-500">Not Paid</span>
                      )}
                    </td>
                    <td colSpan={2} className="p-2 text-sm text-center">
                      {p.paid_at ? dayjs(p.paid_at).format('YYYY-MM-DD hh:mm A') : '—'}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
