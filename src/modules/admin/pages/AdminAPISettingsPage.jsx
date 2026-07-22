import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Key, Save, Plus, Trash2, Copy, RefreshCw, Shield, Clock, AlertTriangle, CheckCircle, ToggleLeft, ToggleRight, Code, Eye, EyeOff, Bot } from 'lucide-react';
import { apiSettingsApi } from '../api/apiSettings.api';
import { useAuth } from '@/lib/AuthContext';

export default function AdminAPISettingsPage() {
  const { success, error } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});
  
  const [apiKeys, setApiKeys] = useState([]);
  const [rateLimits, setRateLimits] = useState({
    enabled: true,
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 20,
    id: null
  });

  const [apiSettings, setApiSettings] = useState({
    enableCORS: true,
    allowedOrigins: ['https://studio22.com', 'https://www.studio22.com'],
    enableAPIKeyAuth: true,
    enableJWTAuth: true,
    jwtExpiration: 3600,
    enableWebhooks: true,
    webhookSecret: '',
    enableAPIVersioning: true,
    currentVersion: 'v1',
    enableLogging: true,
    logRetentionDays: 30,
    id: null
  });

  const [googleDriveSettings, setGoogleDriveSettings] = useState({
    enabled: false,
    clientId: '',
    clientSecret: '',
    apiKey: '',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    id: null
  });

  const [chatGPTSettings, setChatGPTSettings] = useState({
    enabled: false,
    apiKey: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    id: null
  });

  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    scopes: ['read']
  });

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [keysData, rateLimitData, apiConfigData, integrationsData] = await Promise.all([
        apiSettingsApi.getAllApiKeys(),
        apiSettingsApi.getRateLimitingSettings(),
        apiSettingsApi.getApiConfiguration(),
        apiSettingsApi.getAllIntegrations()
      ]);

      setApiKeys(keysData || []);
      
      if (rateLimitData) {
        setRateLimits({
          enabled: rateLimitData.enabled,
          requestsPerMinute: rateLimitData.requests_per_minute,
          requestsPerHour: rateLimitData.requests_per_hour,
          requestsPerDay: rateLimitData.requests_per_day,
          burstLimit: rateLimitData.burst_limit,
          id: rateLimitData.id
        });
      }

      if (apiConfigData) {
        setApiSettings({
          enableCORS: apiConfigData.enable_cors,
          allowedOrigins: apiConfigData.allowed_origins || [],
          enableAPIKeyAuth: apiConfigData.enable_api_key_auth,
          enableJWTAuth: apiConfigData.enable_jwt_auth,
          jwtExpiration: apiConfigData.jwt_expiration_seconds,
          enableWebhooks: apiConfigData.enable_webhooks,
          webhookSecret: apiConfigData.webhook_secret || '',
          enableAPIVersioning: apiConfigData.enable_api_versioning,
          currentVersion: apiConfigData.current_version,
          enableLogging: apiConfigData.enable_logging,
          logRetentionDays: apiConfigData.log_retention_days,
          id: apiConfigData.id
        });
      }

      // Parse integrations
      if (integrationsData) {
        const googleDrive = integrationsData.find(i => i.integration_name === 'google_drive');
        const chatgpt = integrationsData.find(i => i.integration_name === 'chatgpt');

        if (googleDrive) {
          setGoogleDriveSettings({
            enabled: googleDrive.is_enabled,
            clientId: googleDrive.settings?.client_id || '',
            clientSecret: googleDrive.settings?.client_secret || '',
            apiKey: googleDrive.settings?.api_key || '',
            scopes: googleDrive.settings?.scopes || ['https://www.googleapis.com/auth/drive.readonly'],
            id: googleDrive.id
          });
        }

        if (chatgpt) {
          setChatGPTSettings({
            enabled: chatgpt.is_enabled,
            apiKey: chatgpt.settings?.api_key || '',
            model: chatgpt.settings?.model || 'gpt-4',
            temperature: chatgpt.settings?.temperature || 0.7,
            maxTokens: chatgpt.settings?.max_tokens || 2000,
            id: chatgpt.id
          });
        }
      }
    } catch (err) {
      console.error('Error fetching API settings data:', err);
      error('Error', 'Failed to load API settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save rate limiting settings
      if (rateLimits.id) {
        await apiSettingsApi.updateRateLimitingSettings({
          id: rateLimits.id,
          enabled: rateLimits.enabled,
          requests_per_minute: rateLimits.requestsPerMinute,
          requests_per_hour: rateLimits.requestsPerHour,
          requests_per_day: rateLimits.requestsPerDay,
          burst_limit: rateLimits.burstLimit
        });
      }

      // Save API configuration
      if (apiSettings.id) {
        await apiSettingsApi.updateApiConfiguration({
          id: apiSettings.id,
          enable_cors: apiSettings.enableCORS,
          allowed_origins: apiSettings.allowedOrigins,
          enable_api_key_auth: apiSettings.enableAPIKeyAuth,
          enable_jwt_auth: apiSettings.enableJWTAuth,
          jwt_expiration_seconds: apiSettings.jwtExpiration,
          enable_webhooks: apiSettings.enableWebhooks,
          webhook_secret: apiSettings.webhookSecret,
          enable_api_versioning: apiSettings.enableAPIVersioning,
          current_version: apiSettings.currentVersion,
          enable_logging: apiSettings.enableLogging,
          log_retention_days: apiSettings.logRetentionDays
        });
      }

      // Save Google Drive settings
      await apiSettingsApi.updateIntegrationSettings('google_drive', {
        client_id: googleDriveSettings.clientId,
        client_secret: googleDriveSettings.clientSecret,
        api_key: googleDriveSettings.apiKey,
        scopes: googleDriveSettings.scopes
      }, googleDriveSettings.enabled);

      // Save ChatGPT settings
      await apiSettingsApi.updateIntegrationSettings('chatgpt', {
        api_key: chatGPTSettings.apiKey,
        model: chatGPTSettings.model,
        temperature: chatGPTSettings.temperature,
        max_tokens: chatGPTSettings.maxTokens
      }, chatGPTSettings.enabled);

      success('Saved', 'API settings saved successfully');
    } catch (err) {
      console.error('Error saving settings:', err);
      error('Failed', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAPIKey = async () => {
    try {
      const newKey = await apiSettingsApi.createApiKey({
        name: newKeyForm.name,
        scopes: newKeyForm.scopes,
        created_by: user?.id
      });
      
      setApiKeys([...apiKeys, newKey]);
      success('Created', 'API key created successfully');
      setShowAddKeyModal(false);
      setNewKeyForm({ name: '', scopes: ['read'] });
    } catch (err) {
      console.error('Error creating API key:', err);
      error('Failed', 'Failed to create API key');
    }
  };

  const handleDeleteAPIKey = async (keyId) => {
    try {
      await apiSettingsApi.deleteApiKey(keyId);
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      success('Deleted', 'API key deleted successfully');
    } catch (err) {
      console.error('Error deleting API key:', err);
      error('Failed', 'Failed to delete API key');
    }
  };

  const handleRevokeAPIKey = async (keyId) => {
    try {
      await apiSettingsApi.revokeApiKey(keyId);
      setApiKeys(apiKeys.map(k => k.id === keyId ? { ...k, status: 'revoked' } : k));
      success('Revoked', 'API key revoked successfully');
    } catch (err) {
      console.error('Error revoking API key:', err);
      error('Failed', 'Failed to revoke API key');
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    success('Copied', 'API key copied to clipboard');
  };

  const toggleSecretVisibility = (keyId) => {
    setShowSecrets(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Settings</h1>
        <p className="text-gray-600 mt-1">Manage API keys, rate limiting, and authentication</p>
      </div>

      <div>
          <div className="max-w-4xl space-y-6">
            {/* API Keys */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  API Keys
                </h2>
                <Button size="sm" onClick={() => setShowAddKeyModal(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Generate API Key
                </Button>
              </div>
              <div className="space-y-3">
                {apiKeys.map(key => (
                  <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-gray-900">{key.name}</div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${key.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {key.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {key.status === 'active' && (
                          <Button variant="ghost" size="sm" onClick={() => handleRevokeAPIKey(key.id)}>
                            <Shield className="w-4 h-4 text-yellow-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAPIKey(key.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Public Key</div>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{key.public_key}</code>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyKey(key.public_key)}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Secret Key</div>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {showSecrets[key.id] ? key.secret_key : '•'.repeat(20)}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => toggleSecretVisibility(key.id)}>
                            {showSecrets[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                      <span>Last Used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No API keys created yet. Click "Generate API Key" to create one.
                  </div>
                )}
              </div>
            </div>

            {/* Rate Limiting */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Rate Limiting
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable Rate Limiting</div>
                    <div className="text-sm text-gray-500">Limit API requests to prevent abuse</div>
                  </div>
                  <button
                    onClick={() => setRateLimits({ ...rateLimits, enabled: !rateLimits.enabled })}
                    className="p-2"
                  >
                    {rateLimits.enabled ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {rateLimits.enabled && (
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requests/Minute</label>
                      <input
                        type="number"
                        value={rateLimits.requestsPerMinute}
                        onChange={(e) => setRateLimits({ ...rateLimits, requestsPerMinute: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requests/Hour</label>
                      <input
                        type="number"
                        value={rateLimits.requestsPerHour}
                        onChange={(e) => setRateLimits({ ...rateLimits, requestsPerHour: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requests/Day</label>
                      <input
                        type="number"
                        value={rateLimits.requestsPerDay}
                        onChange={(e) => setRateLimits({ ...rateLimits, requestsPerDay: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Burst Limit</label>
                      <input
                        type="number"
                        value={rateLimits.burstLimit}
                        onChange={(e) => setRateLimits({ ...rateLimits, burstLimit: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Google Drive Integration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Google Drive Integration
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable Google Drive</div>
                    <div className="text-sm text-gray-500">Allow artists to connect Google Drive for portfolio uploads</div>
                  </div>
                  <button
                    onClick={() => setGoogleDriveSettings({ ...googleDriveSettings, enabled: !googleDriveSettings.enabled })}
                    className="p-2"
                  >
                    {googleDriveSettings.enabled ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {googleDriveSettings.enabled && (
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">OAuth Client ID</label>
                      <input
                        type="text"
                        value={googleDriveSettings.clientId}
                        onChange={(e) => setGoogleDriveSettings({ ...googleDriveSettings, clientId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter Google OAuth Client ID"
                      />
                      <p className="text-xs text-gray-500 mt-1">Get this from Google Cloud Console → Credentials</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">OAuth Client Secret</label>
                      <input
                        type="password"
                        value={googleDriveSettings.clientSecret}
                        onChange={(e) => setGoogleDriveSettings({ ...googleDriveSettings, clientSecret: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter Google OAuth Client Secret"
                      />
                      <p className="text-xs text-gray-500 mt-1">Keep this secret - never share it</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="text"
                        value={googleDriveSettings.apiKey}
                        onChange={(e) => setGoogleDriveSettings({ ...googleDriveSettings, apiKey: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter Google Places API Key"
                      />
                      <p className="text-xs text-gray-500 mt-1">Required for Google Picker API</p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">Setup Instructions:</h4>
                      <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                        <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                        <li>Create a new project or select existing one</li>
                        <li>Enable "Google Drive API" and "Google Picker API"</li>
                        <li>Go to Credentials → Create OAuth 2.0 Client ID</li>
                        <li>Add your domain to Authorized JavaScript origins</li>
                        <li>Add your redirect URL to Authorized redirect URIs</li>
                        <li>Copy Client ID, Client Secret, and API Key here</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ChatGPT Integration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                ChatGPT Integration
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable ChatGPT</div>
                    <div className="text-sm text-gray-500">Use ChatGPT for content generation and analysis</div>
                  </div>
                  <button
                    onClick={() => setChatGPTSettings({ ...chatGPTSettings, enabled: !chatGPTSettings.enabled })}
                    className="p-2"
                  >
                    {chatGPTSettings.enabled ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {chatGPTSettings.enabled && (
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="password"
                        value={chatGPTSettings.apiKey}
                        onChange={(e) => setChatGPTSettings({ ...chatGPTSettings, apiKey: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="sk-..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a></p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <select
                        value={chatGPTSettings.model}
                        onChange={(e) => setChatGPTSettings({ ...chatGPTSettings, model: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={chatGPTSettings.temperature}
                        onChange={(e) => setChatGPTSettings({ ...chatGPTSettings, temperature: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0 (Focused)</span>
                        <span>{chatGPTSettings.temperature}</span>
                        <span>2 (Creative)</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                      <input
                        type="number"
                        min="100"
                        max="8000"
                        value={chatGPTSettings.maxTokens}
                        onChange={(e) => setChatGPTSettings({ ...chatGPTSettings, maxTokens: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum response length (100-8000)</p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-900 mb-2">Use Cases:</h4>
                      <ul className="text-xs text-green-800 space-y-1 ml-4 list-disc">
                        <li>Auto-generate project descriptions</li>
                        <li>Analyze and match job applications</li>
                        <li>Generate context for search</li>
                        <li>Content suggestions and optimization</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* API Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="w-5 h-5 mr-2" />
                API Configuration
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable CORS</div>
                    <div className="text-sm text-gray-500">Cross-Origin Resource Sharing</div>
                  </div>
                  <button
                    onClick={() => setApiSettings({ ...apiSettings, enableCORS: !apiSettings.enableCORS })}
                    className="p-2"
                  >
                    {apiSettings.enableCORS ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {apiSettings.enableCORS && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Origins</label>
                    <textarea
                      value={apiSettings.allowedOrigins.join('\n')}
                      onChange={(e) => setApiSettings({ ...apiSettings, allowedOrigins: e.target.value.split('\n') })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable API Key Auth</div>
                    <div className="text-sm text-gray-500">Require API key for authentication</div>
                  </div>
                  <button
                    onClick={() => setApiSettings({ ...apiSettings, enableAPIKeyAuth: !apiSettings.enableAPIKeyAuth })}
                    className="p-2"
                  >
                    {apiSettings.enableAPIKeyAuth ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable JWT Auth</div>
                    <div className="text-sm text-gray-500">JSON Web Token authentication</div>
                  </div>
                  <button
                    onClick={() => setApiSettings({ ...apiSettings, enableJWTAuth: !apiSettings.enableJWTAuth })}
                    className="p-2"
                  >
                    {apiSettings.enableJWTAuth ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {apiSettings.enableJWTAuth && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">JWT Expiration (seconds)</label>
                    <input
                      type="number"
                      value={apiSettings.jwtExpiration}
                      onChange={(e) => setApiSettings({ ...apiSettings, jwtExpiration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable Webhooks</div>
                    <div className="text-sm text-gray-500">Allow webhook integrations</div>
                  </div>
                  <button
                    onClick={() => setApiSettings({ ...apiSettings, enableWebhooks: !apiSettings.enableWebhooks })}
                    className="p-2"
                  >
                    {apiSettings.enableWebhooks ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {apiSettings.enableWebhooks && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                    <input
                      type="password"
                      value={apiSettings.webhookSecret}
                      onChange={(e) => setApiSettings({ ...apiSettings, webhookSecret: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable API Versioning</div>
                    <div className="text-sm text-gray-500">Support multiple API versions</div>
                  </div>
                  <button
                    onClick={() => setApiSettings({ ...apiSettings, enableAPIVersioning: !apiSettings.enableAPIVersioning })}
                    className="p-2"
                  >
                    {apiSettings.enableAPIVersioning ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {apiSettings.enableAPIVersioning && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Version</label>
                    <input
                      type="text"
                      value={apiSettings.currentVersion}
                      onChange={(e) => setApiSettings({ ...apiSettings, currentVersion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Enable Logging</div>
                    <div className="text-sm text-gray-500">Log API requests and responses</div>
                  </div>
                  <button
                    onClick={() => setApiSettings({ ...apiSettings, enableLogging: !apiSettings.enableLogging })}
                    className="p-2"
                  >
                    {apiSettings.enableLogging ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {apiSettings.enableLogging && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Log Retention (Days)</label>
                    <input
                      type="number"
                      value={apiSettings.logRetentionDays}
                      onChange={(e) => setApiSettings({ ...apiSettings, logRetentionDays: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800 px-8">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
      </div>

      {showAddKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Generate API Key</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  value={newKeyForm.name}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="e.g., Production Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scopes</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={newKeyForm.scopes.includes('read')} onChange={(e) => {
                      if (e.target.checked) setNewKeyForm({ ...newKeyForm, scopes: [...newKeyForm.scopes, 'read'] });
                      else setNewKeyForm({ ...newKeyForm, scopes: newKeyForm.scopes.filter(s => s !== 'read') });
                    }} />
                    <span>Read</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={newKeyForm.scopes.includes('write')} onChange={(e) => {
                      if (e.target.checked) setNewKeyForm({ ...newKeyForm, scopes: [...newKeyForm.scopes, 'write'] });
                      else setNewKeyForm({ ...newKeyForm, scopes: newKeyForm.scopes.filter(s => s !== 'write') });
                    }} />
                    <span>Write</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={newKeyForm.scopes.includes('admin')} onChange={(e) => {
                      if (e.target.checked) setNewKeyForm({ ...newKeyForm, scopes: [...newKeyForm.scopes, 'admin'] });
                      else setNewKeyForm({ ...newKeyForm, scopes: newKeyForm.scopes.filter(s => s !== 'admin') });
                    }} />
                    <span>Admin</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddKeyModal(false)}>Cancel</Button>
              <Button onClick={handleCreateAPIKey} className="bg-black text-white hover:bg-gray-800">Generate Key</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
