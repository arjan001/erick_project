import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backer, BackedProject } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Filter, Download } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';
import { confirmDialog } from '@/lib/sweetAlert';

export default function BackerInvestmentsPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('studio22_user'));
      
      // Fetch backer profile
      const backers = await Backer.filter({ contact_email: storedUser.email });
      if (backers.length > 0) {
        setBacker(backers[0]);
      }

      // Fetch backed projects
      const backedProjects = await BackedProject.filter({ backer_email: storedUser.email });
      setInvestments(backedProjects);
    } catch (err) {
      console.error('Error fetching investments:', err);
      toastError('Load Failed', 'Failed to load investments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvestments = investments.filter(inv => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.investment_date) - new Date(a.investment_date);
    if (sortBy === 'amount') return b.investment_amount - a.investment_amount;
    if (sortBy === 'roi') return (b.expected_roi || 0) - (a.expected_roi || 0);
    return 0;
  });

  const totalInvested = investments.reduce((sum, inv) => sum + (inv.investment_amount || 0), 0);
  const totalExpectedROI = investments.reduce((sum, inv) => sum + (inv.expected_roi || 0), 0);
  const totalROI = totalExpectedROI - totalInvested;
  const roiPercentage = totalInvested > 0 ? ((totalROI / totalInvested) * 100).toFixed(1) : 0;

  const handleWithdraw = async (investmentId) => {
    if (!(await confirmDialog('Withdraw this investment?', 'This action cannot be undone'))) return;
    try {
      await BackedProject.update(investmentId, { status: 'withdrawn' });
      success('Withdrawal Initiated', 'Your withdrawal request has been submitted');
      fetchData();
    } catch (err) {
      console.error('Error withdrawing:', err);
      toastError('Withdrawal Failed', 'Failed to process withdrawal');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Portfolio</h1>
          <p className="text-gray-600">Track your investments and returns</p>
        </div>

        {/* Stats Cards */}
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
              <CardTitle className="text-sm font-medium text-gray-600">Expected Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div className="text-2xl font-bold">${totalExpectedROI.toLocaleString()}</div>
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
              <CardTitle className="text-sm font-medium text-gray-600">ROI Percentage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-2 ${parseFloat(roiPercentage) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(roiPercentage) >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                <div className="text-2xl font-bold">{roiPercentage}%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="roi">Sort by ROI</option>
          </select>
          <Button variant="outline" className="ml-auto">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Investments List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Investments</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInvestments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No investments yet</p>
                <Button 
                  onClick={() => navigate(createPageUrl('BackerProjects'))}
                  className="mt-4"
                >
                  Browse Projects
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvestments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{investment.project_title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>Invested: ${investment.investment_amount?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>Expected: ${investment.expected_roi?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(investment.investment_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-xs rounded font-medium ${
                        investment.status === 'active' ? 'bg-green-100 text-green-700' :
                        investment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        investment.status === 'withdrawn' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {investment.status}
                      </span>
                      {investment.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleWithdraw(investment.id)}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}