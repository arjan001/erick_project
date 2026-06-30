import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Users, CreditCard, Download, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Activity } from 'lucide-react';

export default function AdminFinanceDashboardPage() {
  const { success, error } = useToast();
  const [timeRange, setTimeRange] = useState('30d');

  const revenueData = {
    totalRevenue: 125430.50, revenueChange: 12.5,
    monthlyRevenue: 42500.00, monthlyChange: 8.3,
    totalTransactions: 1243, transactionsChange: 15.2,
    activeSubscriptions: 234, subscriptionsChange: 18.7
  };

  const recentTransactions = [
    { id: 1, user: 'john@example.com', amount: 250.00, type: 'payment', status: 'completed', date: '2026-06-28T10:30:00', description: 'Premium Plan' },
    { id: 2, user: 'jane@example.com', amount: 99.00, type: 'payment', status: 'completed', date: '2026-06-28T09:15:00', description: 'Basic Plan' },
    { id: 3, user: 'mike@example.com', amount: 150.00, type: 'refund', status: 'completed', date: '2026-06-27T16:45:00', description: 'Refund Request' },
    { id: 4, user: 'sarah@example.com', amount: 499.00, type: 'payment', status: 'pending', date: '2026-06-27T14:20:00', description: 'Enterprise Plan' },
    { id: 5, user: 'tom@example.com', amount: 199.00, type: 'payment', status: 'completed', date: '2026-06-26T11:00:00', description: 'Pro Plan' },
  ];

  const revenueBySource = [
    { source: 'Stripe', amount: 85430.50, percentage: 68.1, color: '#1a1a1a' },
    { source: 'PayPal', amount: 28500.00, percentage: 22.7, color: '#6b7280' },
    { source: 'Bank Transfer', amount: 11500.00, percentage: 9.2, color: '#d1d5db' },
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 32000 }, { month: 'Feb', revenue: 35000 },
    { month: 'Mar', revenue: 38000 }, { month: 'Apr', revenue: 36500 },
    { month: 'May', revenue: 41000 }, { month: 'Jun', revenue: 42500 },
  ];
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  const statusBadge = (status) => {
    const map = { completed: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-700', refunded: 'bg-gray-100 text-gray-600' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
  };

  const statCards = [
    { label: 'Total Revenue', value: fmt(revenueData.totalRevenue), change: revenueData.revenueChange, icon: DollarSign },
    { label: 'Monthly Revenue', value: fmt(revenueData.monthlyRevenue), change: revenueData.monthlyChange, icon: TrendingUp },
    { label: 'Total Transactions', value: revenueData.totalTransactions.toLocaleString(), change: revenueData.transactionsChange, icon: CreditCard },
    { label: 'Active Subscriptions', value: revenueData.activeSubscriptions, change: revenueData.subscriptionsChange, icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track revenue, transactions, and performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black bg-white">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => success('Exported', 'Report exported')}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, change, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-gray-100 rounded-lg"><Icon className="w-4 h-4 text-gray-600" /></div>
              <div className={`flex items-center text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {Math.abs(change)}%
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" />Monthly Revenue</h3>
          <div className="h-40 flex items-end gap-2">
            {monthlyRevenue.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-black rounded-t" style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: 4 }} />
                <div className="text-xs text-gray-400">{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4" />Revenue by Source</h3>
          <div className="space-y-3">
            {revenueBySource.map(s => (
              <div key={s.source}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span className="font-medium">{s.source}</span>
                  <span>{fmt(s.amount)} ({s.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${s.percentage}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Activity className="w-4 h-4" />Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-700">{t.user}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{t.description}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'payment' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.type}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{t.type === 'refund' ? '-' : ''}{fmt(t.amount)}</td>
                  <td className="px-4 py-3">{statusBadge(t.status)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{new Date(t.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}