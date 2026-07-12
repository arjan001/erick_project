import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/analytics.api';
import { Users, Globe, Activity, AlertTriangle, TrendingUp, DollarSign, Clock, Eye, MapPin, BarChart3, LineChart, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from 'recharts';

const COLORS = ['#1a1a1a', '#6b7280', '#d1d5db', '#374151', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d
  const [liveUsers, setLiveUsers] = useState([]);
  const [liveUserCount, setLiveUserCount] = useState(0);
  const [countryStats, setCountryStats] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [sessionStats, setSessionStats] = useState(null);
  const [errorStats, setErrorStats] = useState(null);
  const [recentErrors, setRecentErrors] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState(null);
  const [overviewStats, setOverviewStats] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
    // Refresh live users every 30 seconds
    const interval = setInterval(() => {
      fetchLiveUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - getDaysInMs(dateRange)).toISOString();

      const [
        liveUsersData,
        liveCount,
        countries,
        pages,
        sessions,
        errors,
        errorStatsData,
        recentErrorsData,
        subStats,
        overview
      ] = await Promise.all([
        analyticsApi.getLiveUsers(),
        analyticsApi.getLiveUserCount(),
        analyticsApi.getCountryStats(startDate, endDate),
        analyticsApi.getTopPages(startDate, endDate, 10),
        analyticsApi.getSessionStats(startDate, endDate),
        analyticsApi.getErrors(startDate, endDate),
        analyticsApi.getErrorStats(startDate, endDate),
        analyticsApi.getErrors(startDate, endDate, 'critical'),
        analyticsApi.getSubscriptionStats(),
        analyticsApi.getOverviewStats(startDate, endDate)
      ]);

      setLiveUsers(liveUsersData);
      setLiveUserCount(liveCount);
      setCountryStats(countries);
      setTopPages(pages);
      setSessionStats(sessions);
      setErrorStats(errorStatsData);
      setRecentErrors(recentErrorsData.slice(0, 5));
      setSubscriptionStats(subStats);
      setOverviewStats(overview);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveUsers = async () => {
    try {
      const [users, count] = await Promise.all([
        analyticsApi.getLiveUsers(),
        analyticsApi.getLiveUserCount()
      ]);
      setLiveUsers(users);
      setLiveUserCount(count);
    } catch (err) {
      console.error('Error fetching live users:', err);
    }
  };

  const getDaysInMs = (range) => {
    const days = { '7d': 7, '30d': 30, '90d': 90 };
    return (days[range] || 7) * 24 * 60 * 60 * 1000;
  };

  const resolveError = async (errorId) => {
    try {
      await analyticsApi.resolveError(errorId, localStorage.getItem('user_id'));
      fetchAnalyticsData();
    } catch (err) {
      console.error('Error resolving error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time platform analytics and insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Live Users"
          value={liveUserCount}
          sub="Currently online"
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Total Sessions"
          value={overviewStats?.totalSessions || 0}
          sub={`In last ${dateRange.replace('d', '')} days`}
          icon={Activity}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          label="Page Views"
          value={overviewStats?.totalPageViews || 0}
          sub={`In last ${dateRange.replace('d', '')} days`}
          icon={Eye}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          label="Active Subscriptions"
          value={subscriptionStats?.activeSubscriptions || 0}
          sub={`$${(subscriptionStats?.monthlyRecurringRevenue || 0).toLocaleString()} MRR`}
          icon={DollarSign}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* World Map / Traffic Distribution */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Traffic by Country
              </h3>
              <span className="text-xs text-gray-400">{countryStats.length} countries</span>
            </div>
            <div className="space-y-3">
              {countryStats.slice(0, 8).map((country) => (
                <div key={country.country} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-32">{country.country}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-16 text-right">
                    {country.count} ({country.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Session Analytics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Device Types
              </h3>
              {sessionStats?.deviceTypes?.length > 0 ? (
                <ResponsiveContainer width="100%" height={150}>
                  <RechartsPieChart>
                    <Pie
                      data={sessionStats.deviceTypes}
                      dataKey="count"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                    >
                      {sessionStats.deviceTypes.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[150px] flex items-center justify-center text-sm text-gray-400">No data</div>
              )}
              <div className="mt-3 space-y-1">
                {sessionStats?.deviceTypes?.slice(0, 3).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 capitalize">{item.name}</span>
                    <span className="font-medium text-gray-800">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Avg Session Duration
              </h3>
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-gray-900">
                  {sessionStats?.avgDuration && !isNaN(sessionStats.avgDuration)
                    ? `${Math.floor(sessionStats.avgDuration / 60)}m ${Math.round(sessionStats.avgDuration % 60)}s`
                    : '0m 0s'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Average time per session</div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="font-medium text-gray-800">{sessionStats?.totalSessions || 0}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Bounce Rate</span>
                  <span className="font-medium text-gray-800">Calculating...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Top Pages
            </h3>
            <div className="space-y-3">
              {topPages.map((page, i) => (
                <div key={page.path} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                  <span className="text-xs text-gray-700 flex-1 truncate">{page.path}</span>
                  <span className="text-xs font-semibold text-gray-800">{page.count} views</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Live Users Feed */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Live Activity
              </h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">{liveUserCount} online</span>
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {liveUsers.slice(0, 8).map((user) => (
                <div key={user.session_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {(user.users?.first_name?.[0] || 'U')}{(user.users?.last_name?.[0] || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {user.users?.email || 'Anonymous'}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user.current_page || 'Browsing'}</div>
                  </div>
                  {user.country && (
                    <span className="text-xs text-gray-400">{user.country}</span>
                  )}
                </div>
              ))}
              {liveUsers.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">No live users</div>
              )}
            </div>
          </div>

          {/* Error Alerts */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Recent Errors
              </h3>
              <span className="text-xs text-red-500 font-medium">{errorStats?.unresolvedCount || 0} unresolved</span>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentErrors.map((error) => (
                <div key={error.id} className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-red-900 truncate">
                        {error.error_type || 'Error'}
                      </div>
                      <div className="text-xs text-red-700 mt-1 line-clamp-2">
                        {error.error_message}
                      </div>
                      <div className="text-xs text-red-500 mt-1">{error.page_path || 'Unknown page'}</div>
                    </div>
                    <button
                      onClick={() => resolveError(error.id)}
                      className="text-xs text-red-600 hover:text-red-800 whitespace-nowrap"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
              {recentErrors.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">No recent errors</div>
              )}
            </div>
          </div>

          {/* Subscription Retention */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Subscription Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Churn Rate</span>
                <span className={`text-xs font-bold ${subscriptionStats?.churnRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {subscriptionStats?.churnRate || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Avg Duration</span>
                <span className="text-xs font-semibold text-gray-800">
                  {subscriptionStats?.avgDuration || 0} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">MRR</span>
                <span className="text-xs font-semibold text-gray-800">
                  ${(subscriptionStats?.monthlyRecurringRevenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Plan Distribution</div>
                {subscriptionStats?.planDistribution?.slice(0, 3).map((plan) => (
                  <div key={plan.plan} className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 capitalize">{plan.plan}</span>
                    <span className="font-medium text-gray-800">{plan.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}
