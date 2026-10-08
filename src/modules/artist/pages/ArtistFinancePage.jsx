import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, CreditCard, Building2, TrendingUp, ArrowDownRight, ArrowUpRight, Calendar, CheckCircle, AlertCircle, Crown, Edit, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Subscription, SubscriptionOrder, ConnectsTransaction, Artist } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'

export default function ArtistFinancePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState('subscription')
  const [loading, setLoading] = useState(true)
  
  // Subscription data
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [subscriptionOrders, setSubscriptionOrders] = useState([])
  
  // Bank details
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
    iban: '',
    swiftCode: ''
  })
  const [editingBank, setEditingBank] = useState(false)
  
  // Transactions
  const [transactions, setTransactions] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Pagination for other tabs
  const [subscriptionPage, setSubscriptionPage] = useState(1)
  const [paymentsPage, setPaymentsPage] = useState(1)
  
  // Payments received
  const [payments, setPayments] = useState([])

  useEffect(() => {
    if (!user) return
    loadFinanceData()
  }, [user])

  const loadFinanceData = async () => {
    try {
      setLoading(true)
      
      // Load subscription
      const subscriptions = await Subscription.filter({ user_email: user.email })
      setCurrentSubscription(subscriptions?.[0] || null)
      
      // Load subscription orders
      const orders = await SubscriptionOrder.filter({ user_email: user.email }, '-created_date', 10)
      setSubscriptionOrders(orders || [])
      
      // Load connects transactions
      const connectsTx = await ConnectsTransaction.filter({ artist_email: user.email }, '-created_date', 20)
      setTransactions(connectsTx || [])
      
      // Load artist profile for bank details
      const artists = await Artist.filter({ email: user.email })
      const artist = artists?.[0]
      if (artist) {
        setBankDetails({
          bankName: artist.bank_name || '',
          accountNumber: artist.account_number || '',
          routingNumber: artist.routing_number || '',
          accountHolderName: artist.account_holder_name || '',
          iban: artist.iban || '',
          swiftCode: artist.swift_code || ''
        })
      }
      
    } catch (err) {
      
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBankDetails = async () => {
    try {
      const artists = await Artist.filter({ email: user.email })
      const artist = artists?.[0]
      
      if (artist) {
        await Artist.update(artist.id, {
          bank_name: bankDetails.bankName,
          account_number: bankDetails.accountNumber,
          routing_number: bankDetails.routingNumber,
          account_holder_name: bankDetails.accountHolderName,
          iban: bankDetails.iban,
          swift_code: bankDetails.swiftCode
        })
      }
      
      setEditingBank(false)
      success('Bank Details Saved', 'Your bank information has been updated successfully.')
    } catch (err) {
      
      error('Failed', 'Could not save bank details. Please try again.')
    }
  }

  const getSubscriptionStatus = () => {
    if (!currentSubscription) return { status: 'No Subscription', color: 'gray' }
    
    const now = new Date()
    const renewsAt = new Date(currentSubscription.renews_at)
    
    if (currentSubscription.status !== 'active') {
      return { status: 'Inactive', color: 'red' }
    }
    
    if (renewsAt < now) {
      return { status: 'Expired', color: 'red' }
    }
    
    const daysUntilRenewal = Math.ceil((renewsAt - now) / (1000 * 60 * 60 * 24))
    
    if (daysUntilRenewal <= 7) {
      return { status: 'Expiring Soon', color: 'yellow' }
    }
    
    return { status: 'Active', color: 'green' }
  }

  const subscriptionStatus = getSubscriptionStatus()

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
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
          <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'subscription', label: 'Subscription', icon: Crown },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'bank', label: 'Bank Details', icon: Building2 },
              { id: 'transactions', label: 'Transactions', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-black border-b-2 border-black -mb-0.5'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              )
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Package</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Payment Method</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscriptionOrders
                            .slice((subscriptionPage - 1) * itemsPerPage, subscriptionPage * itemsPerPage)
                            .map((order) => (
                              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {order.package_name}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600 capitalize hidden sm:table-cell">
                                  {order.payment_method}
                                </td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                                  €{order.amount}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {order.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200 gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {(subscriptionPage - 1) * itemsPerPage + 1} to {Math.min(subscriptionPage * itemsPerPage, subscriptionOrders.length)} of {subscriptionOrders.length} orders
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSubscriptionPage(prev => Math.max(prev - 1, 1))}
                          disabled={subscriptionPage === 1}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.ceil(subscriptionOrders.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setSubscriptionPage(page)}
                              className={`w-8 h-8 text-sm rounded-lg ${
                                subscriptionPage === page
                                  ? 'bg-black text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setSubscriptionPage(prev => Math.min(prev + 1, Math.ceil(subscriptionOrders.length / itemsPerPage)))}
                          disabled={subscriptionPage === Math.ceil(subscriptionOrders.length / itemsPerPage)}
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payments from Clients</h2>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No payments received yet</p>
                  <p className="text-sm text-gray-500">Payment history will appear here once you receive payments from clients</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Client</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Project</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments
                          .slice((paymentsPage - 1) * itemsPerPage, paymentsPage * itemsPerPage)
                          .map((payment) => (
                            <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(payment.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {payment.client_name}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 hidden sm:table-cell">
                                {payment.project_name}
                              </td>
                              <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                                €{payment.amount}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                  payment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {payment.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200 gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {(paymentsPage - 1) * itemsPerPage + 1} to {Math.min(paymentsPage * itemsPerPage, payments.length)} of {payments.length} payments
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPaymentsPage(prev => Math.max(prev - 1, 1))}
                        disabled={paymentsPage === 1}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(payments.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setPaymentsPage(page)}
                            className={`w-8 h-8 text-sm rounded-lg ${
                              paymentsPage === page
                                ? 'bg-black text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setPaymentsPage(prev => Math.min(prev + 1, Math.ceil(payments.length / itemsPerPage)))}
                        disabled={paymentsPage === Math.ceil(payments.length / itemsPerPage)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                <>
                  {/* Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Type</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Description</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((tx) => (
                            <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                                  tx.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {tx.amount > 0 ? (
                                    <ArrowDownRight className="w-3 h-3" />
                                  ) : (
                                    <ArrowUpRight className="w-3 h-3" />
                                  )}
                                  {tx.amount > 0 ? 'Credit' : 'Debit'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900 capitalize hidden sm:table-cell">
                                {tx.reason}
                              </td>
                              <td className={`py-3 px-4 text-sm font-medium text-right ${
                                tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount} connects
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600 text-right hidden sm:table-cell">
                                {tx.balance_after}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200 gap-4">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(transactions.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 text-sm rounded-lg ${
                              currentPage === page
                                ? 'bg-black text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(transactions.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(transactions.length / itemsPerPage)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
