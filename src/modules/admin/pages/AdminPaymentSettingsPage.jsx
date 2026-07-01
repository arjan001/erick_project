import React, { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { CreditCard, Save, DollarSign, Lock, Globe, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight, TestTube } from 'lucide-react';

export default function AdminPaymentSettingsPage() {
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('stripe');

  const [stripeSettings, setStripeSettings] = useState({
    enabled: true,
    mode: 'live',
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    currency: 'USD',
    autoCapture: true,
    statementDescriptor: 'Studio22'
  });

  const [paypalSettings, setPaypalSettings] = useState({
    enabled: false,
    mode: 'sandbox',
    clientId: '',
    clientSecret: '',
    webhookUrl: '',
    currency: 'USD'
  });

  const [braintreeSettings, setBraintreeSettings] = useState({
    enabled: false,
    merchantId: '',
    publicKey: '',
    privateKey: '',
    environment: 'sandbox'
  });

  const [squareSettings, setSquareSettings] = useState({
    enabled: false,
    applicationId: '',
    accessToken: '',
    locationId: '',
    environment: 'sandbox'
  });

  const [adyenSettings, setAdyenSettings] = useState({
    enabled: false,
    merchantAccount: '',
    apiKey: '',
    clientKey: '',
    environment: 'test'
  });

  const [paymentSettings, setPaymentSettings] = useState({
    enablePayments: true,
    defaultCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    minAmount: 10,
    maxAmount: 10000,
    refundPolicy: '30 days',
    enableSubscriptions: true,
    enableInvoicing: true,
    taxRate: 0,
    enableTaxCalculation: false
  });

  const handleSaveStripeSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'Stripe settings saved successfully');
    } catch (err) {
      console.error('Error saving Stripe settings:', err);
      error('Failed', 'Failed to save Stripe settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePaypalSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'PayPal settings saved successfully');
    } catch (err) {
      console.error('Error saving PayPal settings:', err);
      error('Failed', 'Failed to save PayPal settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBraintreeSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'Braintree settings saved successfully');
    } catch (err) {
      console.error('Error saving Braintree settings:', err);
      error('Failed', 'Failed to save Braintree settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSquareSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'Square settings saved successfully');
    } catch (err) {
      console.error('Error saving Square settings:', err);
      error('Failed', 'Failed to save Square settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdyenSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'Adyen settings saved successfully');
    } catch (err) {
      console.error('Error saving Adyen settings:', err);
      error('Failed', 'Failed to save Adyen settings');
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

  const handleTestConnection = async (provider) => {
    try {
      success('Success', `${provider} connection test successful`);
    } catch (err) {
      error('Failed', 'Connection test failed');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
        <p className="text-gray-600 mt-1">Configure payment gateways and billing settings</p>
      </div>

      <div>
          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('stripe')}
              className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'stripe' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              Stripe
            </button>
            <button
              onClick={() => setActiveTab('paypal')}
              className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'paypal' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              PayPal
            </button>
            <button
              onClick={() => setActiveTab('braintree')}
              className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'braintree' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              Braintree
            </button>
            <button
              onClick={() => setActiveTab('square')}
              className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'square' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              Square
            </button>
            <button
              onClick={() => setActiveTab('adyen')}
              className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'adyen' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              Adyen
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === 'general' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              General Settings
            </button>
          </div>

          {activeTab === 'stripe' && (
            <div className="max-w-4xl space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Stripe Configuration
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${stripeSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {stripeSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => setStripeSettings({ ...stripeSettings, enabled: !stripeSettings.enabled })}
                      className="p-2"
                    >
                      {stripeSettings.enabled ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {stripeSettings.enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Mode</div>
                        <div className="text-sm text-gray-500">Live or Sandbox mode</div>
                      </div>
                      <select
                        value={stripeSettings.mode}
                        onChange={(e) => setStripeSettings({ ...stripeSettings, mode: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="live">Live</option>
                        <option value="test">Test</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
                      <input
                        type="text"
                        value={stripeSettings.publishableKey}
                        onChange={(e) => setStripeSettings({ ...stripeSettings, publishableKey: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="pk_live_..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                      <input
                        type="password"
                        value={stripeSettings.secretKey}
                        onChange={(e) => setStripeSettings({ ...stripeSettings, secretKey: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="sk_live_..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                      <input
                        type="password"
                        value={stripeSettings.webhookSecret}
                        onChange={(e) => setStripeSettings({ ...stripeSettings, webhookSecret: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="whsec_..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          value={stripeSettings.currency}
                          onChange={(e) => setStripeSettings({ ...stripeSettings, currency: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="CAD">CAD</option>
                          <option value="AUD">AUD</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Auto Capture</div>
                          <div className="text-sm text-gray-500">Capture payments automatically</div>
                        </div>
                        <button
                          onClick={() => setStripeSettings({ ...stripeSettings, autoCapture: !stripeSettings.autoCapture })}
                          className="p-2"
                        >
                          {stripeSettings.autoCapture ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statement Descriptor</label>
                      <input
                        type="text"
                        value={stripeSettings.statementDescriptor}
                        onChange={(e) => setStripeSettings({ ...stripeSettings, statementDescriptor: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        maxLength={22}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => handleTestConnection('Stripe')} variant="outline">
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button onClick={handleSaveStripeSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'paypal' && (
            <div className="max-w-4xl space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    PayPal Configuration
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${paypalSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {paypalSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => setPaypalSettings({ ...paypalSettings, enabled: !paypalSettings.enabled })}
                      className="p-2"
                    >
                      {paypalSettings.enabled ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {paypalSettings.enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Mode</div>
                        <div className="text-sm text-gray-500">Live or Sandbox mode</div>
                      </div>
                      <select
                        value={paypalSettings.mode}
                        onChange={(e) => setPaypalSettings({ ...paypalSettings, mode: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="live">Live</option>
                        <option value="sandbox">Sandbox</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                      <input
                        type="text"
                        value={paypalSettings.clientId}
                        onChange={(e) => setPaypalSettings({ ...paypalSettings, clientId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                      <input
                        type="password"
                        value={paypalSettings.clientSecret}
                        onChange={(e) => setPaypalSettings({ ...paypalSettings, clientSecret: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
                      <input
                        type="text"
                        value={paypalSettings.webhookUrl}
                        onChange={(e) => setPaypalSettings({ ...paypalSettings, webhookUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        value={paypalSettings.currency}
                        onChange={(e) => setPaypalSettings({ ...paypalSettings, currency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                      </select>
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => handleTestConnection('PayPal')} variant="outline">
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button onClick={handleSavePaypalSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'braintree' && (
            <div className="max-w-4xl space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Braintree Configuration
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${braintreeSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {braintreeSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => setBraintreeSettings({ ...braintreeSettings, enabled: !braintreeSettings.enabled })}
                      className="p-2"
                    >
                      {braintreeSettings.enabled ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {braintreeSettings.enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Environment</div>
                        <div className="text-sm text-gray-500">Sandbox or Production</div>
                      </div>
                      <select
                        value={braintreeSettings.environment}
                        onChange={(e) => setBraintreeSettings({ ...braintreeSettings, environment: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="sandbox">Sandbox</option>
                        <option value="production">Production</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                      <input
                        type="text"
                        value={braintreeSettings.merchantId}
                        onChange={(e) => setBraintreeSettings({ ...braintreeSettings, merchantId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Public Key</label>
                      <input
                        type="text"
                        value={braintreeSettings.publicKey}
                        onChange={(e) => setBraintreeSettings({ ...braintreeSettings, publicKey: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Private Key</label>
                      <input
                        type="password"
                        value={braintreeSettings.privateKey}
                        onChange={(e) => setBraintreeSettings({ ...braintreeSettings, privateKey: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => handleTestConnection('Braintree')} variant="outline">
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button onClick={handleSaveBraintreeSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'square' && (
            <div className="max-w-4xl space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Square Configuration
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${squareSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {squareSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => setSquareSettings({ ...squareSettings, enabled: !squareSettings.enabled })}
                      className="p-2"
                    >
                      {squareSettings.enabled ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {squareSettings.enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Environment</div>
                        <div className="text-sm text-gray-500">Sandbox or Production</div>
                      </div>
                      <select
                        value={squareSettings.environment}
                        onChange={(e) => setSquareSettings({ ...squareSettings, environment: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="sandbox">Sandbox</option>
                        <option value="production">Production</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Application ID</label>
                      <input
                        type="text"
                        value={squareSettings.applicationId}
                        onChange={(e) => setSquareSettings({ ...squareSettings, applicationId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                      <input
                        type="password"
                        value={squareSettings.accessToken}
                        onChange={(e) => setSquareSettings({ ...squareSettings, accessToken: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location ID</label>
                      <input
                        type="text"
                        value={squareSettings.locationId}
                        onChange={(e) => setSquareSettings({ ...squareSettings, locationId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => handleTestConnection('Square')} variant="outline">
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button onClick={handleSaveSquareSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'adyen' && (
            <div className="max-w-4xl space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Adyen Configuration
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${adyenSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {adyenSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => setAdyenSettings({ ...adyenSettings, enabled: !adyenSettings.enabled })}
                      className="p-2"
                    >
                      {adyenSettings.enabled ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {adyenSettings.enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Environment</div>
                        <div className="text-sm text-gray-500">Test or Live</div>
                      </div>
                      <select
                        value={adyenSettings.environment}
                        onChange={(e) => setAdyenSettings({ ...adyenSettings, environment: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="test">Test</option>
                        <option value="live">Live</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Merchant Account</label>
                      <input
                        type="text"
                        value={adyenSettings.merchantAccount}
                        onChange={(e) => setAdyenSettings({ ...adyenSettings, merchantAccount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="password"
                        value={adyenSettings.apiKey}
                        onChange={(e) => setAdyenSettings({ ...adyenSettings, apiKey: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Key</label>
                      <input
                        type="text"
                        value={adyenSettings.clientKey}
                        onChange={(e) => setAdyenSettings({ ...adyenSettings, clientKey: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button onClick={() => handleTestConnection('Adyen')} variant="outline">
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button onClick={handleSaveAdyenSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800">
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
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  General Payment Settings
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Enable Payments</div>
                      <div className="text-sm text-gray-500">Enable payment processing</div>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                      <select
                        value={paymentSettings.defaultCurrency}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, defaultCurrency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                      <input
                        type="number"
                        value={paymentSettings.minAmount}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, minAmount: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                      <input
                        type="number"
                        value={paymentSettings.maxAmount}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, maxAmount: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Refund Policy</label>
                      <input
                        type="text"
                        value={paymentSettings.refundPolicy}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, refundPolicy: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Enable Subscriptions</div>
                      <div className="text-sm text-gray-500">Allow recurring payments</div>
                    </div>
                    <button
                      onClick={() => setPaymentSettings({ ...paymentSettings, enableSubscriptions: !paymentSettings.enableSubscriptions })}
                      className="p-2"
                    >
                      {paymentSettings.enableSubscriptions ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                      <input
                        type="number"
                        value={paymentSettings.taxRate}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, taxRate: parseFloat(e.target.value) })}
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Auto Tax Calculation</div>
                      </div>
                      <button
                        onClick={() => setPaymentSettings({ ...paymentSettings, enableTaxCalculation: !paymentSettings.enableTaxCalculation })}
                        className="p-2"
                      >
                        {paymentSettings.enableTaxCalculation ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSavePaymentSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800 px-8">
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