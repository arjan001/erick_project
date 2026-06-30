import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ArrowUpDown, Crown, Check, X, Edit2, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function AdminSubscriptionsPage() {
  const { success, error: toastError } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPackage, setFilterPackage] = useState('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subsData, pkgsData] = await Promise.all([
        base44.entities.Subscription.list(),
        base44.entities.SubscriptionPackage.list()
      ]);
      setSubscriptions(subsData);
      setPackages(pkgsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualUpgrade = async (subscriptionId, newPackageId) => {
    try {
      await base44.entities.Subscription.update(subscriptionId, {
        package_id: newPackageId,
        upgraded_at: new Date().toISOString(),
        upgraded_manually: true
      });
      success('Upgrade Complete', 'User subscription upgraded successfully');
      setShowUpgradeModal(false);
      fetchData();
    } catch (err) {
      console.error('Error upgrading subscription:', err);
      toastError('Upgrade Failed', 'Failed to upgrade subscription');
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      await base44.entities.Subscription.update(subscriptionId, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      });
      success('Subscription Cancelled', 'Subscription cancelled successfully');
      fetchData();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      toastError('Cancellation Failed', 'Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async (subscriptionId) => {
    try {
      await base44.entities.Subscription.update(subscriptionId, {
        status: 'active',
        reactivated_at: new Date().toISOString()
      });
      success('Subscription Reactivated', 'Subscription reactivated successfully');
      fetchData();
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      toastError('Reactivation Failed', 'Failed to reactivate subscription');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesPackage = filterPackage === 'all' || sub.package_id === filterPackage;
    return matchesSearch && matchesStatus && matchesPackage;
  });

  const getPackageName = (packageId) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg?.name || 'Unknown';
  };

  const getPackagePrice = (packageId) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg ? `$${pkg.price}/${pkg.billing_cycle}` : '-';
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Subscriptions</h1>
        <p className="text-gray-600">View and manage user subscriptions</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={filterPackage}
            onChange={(e) => setFilterPackage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="all">All Packages</option>
            {packages.map(pkg => (
              <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">{subscriptions.length}</div>
          <div className="text-sm text-gray-600">Total Subscriptions</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{subscriptions.filter(s => s.status === 'active').length}</div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-red-600">{subscriptions.filter(s => s.status === 'cancelled').length}</div>
          <div className="text-sm text-gray-600">Cancelled</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-600">{subscriptions.filter(s => s.status === 'expired').length}</div>
          <div className="text-sm text-gray-600">Expired</div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Package</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Started</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Renews</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscriptions.map((sub) => (
              <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{sub.user_name}</div>
                    <div className="text-sm text-gray-500">{sub.user_email}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">{getPackageName(sub.package_id)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{getPackagePrice(sub.package_id)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sub.status === 'active' ? 'bg-green-100 text-green-800' :
                    sub.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(sub.started_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {sub.renews_at ? new Date(sub.renews_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {sub.status === 'active' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSubscription(sub);
                          setShowUpgradeModal(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Upgrade
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReactivateSubscription(sub.id)}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Reactivate
                      </Button>
                    )}
                    {sub.status === 'active' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelSubscription(sub.id)}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSubscriptions.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No subscriptions found
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upgrade Subscription</h2>
            <p className="text-gray-600 mb-4">
              Select a new package for {selectedSubscription.user_name}
            </p>
            <div className="space-y-2 mb-4">
              {packages.filter(p => p.active && p.id !== selectedSubscription.package_id).map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => {
                    handleManualUpgrade(selectedSubscription.id, pkg.id);
                  }}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <div className="font-medium">{pkg.name}</div>
                  <div className="text-sm text-gray-600">${pkg.price}/{pkg.billing_cycle}</div>
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => setShowUpgradeModal(false)} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
