import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminFinancePage() {
  const [timeRange, setTimeRange] = useState('30d');

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
  ];

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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-600" />
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
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'subscription' ? 'bg-blue-100' :
                    transaction.type === 'backing' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {transaction.type === 'subscription' ? <CreditCard className="w-5 h-5 text-blue-600" /> :
                     transaction.type === 'backing' ? <ArrowUpRight className="w-5 h-5 text-green-600" /> :
                     <ArrowDownRight className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.user}</p>
                    <p className="text-sm text-gray-600 capitalize">{transaction.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{transaction.amount}</p>
                  <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
