import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, CreditCard, Building2, TrendingUp, ArrowDownRight, ArrowUpRight, Calendar, CheckCircle, AlertCircle, Crown, Edit, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Subscription, SubscriptionOrder, ConnectsTransaction, Artist } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';

export default function ArtistFinancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('subscription');
  const [loading, setLoading] = useState(true);
  
  // Subscription data
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionOrders, setSubscriptionOrders] = useState([]);
  
  // Bank details
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    iban: '',
    swiftCode: ''
  });
  const [editingBank, setEditingBank] = useState(false);
  
  // Transactions
  const [transactions, setTransactions] = useState([]);
  
  // Payments received
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!user) return;
    loadFinanceData();
  }, [user]);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      
      // Load subscription
      const subscriptions = await Subscription.filter({ user_email: user.email });
      setCurrentSubscription(subscriptions?.[0] || null);
      
      // Load subscription orders
      const orders = await SubscriptionOrder.filter({ user_email: user.email }, '-created_date', 10);
      setSubscriptionOrders(orders || []);
      
      // Load connects transactions
      const connectsTx = await ConnectsTransaction.filter({ artist_email: user.email }, '-created_date', 20);
      setTransactions(connectsTx || []);
      
      // Load artist profile for bank details
      const artists = await Artist.filter({ email: user.email });
      const artist = artists?.[0];
      if (artist) {
        setBankDetails({
          bankName: artist.bank_name || '',
          accountNumber: artist.account_number || '',
          routingNumber: artist.routing_number || '',
          accountHolderName: artist.account_holder_name || '',
          iban: artist.iban || '',
          swiftCode: artist.swift_code || ''
        });
      }
      
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankDetails = async () => {
    try {
      const artists = await Artist.filter({ email: user.email });
      const artist = artists?.[0];
      
      if (artist) {
        await Artist.update(artist.id, {
          bank_name: bankDetails.bankName,
          account_number: bankDetails.accountNumber,
          routing_number: bankDetails.routingNumber,
          account_holder_name: bankDetails.accountHolderName,
          iban: bankDetails.iban,
          swift_code: bankDetails.swiftCode
        });
      }
      
      setEditingBank(false);
      success('Bank Details Saved', 'Your bank information has been updated successfully.');
    } catch (err) {
      console.error('Error saving bank details:', err);
      error('Failed', 'Could not save bank details. Please try again.');
    }
  };

  const getSubscriptionStatus = () => {
    if (!currentSubscription) return { status: 'No Subscription', color: 'gray' };
    
    const now = new Date();
    const renewsAt = new Date(currentSubscription.renews_at);
    
    if (currentSubscription.status !== 'active') {
      return { status: 'Inactive', color: 'red' };
    }
    
    if (renewsAt < now) {
      return { status: 'Expired', color: 'red' };
    }
    
    const daysUntilRenewal = Math.ceil((renewsAt - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRenewal <= 7) {
      return { status: 'Expiring Soon', color: 'yellow' };
    }
    
    return { status: 'Active', color: 'green' };
  };

  const subscriptionStatus = getSubscriptionStatus();

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="w-full">
        <div className="px-5 sm:px-7 lg:px-9 pt-7 pb-12">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Finances</h1>
            <p className="text-gray-600">Manage your subscription, payments, and bank details</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              { id: 'subscription', label: 'Subscription', icon: Crown },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'bank', label: 'Bank Details', icon: Building2 },
              { id: 'transactions', label: 'Transactions', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-black border-b-2 border-black -mb-0.5'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {/* Current Subscription Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Current Subscription</h2>
                    <div className={`flex items-center gap-2 text-sm font-medium ${
                      subscriptionStatus.color === 'green' ? 'text-green-600' :
                      subscriptionStatus.color === 'yellow' ? 'text-yellow-600' :
                      subscriptionStatus.color === 'red' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {subscriptionStatus.color === 'green' && <CheckCircle className="w-4 h-4" />}
                      {subscriptionStatus.color === 'yellow' && <AlertCircle className="w-4 h-4" />}
                      {subscriptionStatus.color === 'red' && <AlertCircle className="w-4 h-4" />}
                      {subscriptionStatus.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className={`w-6 h-6 ${currentSubscription ? 'text-yellow-500' : 'text-gray-300'}`} />
                    {currentSubscription && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                {currentSubscription ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-600 uppercase font-bold mb-1">Plan</div>
                        <div className="text-lg font-bold text-gray-900">{currentSubscription.package_name}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-600 uppercase font-bold mb-1">Renewal Date</div>
                        <div className="text-sm font-bold text-gray-900">
                          {new Date(currentSubscription.renews_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => navigate(createPageUrl('ArtistSubscriptionCheckout'))}
                        className="flex-1 bg-black text-white hover:bg-gray-800 font-bold"
                      >
                        Upgrade Plan
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You don't have an active subscription</p>
                    <Button
                      onClick={() => navigate(createPageUrl('ArtistSubscriptionCheckout'))}
                      className="bg-black text-white hover:bg-gray-800 font-bold"
                    >
                      Get Premium
                    </Button>
                  </div>
                )}
              </div>

              {/* Subscription History */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription History</h2>
                {subscriptionOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No subscription history available
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subscriptionOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{order.package_name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()} · {order.payment_method}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">€{order.amount}</div>
                          <div className={`text-xs font-medium ${
                            order.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {order.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Payments</h2>
                <p className="text-gray-600 mb-6">View payments received from clients</p>
                <div className="text-sm text-gray-500">
                  Payment history will appear here once you receive payments from clients
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Bank Details</h2>
                {!editingBank && (
                  <Button
                    onClick={() => setEditingBank(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                    disabled={!editingBank}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                    disabled={!editingBank}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                    <input
                      type="text"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      disabled={!editingBank}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Routing Number</label>
                    <input
                      type="text"
                      value={bankDetails.routingNumber}
                      onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                      disabled={!editingBank}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                    <input
                      type="text"
                      value={bankDetails.iban}
                      onChange={(e) => setBankDetails({...bankDetails, iban: e.target.value})}
                      disabled={!editingBank}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SWIFT Code</label>
                    <input
                      type="text"
                      value={bankDetails.swiftCode}
                      onChange={(e) => setBankDetails({...bankDetails, swiftCode: e.target.value})}
                      disabled={!editingBank}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {editingBank && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveBankDetails}
                      className="flex-1 bg-black text-white hover:bg-gray-800 font-bold flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setEditingBank(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No transactions available
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {tx.amount > 0 ? (
                            <ArrowDownRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 capitalize">{tx.reason}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} connects
                        </div>
                        <div className="text-xs text-gray-500">
                          Balance: {tx.balance_after}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
