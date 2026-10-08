import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { CreditCard, Save, DollarSign, Lock, Globe, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight, TestTube, Zap, Settings as SettingsIcon, Smartphone, Loader2, Plus, Trash2, Crown } from 'lucide-react'
import { getPaymentSettings, saveMpesaSettings, saveMollieSettings, saveGeneralPaymentSettings, saveNexusPaySettings } from '@/modules/admin/api/payment.api'
import { testMpesaConnection } from '@/services/mpesaService'
import { testMakamescoConnection } from '@/services/makamescoService'
import { SubscriptionPackage } from '@/lib/supabaseEntities'

export default function AdminPaymentSettingsPage() {
  const { success, error } = useToast()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [activeTab, setActiveTab] = useState('mpesa')
  const [packages, setPackages] = useState([])
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)

  const [newPackage, setNewPackage] = useState({
    name: '',
    price: 0,
    billing_cycle: 'monthly',
    connects_per_month: 0,
    features: [],
    description: ''
  })

  const [mpesaSettings, setMpesaSettings] = useState({
    enabled: true,
    mode: 'sandbox',
    consumerKey: '',
    consumerSecret: '',
    shortcode: '',
    passkey: '',
    callbackUrl: '',
    timeoutUrl: '',
    accountType: 'paybill',
    currency: 'KES',
    description: 'SmartGigs Kenya Payment',
  })

  const [mollieSettings, setMollieSettings] = useState({
    enabled: true,
    mode: 'test',
    apiKey: '',
    profileId: '',
    webhookUrl: '',
    redirectUrl: '',
    currency: 'EUR',
    description: 'SmartGigs Kenya Payment',
    locale: 'en_US',
    captureMethod: 'automatic'
  })

  const [nexusPaySettings, setNexusPaySettings] = useState({
    enabled: false,
    secretKey: '',
    publicKey: '',
    settlementAccountId: '',
    tenantCode: '',
    currency: 'KES',
    description: 'SmartGigs Kenya Payment',
  })

  const [paymentSettings, setPaymentSettings] = useState({
    enablePayments: true,
    defaultCurrency: 'EUR',
    supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF'],
    minAmount: 1,
    maxAmount: 50000,
    refundPolicy: '14 days',
    enableSubscriptions: true,
    enableInvoicing: true,
    taxRate: 0,
    enableTaxCalculation: false
  })

  // Load settings on mount
  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPaymentSettings()
      if (data) {
        if (data.mpesa_settings) {
          setMpesaSettings(prev => ({ ...prev, ...data.mpesa_settings }))
        }
        if (data.mollie_settings) {
          setMollieSettings(prev => ({ ...prev, ...data.mollie_settings }))
        }
        if (data.nexuspay_settings) {
          setNexusPaySettings(prev => ({ ...prev, ...data.nexuspay_settings }))
        }
        if (data.general_settings) {
          setPaymentSettings(prev => ({ ...prev, ...data.general_settings }))
        }
      }
      // Load subscription packages
      const pkgs = await SubscriptionPackage.list()
      setPackages(pkgs || [])
    } catch (err) {

      // Non-fatal — defaults are already set
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSaveMpesaSettings = async () => {
    setSaving(true)
    try {
      await saveMpesaSettings(mpesaSettings)
      success('Saved', 'M-Pesa settings saved successfully')
    } catch (err) {

      error('Failed', 'Failed to save M-Pesa settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestMpesaConnection = async () => {
    setTesting(true)
    try {
      const result = await testMpesaConnection(mpesaSettings)
      if (result.success) {
        success('Success', result.message)
      } else {
        error('Failed', result.message)
      }
    } catch (err) {
      error('Failed', err.message || 'M-Pesa connection test failed')
    } finally {
      setTesting(false)
    }
  }

  const handleSaveMollieSettings = async () => {
    setSaving(true)
    try {
      await saveMollieSettings(mollieSettings)
      success('Saved', 'Mollie settings saved successfully')
    } catch (err) {

      error('Failed', 'Failed to save Mollie settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNexusPaySettings = async () => {
    setSaving(true)
    try {
      await saveNexusPaySettings(nexusPaySettings)
      success('Saved', 'Nexus Pay settings saved successfully')
    } catch (err) {

      error('Failed', 'Failed to save Nexus Pay settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestNexusPayConnection = async () => {
    setTesting(true)
    try {
      const result = await testMakamescoConnection({
        secretKey: nexusPaySettings.secretKey,
        phoneNumber: '254700000000' // Test number
      })
      if (result.success) {
        success('Success', result.message)
      } else {
        error('Failed', result.message)
      }
    } catch (err) {
      error('Failed', err.message || 'Makamesco connection test failed')
    } finally {
      setTesting(false)
    }
  }

  const handleSavePaymentSettings = async () => {
    setSaving(true)
    try {
      await saveGeneralPaymentSettings(paymentSettings)
      success('Saved', 'Payment settings saved successfully')
    } catch (err) {

      error('Failed', 'Failed to save payment settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      if (!mollieSettings.apiKey) {
        error('Missing', 'Mollie API key is required to test connection')
        return
      }
      const response = await fetch('https://api.mollie.com/v2/methods', {
        headers: { Authorization: `Bearer ${mollieSettings.apiKey}` },
      })
      if (response.ok) {
        success('Success', 'Mollie connection test successful')
      } else {
        error('Failed', `Mollie connection test failed (${response.status})`)
      }
    } catch (err) {
      error('Failed', err.message || 'Connection test failed')
    } finally {
      setTesting(false)
    }
  }

  // Subscription Package Functions
  const handleCreatePackage = async () => {
    setSaving(true)
    try {
      await SubscriptionPackage.create(newPackage)
      success('Created', 'Subscription package created successfully')
      setShowPackageModal(false)
      setNewPackage({ name: '', price: 0, billing_cycle: 'monthly', connects_per_month: 0, features: [], description: '' })
      loadSettings()
    } catch (err) {
      error('Failed', 'Failed to create package')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePackage = async () => {
    if (!editingPackage) return
    setSaving(true)
    try {
      await SubscriptionPackage.update(editingPackage.id, editingPackage)
      success('Updated', 'Subscription package updated successfully')
      setEditingPackage(null)
      setShowPackageModal(false)
      loadSettings()
    } catch (err) {
      error('Failed', 'Failed to update package')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePackage = async (id) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    try {
      await SubscriptionPackage.delete(id)
      success('Deleted', 'Subscription package deleted successfully')
      loadSettings()
    } catch (err) {
      error('Failed', 'Failed to delete package')
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-1">Configure M-Pesa (default), Mollie payment gateways and billing settings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Loading payment settings...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Modern Tabs */}
            <div className="flex gap-2 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('mpesa')}
                className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'mpesa' ? 'border-[#8B5CF6] text-[#8B5CF6]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
              >
                <Smartphone className="w-4 h-4" />
                M-Pesa
                <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Default</span>
              </button>
              <button
                onClick={() => setActiveTab('mollie')}
                className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'mollie' ? 'border-[#8B5CF6] text-[#8B5CF6]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
              >
                <Globe className="w-4 h-4" />
                Mollie
              </button>
              <button
                onClick={() => setActiveTab('nexuspay')}
                className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'nexuspay' ? 'border-[#8B5CF6] text-[#8B5CF6]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
              >
                <TestTube className="w-4 h-4" />
                Nexus Pay
              </button>
              <button
                onClick={() => setActiveTab('packages')}
                className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'packages' ? 'border-[#8B5CF6] text-[#8B5CF6]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
              >
                <Crown className="w-4 h-4" />
                Subscription Packages
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-2 px-5 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'general' ? 'border-[#8B5CF6] text-[#8B5CF6]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
              >
                <SettingsIcon className="w-4 h-4" />
                General
              </button>
            </div>

            {/* Subscription Packages Tab */}
            {activeTab === 'packages' && (
              <div className="max-w-4xl space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <Crown className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Subscription Packages</h2>
                        <p className="text-sm text-gray-500">Manage subscription plans and connect limits</p>
                      </div>
                    </div>
                    <Button onClick={() => { setEditingPackage(null); setNewPackage({ name: '', price: 0, billing_cycle: 'monthly', connects_per_month: 0, features: [], description: '' }); setShowPackageModal(true); }} className="bg-purple-600 text-white hover:bg-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Package
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                            <p className="text-2xl font-bold text-purple-600">${pkg.price}/{pkg.billing_cycle}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingPackage(pkg); setNewPackage(pkg); setShowPackageModal(true); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                              <SettingsIcon className="w-4 h-4 text-gray-500" />
                            </button>
                            <button onClick={() => handleDeletePackage(pkg.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Crown className="w-4 h-4 text-purple-500" />
                            <span>{pkg.connects_per_month} connects/month</span>
                          </div>
                          {pkg.features && pkg.features.length > 0 && (
                            <div className="space-y-1">
                              {pkg.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-gray-600">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Package Modal */}
            {showPackageModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{editingPackage ? 'Edit Package' : 'Create Package'}</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Package Name</label>
                      <input value={newPackage.name} onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Pro, Premium" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Price</label>
                      <input type="number" value={newPackage.price} onChange={(e) => setNewPackage({ ...newPackage, price: parseFloat(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Billing Cycle</label>
                      <select value={newPackage.billing_cycle} onChange={(e) => setNewPackage({ ...newPackage, billing_cycle: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Connects Per Month</label>
                      <input type="number" value={newPackage.connects_per_month} onChange={(e) => setNewPackage({ ...newPackage, connects_per_month: parseInt(e.target.value) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                      <textarea value={newPackage.description} onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none" placeholder="Package description" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={() => setShowPackageModal(false)} variant="outline" className="flex-1">Cancel</Button>
                      <Button onClick={editingPackage ? handleUpdatePackage : handleCreatePackage} disabled={saving} className="flex-1 bg-purple-600 text-white hover:bg-purple-700">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingPackage ? 'Update' : 'Create')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mpesa' && (
              <div className="max-w-4xl space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-50 rounded-xl">
                        <Smartphone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">M-Pesa Configuration</h2>
                        <p className="text-sm text-gray-500">Configure your M-Pesa Daraja API payment gateway (Default)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${mpesaSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {mpesaSettings.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setMpesaSettings({ ...mpesaSettings, enabled: !mpesaSettings.enabled })}
                        className="p-2"
                      >
                        {mpesaSettings.enabled ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {mpesaSettings.enabled && (
                    <div className="space-y-5">
                      <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="text-sm text-green-800">
                            <p className="font-medium mb-1">M-Pesa Daraja API Credentials</p>
                            <p className="text-green-700">Get your consumer key and secret from the Safaricom Daraja API portal. Sandbox mode uses test credentials, production requires live credentials.</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mode</label>
                          <select
                            value={mpesaSettings.mode}
                            onChange={(e) => setMpesaSettings({ ...mpesaSettings, mode: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="sandbox">Sandbox (Test)</option>
                            <option value="production">Production (Live)</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Use sandbox for development</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type</label>
                          <select
                            value={mpesaSettings.accountType}
                            onChange={(e) => setMpesaSettings({ ...mpesaSettings, accountType: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="paybill">Paybill</option>
                            <option value="till">Till Number</option>
                            <option value="shortcode">Shortcode (Buy Goods)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Consumer Key</label>
                        <input
                          type="password"
                          value={mpesaSettings.consumerKey}
                          onChange={(e) => setMpesaSettings({ ...mpesaSettings, consumerKey: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Your Daraja API consumer key"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Consumer Secret</label>
                        <input
                          type="password"
                          value={mpesaSettings.consumerSecret}
                          onChange={(e) => setMpesaSettings({ ...mpesaSettings, consumerSecret: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Your Daraja API consumer secret"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Shortcode</label>
                          <input
                            type="text"
                            value={mpesaSettings.shortcode}
                            onChange={(e) => setMpesaSettings({ ...mpesaSettings, shortcode: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., 174379"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Passkey</label>
                          <input
                            type="password"
                            value={mpesaSettings.passkey}
                            onChange={(e) => setMpesaSettings({ ...mpesaSettings, passkey: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Lipa Na M-Pesa passkey"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Callback URL (Confirmation)</label>
                        <input
                          type="url"
                          value={mpesaSettings.callbackUrl}
                          onChange={(e) => setMpesaSettings({ ...mpesaSettings, callbackUrl: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="https://yourdomain.com/api/mpesa/callback"
                        />
                        <p className="text-xs text-gray-500 mt-1">URL where Safaricom sends payment confirmation</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Timeout / Validation URL</label>
                        <input
                          type="url"
                          value={mpesaSettings.timeoutUrl}
                          onChange={(e) => setMpesaSettings({ ...mpesaSettings, timeoutUrl: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="https://yourdomain.com/api/mpesa/timeout"
                        />
                        <p className="text-xs text-gray-500 mt-1">URL for C2B validation and timeout callbacks</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                          <select
                            value={mpesaSettings.currency}
                            onChange={(e) => setMpesaSettings({ ...mpesaSettings, currency: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="KES">KES (Kenyan Shilling)</option>
                            <option value="USD">USD (US Dollar)</option>
                            <option value="EUR">EUR (Euro)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Description</label>
                          <input
                            type="text"
                            value={mpesaSettings.description}
                            onChange={(e) => setMpesaSettings({ ...mpesaSettings, description: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            maxLength={200}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button onClick={handleTestMpesaConnection} disabled={testing} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                          {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                          {testing ? 'Testing...' : 'Test Connection'}
                        </Button>
                        <Button onClick={handleSaveMpesaSettings} disabled={saving} className="bg-green-600 text-white hover:bg-green-700">
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'mollie' && (
              <div className="max-w-4xl space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Zap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Mollie Configuration</h2>
                        <p className="text-sm text-gray-500">Configure your Mollie payment gateway</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${mollieSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {mollieSettings.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setMollieSettings({ ...mollieSettings, enabled: !mollieSettings.enabled })}
                        className="p-2"
                      >
                        {mollieSettings.enabled ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {mollieSettings.enabled && (
                    <div className="space-y-5">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Mollie API Credentials</p>
                            <p className="text-blue-700">Get your API keys from the Mollie Dashboard. Test mode uses test keys, live mode requires live keys.</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mode</label>
                          <select
                            value={mollieSettings.mode}
                            onChange={(e) => setMollieSettings({ ...mollieSettings, mode: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="test">Test Mode</option>
                            <option value="live">Live Mode</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">Use test mode for development</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                          <select
                            value={mollieSettings.currency}
                            onChange={(e) => setMollieSettings({ ...mollieSettings, currency: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="EUR">EUR (Euro)</option>
                            <option value="USD">USD (US Dollar)</option>
                            <option value="GBP">GBP (British Pound)</option>
                            <option value="CHF">CHF (Swiss Franc)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">API Key</label>
                        <input
                          type="password"
                          value={mollieSettings.apiKey}
                          onChange={(e) => setMollieSettings({ ...mollieSettings, apiKey: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="test_dHar4XY7LxsDOtmnkVtjPVWXqy..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Your Mollie API key (starts with test_ or live_)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Profile ID</label>
                        <input
                          type="text"
                          value={mollieSettings.profileId}
                          onChange={(e) => setMollieSettings({ ...mollieSettings, profileId: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="pfl_3RvSN8..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional: Your Mollie profile ID for multi-profile setups</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Webhook URL</label>
                        <input
                          type="url"
                          value={mollieSettings.webhookUrl}
                          onChange={(e) => setMollieSettings({ ...mollieSettings, webhookUrl: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://yourdomain.com/api/webhooks/mollie"
                        />
                        <p className="text-xs text-gray-500 mt-1">URL where Mollie will send payment status updates</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Redirect URL</label>
                        <input
                          type="url"
                          value={mollieSettings.redirectUrl}
                          onChange={(e) => setMollieSettings({ ...mollieSettings, redirectUrl: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://yourdomain.com/payment/return"
                        />
                        <p className="text-xs text-gray-500 mt-1">URL where customers are redirected after payment</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Locale</label>
                          <select
                            value={mollieSettings.locale}
                            onChange={(e) => setMollieSettings({ ...mollieSettings, locale: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="en_US">English (US)</option>
                            <option value="en_GB">English (UK)</option>
                            <option value="nl_NL">Dutch</option>
                            <option value="de_DE">German</option>
                            <option value="fr_FR">French</option>
                            <option value="es_ES">Spanish</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Capture Method</label>
                          <select
                            value={mollieSettings.captureMethod}
                            onChange={(e) => setMollieSettings({ ...mollieSettings, captureMethod: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="automatic">Automatic</option>
                            <option value="manual">Manual</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">When to capture the payment</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Description</label>
                        <input
                          type="text"
                          value={mollieSettings.description}
                          onChange={(e) => setMollieSettings({ ...mollieSettings, description: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-1">Description shown on payment page</p>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button onClick={handleTestConnection} disabled={testing} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                          {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                          {testing ? 'Testing...' : 'Test Connection'}
                        </Button>
                        <Button onClick={handleSaveMollieSettings} disabled={saving} className="bg-blue-600 text-white hover:bg-blue-700">
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'nexuspay' && (
              <div className="max-w-4xl space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Makamesco/Nexus Pay</h2>
                        <p className="text-sm text-gray-500">Third-party M-Pesa STK Push, card & B2C gateway — makamescopay.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${nexusPaySettings.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {nexusPaySettings.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setNexusPaySettings({ ...nexusPaySettings, enabled: !nexusPaySettings.enabled })}
                        className="p-2"
                      >
                        {nexusPaySettings.enabled ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {nexusPaySettings.enabled && (
                    <div className="space-y-5">
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div className="text-sm text-purple-800">
                            <p className="font-medium mb-1">Nexus Pay API Credentials</p>
                            <p className="text-purple-700">
                              Get your API keys from the{' '}
                              <a href="https://makamescopay.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                                Nexus Pay dashboard
                              </a>
                              . Go to API Keys → Create API Key. Copy both your Public Key (pk_...) and Secret Key (sk_...).
                              Store the Secret Key safely — you can only see it once.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Secret Key (sk_...)</label>
                        <input
                          type="password"
                          value={nexusPaySettings.secretKey}
                          onChange={(e) => setNexusPaySettings({ ...nexusPaySettings, secretKey: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="sk_your_secret_key_here"
                        />
                        <p className="text-xs text-gray-500 mt-1">Required for all payment API calls. Never share publicly.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Public Key (pk_...)</label>
                        <input
                          type="text"
                          value={nexusPaySettings.publicKey}
                          onChange={(e) => setNexusPaySettings({ ...nexusPaySettings, publicKey: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="pk_your_public_key_here"
                        />
                        <p className="text-xs text-gray-500 mt-1">Safe for frontend use. Identifies your account.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Settlement Account ID</label>
                          <input
                            type="text"
                            value={nexusPaySettings.settlementAccountId}
                            onChange={(e) => setNexusPaySettings({ ...nexusPaySettings, settlementAccountId: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., 1"
                          />
                          <p className="text-xs text-gray-500 mt-1">ID of your M-Pesa till/paybill settlement account</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Tenant Code (SaaS only)</label>
                          <input
                            type="text"
                            value={nexusPaySettings.tenantCode}
                            onChange={(e) => setNexusPaySettings({ ...nexusPaySettings, tenantCode: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="tnnt_abc12345"
                          />
                          <p className="text-xs text-gray-500 mt-1">Optional: routes to a specific tenant's settlement</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Currency</label>
                          <select
                            value={nexusPaySettings.currency}
                            onChange={(e) => setNexusPaySettings({ ...nexusPaySettings, currency: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="KES">KES (Kenyan Shilling)</option>
                            <option value="USD">USD (US Dollar)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Description</label>
                          <input
                            type="text"
                            value={nexusPaySettings.description}
                            onChange={(e) => setNexusPaySettings({ ...nexusPaySettings, description: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            maxLength={200}
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Quick Start Checklist:</p>
                        <ul className="space-y-1.5 text-sm text-gray-600">
                          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Register at makamescopay.com/register</li>
                          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Create API Key in dashboard → API Keys</li>
                          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Add settlement account (M-Pesa till/paybill)</li>
                          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Use 2 free sandbox transactions to test</li>
                          <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Activate account (KES 100/mo or KES 500/yr) to go live</li>
                        </ul>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button onClick={handleTestNexusPayConnection} disabled={testing} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                          {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
                          {testing ? 'Testing...' : 'Test Connection'}
                        </Button>
                        <Button onClick={handleSaveNexusPaySettings} disabled={saving} className="bg-purple-600 text-white hover:bg-purple-700">
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save Settings'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="max-w-4xl space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gray-100 rounded-xl">
                      <SettingsIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">General Payment Settings</h2>
                      <p className="text-sm text-gray-500">Configure payment processing rules and limits</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Enable Payments</div>
                        <div className="text-sm text-gray-500">Enable payment processing globally</div>
                      </div>
                      <button
                        onClick={() => setPaymentSettings({ ...paymentSettings, enablePayments: !paymentSettings.enablePayments })}
                        className="p-2"
                      >
                        {paymentSettings.enablePayments ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Currency</label>
                        <select
                          value={paymentSettings.defaultCurrency}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, defaultCurrency: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        >
                          <option value="EUR">EUR (Euro)</option>
                          <option value="USD">USD (US Dollar)</option>
                          <option value="GBP">GBP (British Pound)</option>
                          <option value="CHF">CHF (Swiss Franc)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Amount</label>
                        <input
                          type="number"
                          value={paymentSettings.minAmount}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, minAmount: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Amount</label>
                        <input
                          type="number"
                          value={paymentSettings.maxAmount}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, maxAmount: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Refund Policy</label>
                        <input
                          type="text"
                          value={paymentSettings.refundPolicy}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, refundPolicy: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          placeholder="e.g., 14 days"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Enable Subscriptions</div>
                        <div className="text-sm text-gray-500">Allow recurring payments via Mollie</div>
                      </div>
                      <button
                        onClick={() => setPaymentSettings({ ...paymentSettings, enableSubscriptions: !paymentSettings.enableSubscriptions })}
                        className="p-2"
                      >
                        {paymentSettings.enableSubscriptions ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Enable Invoicing</div>
                        <div className="text-sm text-gray-500">Generate invoices for payments</div>
                      </div>
                      <button
                        onClick={() => setPaymentSettings({ ...paymentSettings, enableInvoicing: !paymentSettings.enableInvoicing })}
                        className="p-2"
                      >
                        {paymentSettings.enableInvoicing ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Rate (%)</label>
                        <input
                          type="number"
                          value={paymentSettings.taxRate}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, taxRate: parseFloat(e.target.value) })}
                          step="0.01"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">Auto Tax Calculation</div>
                          <div className="text-sm text-gray-500">Calculate tax automatically</div>
                        </div>
                        <button
                          onClick={() => setPaymentSettings({ ...paymentSettings, enableTaxCalculation: !paymentSettings.enableTaxCalculation })}
                          className="p-2"
                        >
                          {paymentSettings.enableTaxCalculation ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button onClick={handleSavePaymentSettings} disabled={saving} className="bg-gray-900 text-white hover:bg-gray-800 px-8">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )
        }
      </div >
    </div >
  )
}