import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import BackerSidebar from '@/components/BackerSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, BarChart3, PieChart, Calendar, ArrowUpRight, ArrowDownRight, Target, Zap } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function BackerAnalyticsPage() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('studio22_user'));
      
      // Fetch backer profile
      const backers = await base44.entities.Backer.filter({ email: storedUser.email });
      if (backers.length > 0) {
        setBacker(backers[0]);
      }

      // Fetch investments
      const backedProjects = await base44.entities.BackedProject.filter({ backer_email: storedUser.email });
      
      // Filter by time range
      const now = new Date();
      const filtered = backedProjects.filter(inv => {
        const invDate = new Date(inv.investment_date);
        if (timeRange === '30d') return (now - invDate) <= 30 * 24 * 60 * 60 * 1000;
        if (timeRange === '90d') return (now - invDate) <= 90 * 24 * 60 * 60 * 1000;
        if (timeRange === '1y') return (now - invDate) <= 365 * 24 * 60 * 60 * 1000;
        return true;
      });
      
      setInvestments(filtered);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      toastError('Load Failed', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.investment_amount || 0), 0);
  const totalExpectedROI = investments.reduce((sum, inv) => sum + (inv.expected_roi || 0), 0);
  const totalROI = totalExpectedROI - totalInvested;
  const roiPercentage = totalInvested > 0 ? ((totalROI / totalInvested) * 100).toFixed(1) : 0;
  const activeInvestments = investments.filter(inv => inv.status === 'active').length;
  const completedInvestments = investments.filter(inv => inv.status === 'completed').length;

  // Calculate monthly investment trend
  const monthlyData = {};
  investments.forEach(inv => {
    const month = new Date(inv.investment_date).toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyData[month] = (monthlyData[month] || 0) + (inv.investment_amount || 0);
  });

  const monthlyTrend = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));

  // Investment by category
  const categoryData = {};
  investments.forEach(inv => {
    const category = inv.project_category || 'Other';
    categoryData[category] = (categoryData[category] || 0) + (inv.investment_amount || 0);
  });

  const categoryBreakdown = Object.entries(categoryData).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalInvested > 0 ? ((amount / totalInvested) * 100).toFixed(1) : 0
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BackerSidebar />
      <div className="ml-20 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
            <p className="text-gray-600">Track your investment performance and trends</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalROI >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                <div className="text-2xl font-bold">${totalROI.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">ROI %</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${parseFloat(roiPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-5 h-5" />
                <div className="text-2xl font-bold">{roiPercentage}%</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <div className="text-2xl font-bold">{activeInvestments}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Investment Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Investment Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrend.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No data for selected period</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {monthlyTrend.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gray-600">{item.month}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-green-600 h-4 rounded-full transition-all"
                          style={{ width: `${(item.amount / Math.max(...monthlyTrend.map(d => d.amount))) * 100}%` }}
                        />
                      </div>
                      <div className="w-24 text-right text-sm font-medium">${item.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Investment by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No category data</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-32 text-sm text-gray-600 truncate">{item.category}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-sm font-medium">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4" />
                Average Deal Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${investments.length > 0 ? (totalInvested / investments.length).toFixed(0).toLocaleString() : '0'}
              </div>
              <p className="text-sm text-gray-600 mt-2">Per investment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {investments.length > 0 ? ((completedInvestments / investments.length) * 100).toFixed(0) : '0'}%
              </div>
              <p className="text-sm text-gray-600 mt-2">{completedInvestments} of {investments.length} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                Investment Frequency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {timeRange === '30d' ? (investments.length / 1).toFixed(1) :
                 timeRange === '90d' ? (investments.length / 3).toFixed(1) :
                 timeRange === '1y' ? (investments.length / 12).toFixed(1) :
                 investments.length}
              </div>
              <p className="text-sm text-gray-600 mt-2">Deals per month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Investment Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {investments.slice(0, 5).map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{inv.project_title}</div>
                      <div className="text-sm text-gray-600">{new Date(inv.investment_date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${inv.investment_amount?.toLocaleString()}</div>
                      <div className={`text-sm ${inv.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                        {inv.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
