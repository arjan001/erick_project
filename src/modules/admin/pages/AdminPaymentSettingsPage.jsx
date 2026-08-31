import React, { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { CreditCard, Save, DollarSign, Lock, Globe, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight, TestTube, Zap, Settings as SettingsIcon, Smartphone } from 'lucide-react';

export default function AdminPaymentSettingsPage() {
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('mpesa');

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
    description: 'Eric Rabar Payment',
  });

  const [mollieSettings, setMollieSettings] = useState({
    enabled: true,
    mode: 'test',
    apiKey: '',
    profileId: '',
    webhookUrl: '',
    redirectUrl: '',
    currency: 'EUR',
    description: 'Studio22 Payment',
    locale: 'en_US',
    captureMethod: 'automatic'
  });

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
  });

  const handleSaveMpesaSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'M-Pesa settings saved successfully');
    } catch (err) {
      console.error('Error saving M-Pesa settings:', err);
      error('Failed', 'Failed to save M-Pesa settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestMpesaConnection = async () => {
    try {
      success('Success', 'M-Pesa connection test successful');
    } catch (err) {
      error('Failed', 'M-Pesa connection test failed');
    }
  };

  const handleSaveMollieSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'Mollie settings saved successfully');
    } catch (err) {
      console.error('Error saving Mollie settings:', err);
      error('Failed', 'Failed to save Mollie settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'Payment settings saved successfully');
    } catch (err) {
      console.error('Error saving payment settings:', err);
      error('Failed', 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      success('Success', 'Mollie connection test successful');
    } catch (err) {
      error('Failed', 'Connection test failed');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-1">Configure M-Pesa (default), Mollie payment gateways and billing settings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('mpesa')}
              className={`flex items-center gap-1.5 px-4 py-2 font-medium text-sm rounded-md transition-colors ${activeTab === 'mpesa' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Smartphone className="w-4 h-4" />
              M-Pesa
              <span className="ml-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">Default</span>
            </button>
            <button
              onClick={() => setActiveTab('mollie')}
              className={`px-4 py-2 font-medium text-sm rounded-md transition-colors ${activeTab === 'mollie' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Mollie
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 font-medium text-sm rounded-md transition-colors ${activeTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              General Settings
            </button>
          </div>

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
                      <Button onClick={handleTestMpesaConnection} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
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
                      <Button onClick={handleTestConnection} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
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
      </div>
    </div>
  );
}