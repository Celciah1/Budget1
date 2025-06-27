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
  paid_at?: string | Date;
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
    paid_at?: string;
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
            paid_at: row.paid_at ? String(row.paid_at) : '', // FIX: ensure it's a string
          });
        }
      });

      setPlans(Object.values(grouped));
    }

    fetchData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Plan Summary</h1>

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
            const allMonths = generateMonths(plan.start_date, plan.end_date);
            const paidMonths = plan.payments.filter((p) => p.status === 'Paid').length;
            const balanceAmount = paidMonths * plan.monthly_amount;
            const remainingAmount = plan.total_amount - balanceAmount;
            const status = remainingAmount <= 0 ? 'Completed' : 'In Progress';

            return (
              <React.Fragment key={plan.plan_id}>
                <tr className="border-t hover:bg-gray-50">
                  <td className="p-2">{plan.plan_id}</td>
                  <td className="p-2">{plan.plan_name}</td>
                  <td className="p-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="p-2 text-center">₹{balanceAmount.toFixed(2)}</td>
                  <td className="p-2 text-center">₹{remainingAmount.toFixed(2)}</td>
                </tr>

                {/* Monthly Payment Breakdown */}
                <tr>
                  <td colSpan={5} className="p-2 bg-gray-50">
                    <table className="w-full text-xs border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-1 text-left">Month</th>
                          <th className="p-1 text-left">Status</th>
                          <th className="p-1 text-left">Paid At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allMonths.map((month) => {
                          const payment = plan.payments.find((p) => p.payment_month === month);
                          const monthStatus = payment?.status || 'Not Paid';
                          const paidAt = payment?.paid_at
                            ? dayjs(payment.paid_at).format('YYYY-MM-DD')
                            : '-';

                          return (
                            <tr key={month} className="border-t">
                              <td className="p-1">{month}</td>
                              <td className="p-1">{monthStatus}</td>
                              <td className="p-1">{paidAt}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function generateMonths(start: string, end: string): string[] {
  const months: string[] = [];
  let current = dayjs(start).startOf('month');
  const last = dayjs(end).startOf('month');

  while (current.isBefore(last) || current.isSame(last)) {
    months.push(current.format('YYYY-MM'));
    current = current.add(1, 'month');
  }

  return months;
}
