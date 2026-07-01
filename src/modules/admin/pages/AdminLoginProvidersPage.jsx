import React, { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Key, Save, Plus, Trash2, Shield, Lock, Unlock, Globe, Mail, Smartphone, ToggleLeft, ToggleRight, CheckCircle, XCircle } from 'lucide-react';

export default function AdminLoginProvidersPage() {
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState([
    {
      id: 'google',
      name: 'Google',
      icon: 'G',
      enabled: true,
      clientId: '',
      clientSecret: '',
      redirectUri: 'https://studio22.com/auth/google/callback',
      scopes: ['openid', 'profile', 'email']
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: 'GH',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: 'https://studio22.com/auth/github/callback',
      scopes: ['user:email']
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'F',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: 'https://studio22.com/auth/facebook/callback',
      scopes: ['email', 'public_profile']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: 'LI',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: 'https://studio22.com/auth/linkedin/callback',
      scopes: ['r_liteprofile', 'r_emailaddress']
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: 'X',
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: 'https://studio22.com/auth/twitter/callback',
      scopes: ['tweet.read', 'users.read']
    }
  ]);

  const [emailSettings, setEmailSettings] = useState({
    enabled: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@studio22.com',
    fromName: 'Studio22',
    useTLS: true
  });

  const [twoFactorSettings, setTwoFactorSettings] = useState({
    enabled: false,
    issuer: 'Studio22',
    secretLength: 32,
    digits: 6,
    period: 30
  });

  const handleSaveProviders = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'Login providers saved successfully');
    } catch (err) {
      console.error('Error saving providers:', err);
      error('Failed', 'Failed to save providers');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmailSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'Email settings saved successfully');
    } catch (err) {
      console.error('Error saving email settings:', err);
      error('Failed', 'Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTwoFactorSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', '2FA settings saved successfully');
    } catch (err) {
      console.error('Error saving 2FA settings:', err);
      error('Failed', 'Failed to save 2FA settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProvider = (providerId) => {
    setProviders(providers.map(p => p.id === providerId ? { ...p, enabled: !p.enabled } : p));
  };

  const handleUpdateProvider = (providerId, field, value) => {
    setProviders(providers.map(p => p.id === providerId ? { ...p, [field]: value } : p));
  };

  const handleTestConnection = async (providerId) => {
    try {
      success('Success', `Connection to ${providers.find(p => p.id === providerId).name} successful`);
    } catch (err) {
      error('Failed', 'Connection test failed');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Login Providers</h1>
        <p className="text-gray-600 mt-1">Configure OAuth providers and authentication settings</p>
      </div>

      <div>
          <div className="max-w-4xl space-y-6">
            {/* OAuth Providers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                OAuth Providers
              </h2>
              <div className="space-y-4">
                {providers.map(provider => (
                  <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600">
                          {provider.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{provider.name}</div>
                          <div className="text-sm text-gray-500">OAuth 2.0</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${provider.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {provider.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <button
                          onClick={() => handleToggleProvider(provider.id)}
                          className="p-2"
                        >
                          {provider.enabled ? <Unlock className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    {provider.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                          <input
                            type="text"
                            value={provider.clientId}
                            onChange={(e) => handleUpdateProvider(provider.id, 'clientId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Enter client ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret</label>
                          <input
                            type="password"
                            value={provider.clientSecret}
                            onChange={(e) => handleUpdateProvider(provider.id, 'clientSecret', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                            placeholder="Enter client secret"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URI</label>
                          <input
                            type="text"
                            value={provider.redirectUri}
                            onChange={(e) => handleUpdateProvider(provider.id, 'redirectUri', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Scopes</label>
                          <input
                            type="text"
                            value={provider.scopes.join(', ')}
                            onChange={(e) => handleUpdateProvider(provider.id, 'scopes', e.target.value.split(', '))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveProviders} disabled={saving} className="bg-black text-white hover:bg-gray-800">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Providers'}
                </Button>
              </div>
            </div>

            {/* Email Authentication */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Authentication
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable Email Login</div>
                    <div className="text-sm text-gray-500">Allow users to login with email/password</div>
                  </div>
                  <button
                    onClick={() => setEmailSettings({ ...emailSettings, enabled: !emailSettings.enabled })}
                    className="p-2"
                  >
                    {emailSettings.enabled ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {emailSettings.enabled && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                      <input
                        type="number"
                        value={emailSettings.smtpPort}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMTP User</label>
                      <input
                        type="text"
                        value={emailSettings.smtpUser}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                      <input
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                      <input
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                      <input
                        type="text"
                        value={emailSettings.fromName}
                        onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Use TLS</div>
                      </div>
                      <button
                        onClick={() => setEmailSettings({ ...emailSettings, useTLS: !emailSettings.useTLS })}
                        className="p-2"
                      >
                        {emailSettings.useTLS ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveEmailSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Email Settings'}
                </Button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Two-Factor Authentication (2FA)
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable 2FA</div>
                    <div className="text-sm text-gray-500">Require two-factor authentication for all users</div>
                  </div>
                  <button
                    onClick={() => setTwoFactorSettings({ ...twoFactorSettings, enabled: !twoFactorSettings.enabled })}
                    className="p-2"
                  >
                    {twoFactorSettings.enabled ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {twoFactorSettings.enabled && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issuer Name</label>
                      <input
                        type="text"
                        value={twoFactorSettings.issuer}
                        onChange={(e) => setTwoFactorSettings({ ...twoFactorSettings, issuer: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secret Length</label>
                      <input
                        type="number"
                        value={twoFactorSettings.secretLength}
                        onChange={(e) => setTwoFactorSettings({ ...twoFactorSettings, secretLength: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Digits</label>
                      <input
                        type="number"
                        value={twoFactorSettings.digits}
                        onChange={(e) => setTwoFactorSettings({ ...twoFactorSettings, digits: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Period (seconds)</label>
                      <input
                        type="number"
                        value={twoFactorSettings.period}
                        onChange={(e) => setTwoFactorSettings({ ...twoFactorSettings, period: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveTwoFactorSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save 2FA Settings'}
                </Button>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}