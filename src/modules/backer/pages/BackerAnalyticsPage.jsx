import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Backer, BackedProject } from '@/lib/supabaseEntities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, BarChart3, PieChart, Calendar, ArrowUpRight, ArrowDownRight, Target, Zap } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast.jsx'
import { useAuth } from '@/lib/AuthContext'

export default function BackerAnalyticsPage() {
  const navigate = useNavigate()
  const { error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()
  const [backer, setBacker] = useState(null)
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/'
      return
    }
    fetchData()
  }, [isAuthenticated, timeRange])

  const fetchData = async () => {
    try {
      // Fetch backer profile
      const backers = await Backer.filter({ contact_email: authUser?.email })
      if (backers.length > 0) {
        setBacker(backers[0])
      }

      // Fetch investments
      const backedProjects = await BackedProject.filter({ backer_email: authUser?.email })
      
      // Filter by time range
      const now = new Date()
      const filtered = backedProjects.filter(inv => {
        const invDate = new Date(inv.investment_date)
        if (timeRange === '30d') return (now - invDate) <= 30 * 24 * 60 * 60 * 1000
        if (timeRange === '90d') return (now - invDate) <= 90 * 24 * 60 * 60 * 1000
        if (timeRange === '1y') return (now - invDate) <= 365 * 24 * 60 * 60 * 1000
        return true
      })
      
      setInvestments(filtered)
    } catch (err) {
      
      toastError('Load Failed', 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.investment_amount || 0), 0)
  const totalExpectedROI = investments.reduce((sum, inv) => sum + (inv.expected_roi || 0), 0)
  const totalROI = totalExpectedROI - totalInvested
  const roiPercentage = totalInvested > 0 ? ((totalROI / totalInvested) * 100).toFixed(1) : 0
  const activeInvestments = investments.filter(inv => inv.status === 'active').length
  const completedInvestments = investments.filter(inv => inv.status === 'completed').length

  // Calculate monthly investment trend
  const monthlyData = {}
  investments.forEach(inv => {
    const month = new Date(inv.investment_date).toLocaleString('default', { month: 'short', year: 'numeric' })
    monthlyData[month] = (monthlyData[month] || 0) + (inv.investment_amount || 0)
  })

  const monthlyTrend = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }))

  // Investment by category
  const categoryData = {}
  investments.forEach(inv => {
    const category = inv.project_category || 'Other'
    categoryData[category] = (categoryData[category] || 0) + (inv.investment_amount || 0)
  })

  const categoryBreakdown = Object.entries(categoryData).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalInvested > 0 ? ((amount / totalInvested) * 100).toFixed(1) : 0
  }))

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
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

        {/* Key Metrics - Smaller cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">${totalInvested.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total Invested</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${totalROI >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {totalROI >= 0 ? <ArrowUpRight className="w-5 h-5 text-green-600" /> : <ArrowDownRight className="w-5 h-5 text-red-600" />}
              </div>
              <div>
                <div className={`text-2xl font-bold ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>${totalROI.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total ROI</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${parseFloat(roiPercentage) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={`w-5 h-5 ${parseFloat(roiPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${parseFloat(roiPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{roiPercentage}%</div>
                <div className="text-xs text-gray-500">ROI %</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeInvestments}</div>
                <div className="text-xs text-gray-500">Active Deals</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section - Smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Investment Trend */}
          <Card className="p-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold mb-4">
              <BarChart3 className="w-4 h-4" />
              Investment Trend
            </CardTitle>
            {monthlyTrend.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No data for selected period</p>
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyTrend.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-600">{item.month}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gray-900 h-3 rounded-full transition-all"
                        style={{ width: `${(item.amount / Math.max(...monthlyTrend.map(d => d.amount))) * 100}%` }}
                      />
                    </div>
                    <div className="w-20 text-right text-xs font-medium">${item.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Category Breakdown */}
          <Card className="p-4">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold mb-4">
              <PieChart className="w-4 h-4" />
              Investment by Category
            </CardTitle>
            {categoryBreakdown.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <PieChart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No category data</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-28 text-xs text-gray-600 truncate">{item.category}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gray-900 h-3 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-xs font-medium">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Performance Metrics - Smaller cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-gray-900" />
              <span className="text-xs font-medium text-gray-600">Average Deal Size</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${investments.length > 0 ? (totalInvested / investments.length).toFixed(0).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per investment</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-gray-900" />
              <span className="text-xs font-medium text-gray-600">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {investments.length > 0 ? ((completedInvestments / investments.length) * 100).toFixed(0) : '0'}%
            </div>
            <p className="text-xs text-gray-500 mt-1">{completedInvestments} of {investments.length} completed</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-900" />
              <span className="text-xs font-medium text-gray-600">Investment Frequency</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {timeRange === '30d' ? (investments.length / 1).toFixed(1) :
               timeRange === '90d' ? (investments.length / 3).toFixed(1) :
               timeRange === '1y' ? (investments.length / 12).toFixed(1) :
               investments.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Deals per month</p>
          </Card>
        </div>

        {/* Recent Activity - Smaller */}
        <Card className="p-4">
          <CardTitle className="text-sm font-semibold mb-4">Recent Investment Activity</CardTitle>
          {investments.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-2">
              {investments.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{inv.project_title}</div>
                    <div className="text-xs text-gray-600">{new Date(inv.investment_date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">${inv.investment_amount?.toLocaleString()}</div>
                    <div className={`text-xs ${inv.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {inv.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
    </div>
  )
}