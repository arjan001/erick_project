import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function AdminFinancePage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const stats = [
    {
      title: 'Total Revenue',
      value: '$124,500',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign
    },
    {
      title: 'Active Subscriptions',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: CreditCard
    },
    {
      title: 'Total Backing',
      value: '$89,200',
      change: '+23.1%',
      trend: 'up',
      icon: Wallet
    },
    {
      title: 'Pending Payouts',
      value: '$12,300',
      change: '-5.4%',
      trend: 'down',
      icon: ArrowDownRight
    }
  ];

  const transactions = [
    { id: 1, type: 'subscription', user: 'John Doe', amount: '$29.00', status: 'completed', date: '2024-01-15' },
    { id: 2, type: 'backing', user: 'Jane Smith', amount: '$500.00', status: 'completed', date: '2024-01-14' },
    { id: 3, type: 'payout', user: 'Studio Team', amount: '$1,200.00', status: 'pending', date: '2024-01-14' },
    { id: 4, type: 'subscription', user: 'Mike Johnson', amount: '$29.00', status: 'completed', date: '2024-01-13' },
    { id: 5, type: 'backing', user: 'Investment Group', amount: '$2,500.00', status: 'completed', date: '2024-01-12' },
    { id: 6, type: 'subscription', user: 'Sarah Wilson', amount: '$29.00', status: 'completed', date: '2024-01-11' },
    { id: 7, type: 'payout', user: 'Artist Collective', amount: '$3,500.00', status: 'pending', date: '2024-01-10' },
    { id: 8, type: 'backing', user: 'Angel Investor', amount: '$10,000.00', status: 'completed', date: '2024-01-09' },
    { id: 9, type: 'subscription', user: 'David Brown', amount: '$29.00', status: 'failed', date: '2024-01-08' },
    { id: 10, type: 'payout', user: 'Music Label', amount: '$5,200.00', status: 'completed', date: '2024-01-07' },
    { id: 11, type: 'subscription', user: 'Emily Davis', amount: '$29.00', status: 'completed', date: '2024-01-06' },
    { id: 12, type: 'backing', user: 'VC Firm', amount: '$50,000.00', status: 'pending', date: '2024-01-05' },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE);
  const paginatedTransactions = filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      failed: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600">Monitor revenue, subscriptions, and financial transactions</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">{stat.title}</p>
                    <p className="text-xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-sm"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-sm"
              >
                <option value="all">All Types</option>
                <option value="subscription">Subscription</option>
                <option value="backing">Backing</option>
                <option value="payout">Payout</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedTransactions.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No transactions found</td></tr>
                )}
                {paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'subscription' ? 'bg-blue-100' :
                          transaction.type === 'backing' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {transaction.type === 'subscription' ? <CreditCard className="w-4 h-4 text-blue-600" /> :
                           transaction.type === 'backing' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> :
                           <ArrowDownRight className="w-4 h-4 text-yellow-600" />}
                        </div>
                        <span className="font-medium text-sm">{transaction.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{transaction.type}</td>
                    <td className="px-4 py-3 text-sm font-medium">{transaction.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 mt-4">
              <span className="text-xs text-gray-500">{filteredTransactions.length} total · page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
