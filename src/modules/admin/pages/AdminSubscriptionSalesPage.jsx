import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminSubscriptionSalesPage() {
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const [ordersData, subsData, pkgsData] = await Promise.all([
        base44.entities.SubscriptionOrder.list(),
        base44.entities.Subscription.list(),
        base44.entities.SubscriptionPackage.list()
      ]);
      setOrders(ordersData);
      setSubscriptions(subsData);
      setPackages(pkgsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPackageName = (packageId) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg?.name || 'Unknown';
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const totalSubscriptions = subscriptions.length;
    const recentOrders = orders.filter(o => {
      const days = parseInt(timeRange);
      const orderDate = new Date(o.created_at);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return orderDate >= cutoffDate;
    });
    const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

    return {
      totalRevenue,
      activeSubscriptions,
      totalSubscriptions,
      recentRevenue,
      recentOrders: recentOrders.length
    };
  };

  const stats = calculateStats();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Sales</h1>
          <p className="text-gray-600">Track revenue and subscription orders</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              12%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              8%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">${stats.recentRevenue.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Revenue (Last {timeRange} days)</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              15%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</div>
          <div className="text-sm text-gray-600">Active Subscriptions</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex items-center text-red-600 text-sm">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              3%
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.recentOrders}</div>
          <div className="text-sm text-gray-600">New Orders (Last {timeRange} days)</div>
        </div>
      </div>

      {/* Revenue by Package */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue by Package</h2>
        <div className="space-y-4">
          {packages.map(pkg => {
            const packageOrders = orders.filter(o => o.package_id === pkg.id);
            const packageRevenue = packageOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
            const percentage = stats.totalRevenue > 0 ? (packageRevenue / stats.totalRevenue) * 100 : 0;

            return (
              <div key={pkg.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{pkg.name}</span>
                  <span className="text-gray-600">${packageRevenue.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Package</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 20).map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{order.id.slice(0, 8)}...</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{order.user_name}</div>
                  <div className="text-xs text-gray-500">{order.user_email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{getPackageName(order.package_id)}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">${order.amount?.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </div>
  );
}
