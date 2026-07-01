import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingUp, Users, CreditCard, BarChart3, PieChart, Activity } from 'lucide-react';

export default function AdminFinanceDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRows, subs] = await Promise.all([
          base44.entities.SubscriptionOrder.list('-created_date', 500),
          base44.entities.Subscription.filter({ status: 'active' })
        ]);
        setOrders(orderRows || []);
        setActiveSubscriptions(subs?.length || 0);
      } catch (err) {
        console.error('Error fetching finance data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v || 0);
  const getDate = (o) => new Date(o.created_at || o.created_date);

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const now = new Date();
  const monthlyRevenue = completedOrders
    .filter(o => { const d = getDate(o); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const statCards = [
    { label: 'Total Revenue', value: fmt(totalRevenue), icon: DollarSign },
    { label: 'This Month', value: fmt(monthlyRevenue), icon: TrendingUp },
    { label: 'Total Transactions', value: orders.length.toLocaleString(), icon: CreditCard },
    { label: 'Active Subscriptions', value: activeSubscriptions, icon: Users },
  ];

  // Last 6 months revenue trend
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: d.toLocaleString('en-US', { month: 'short' }), year: d.getFullYear(), monthIndex: d.getMonth() };
  });
  const monthlyChart = months.map(m => ({
    month: m.month,
    revenue: completedOrders
      .filter(o => { const d = getDate(o); return d.getMonth() === m.monthIndex && d.getFullYear() === m.year; })
      .reduce((sum, o) => sum + (o.amount || 0), 0)
  }));
  const maxRevenue = Math.max(...monthlyChart.map(m => m.revenue), 1);

  // Revenue by payment method
  const bySource = {};
  completedOrders.forEach(o => {
    const key = o.payment_method || 'card';
    bySource[key] = (bySource[key] || 0) + (o.amount || 0);
  });
  const revenueBySource = Object.entries(bySource)
    .map(([source, amount]) => ({ source, amount, percentage: totalRevenue ? (amount / totalRevenue) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const statusBadge = (status) => {
    const map = { completed: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-600' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track revenue, transactions, and subscriptions</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
            <div className="p-2 bg-gray-100 rounded-lg w-fit mb-3"><Icon className="w-4 h-4 text-gray-600" /></div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" />Monthly Revenue</h3>
          <div className="h-40 flex items-end gap-2">
            {monthlyChart.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-black rounded-t" style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: 4 }} />
                <div className="text-xs text-gray-400">{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4" />Revenue by Payment Method</h3>
          {revenueBySource.length === 0 && <p className="text-sm text-gray-400">No completed transactions yet</p>}
          <div className="space-y-3">
            {revenueBySource.map(s => (
              <div key={s.source}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span className="font-medium capitalize">{s.source}</span>
                  <span>{fmt(s.amount)} ({s.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-black" style={{ width: `${s.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Activity className="w-4 h-4" />Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No transactions yet</td></tr>
              )}
              {orders.slice(0, 15).map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-700">
                    <div className="font-medium">{o.user_name || o.user_email}</div>
                    <div className="text-xs text-gray-400">{o.user_email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{o.package_name}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{fmt(o.amount)}</td>
                  <td className="px-4 py-3">{statusBadge(o.status)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{getDate(o).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}