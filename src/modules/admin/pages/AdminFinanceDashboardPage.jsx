import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, Download, Calendar, ArrowUpRight, ArrowDownRight, Filter, BarChart3, PieChart, Activity } from 'lucide-react';

export default function AdminFinanceDashboardPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 125430.50,
    revenueChange: 12.5,
    monthlyRevenue: 42500.00,
    monthlyChange: 8.3,
    totalTransactions: 1243,
    transactionsChange: 15.2,
    averageOrderValue: 100.85,
    aovChange: -2.1,
    activeSubscriptions: 234,
    subscriptionsChange: 18.7
  });

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, user: 'john@example.com', amount: 250.00, type: 'payment', status: 'completed', date: '2026-06-28T10:30:00', description: 'Premium Plan' },
    { id: 2, user: 'jane@example.com', amount: 99.00, type: 'payment', status: 'completed', date: '2026-06-28T09:15:00', description: 'Basic Plan' },
    { id: 3, user: 'mike@example.com', amount: 150.00, type: 'refund', status: 'completed', date: '2026-06-27T16:45:00', description: 'Refund Request' },
    { id: 4, user: 'sarah@example.com', amount: 499.00, type: 'payment', status: 'pending', date: '2026-06-27T14:20:00', description: 'Enterprise Plan' },
    { id: 5, user: 'tom@example.com', amount: 199.00, type: 'payment', status: 'completed', date: '2026-06-26T11:00:00', description: 'Pro Plan' },
    { id: 6, user: 'lisa@example.com', amount: 75.00, type: 'payment', status: 'failed', date: '2026-06-26T08:30:00', description: 'Basic Plan' }
  ]);

  const [revenueBySource, setRevenueBySource] = useState([
    { source: 'Stripe', amount: 85430.50, percentage: 68.1, color: '#6366f1' },
    { source: 'PayPal', amount: 28500.00, percentage: 22.7, color: '#3b82f6' },
    { source: 'Bank Transfer', amount: 11500.00, percentage: 9.2, color: '#10b981' }
  ]);

  const [monthlyRevenue, setMonthlyRevenue] = useState([
    { month: 'Jan', revenue: 32000 },
    { month: 'Feb', revenue: 35000 },
    { month: 'Mar', revenue: 38000 },
    { month: 'Apr', revenue: 36500 },
    { month: 'May', revenue: 41000 },
    { month: 'Jun', revenue: 42500 }
  ]);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'artist_admin') {
      window.location.href = '/';
      return;
    }
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(false);
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'pending':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'failed':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Failed</span>;
      case 'refunded':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Refunded</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const handleExportReport = async () => {
    try {
      success('Exported', 'Financial report exported successfully');
    } catch (err) {
      console.error('Error exporting report:', err);
      error('Failed', 'Failed to export report');
    }
  };

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

  return (
    <div className="h-screen bg-white">
      <AdminSidebar />
      <main className="fixed inset-0 flex flex-col bg-white pl-20">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
              <p className="text-gray-600 mt-1">Track revenue, transactions, and financial performance</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <Button onClick={handleExportReport} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Revenue Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.totalRevenue)}</div>
                  <div className={`flex items-center text-sm mt-1 ${revenueData.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueData.revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {Math.abs(revenueData.revenueChange)}%
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Monthly Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(revenueData.monthlyRevenue)}</div>
                  <div className={`flex items-center text-sm mt-1 ${revenueData.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueData.monthlyChange >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {Math.abs(revenueData.monthlyChange)}%
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Transactions</div>
                  <div className="text-2xl font-bold text-gray-900">{revenueData.totalTransactions.toLocaleString()}</div>
                  <div className={`flex items-center text-sm mt-1 ${revenueData.transactionsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueData.transactionsChange >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {Math.abs(revenueData.transactionsChange)}%
                  </div>
                </div>
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Active Subscriptions</div>
                  <div className="text-2xl font-bold text-gray-900">{revenueData.activeSubscriptions}</div>
                  <div className={`flex items-center text-sm mt-1 ${revenueData.subscriptionsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueData.subscriptionsChange >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {Math.abs(revenueData.subscriptionsChange)}%
                  </div>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Monthly Revenue
                </h2>
              </div>
              <div className="h-64 flex items-end gap-2">
                {monthlyRevenue.map((data, index) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-black rounded-t transition-all hover:bg-gray-800"
                      style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                    />
                    <div className="text-xs text-gray-500 mt-2">{data.month}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Source */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Revenue by Source
                </h2>
              </div>
              <div className="space-y-4">
                {revenueBySource.map((source, index) => (
                  <div key={source.source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{source.source}</span>
                      <span className="text-sm text-gray-500">{formatCurrency(source.amount)} ({source.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${source.percentage}%`, backgroundColor: source.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Transactions
              </h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentTransactions.map(transaction => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{transaction.description}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'payment' ? 'bg-green-100 text-green-800' : 
                          transaction.type === 'refund' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {transaction.type === 'refund' ? '-' : ''}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
