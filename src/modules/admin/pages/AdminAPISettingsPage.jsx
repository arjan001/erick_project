import React, { useState, useEffect } from 'react'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Key, Save, Plus, Trash2, Copy, RefreshCw, Shield, Clock, AlertTriangle, CheckCircle, ToggleLeft, ToggleRight, Code, Eye, EyeOff, Bot } from 'lucide-react'
import { apiSettingsApi } from '../api/apiSettings.api'
import { useAuth } from '@/lib/AuthContext'

export default function AdminAPISettingsPage() {
  const { success, error } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState({})
  
  const [apiKeys, setApiKeys] = useState([])
  const [rateLimits, setRateLimits] = useState({
    enabled: true,
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 20,
    id: null
  })

  const [apiSettings, setApiSettings] = useState({
    enableCORS: true,
    allowedOrigins: ['https://ericrabar.com', 'https://www.ericrabar.com'],
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
  })

  const [googleDriveSettings, setGoogleDriveSettings] = useState({
    enabled: false,
    clientId: '',
    clientSecret: '',
    apiKey: '',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    id: null
  })

  const [chatGPTSettings, setChatGPTSettings] = useState({
    enabled: false,
    apiKey: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    id: null
  })

  const [showAddKeyModal, setShowAddKeyModal] = useState(false)
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    scopes: ['read']
  })

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [keysData, rateLimitData, apiConfigData, integrationsData] = await Promise.all([
        apiSettingsApi.getAllApiKeys(),
        apiSettingsApi.getRateLimitingSettings(),
        apiSettingsApi.getApiConfiguration(),
        apiSettingsApi.getAllIntegrations()
      ])

      setApiKeys(keysData || [])
      
      if (rateLimitData) {
        setRateLimits({
          enabled: rateLimitData.enabled,
          requestsPerMinute: rateLimitData.requests_per_minute,
          requestsPerHour: rateLimitData.requests_per_hour,
          requestsPerDay: rateLimitData.requests_per_day,
          burstLimit: rateLimitData.burst_limit,
          id: rateLimitData.id
        })
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
          currentVersion: apiConfigData.current_version || 'v1',
          enableLogging: apiConfigData.enable_logging,
          logRetentionDays: apiConfigData.log_retention_days,
          id: apiConfigData.id
        })
      }

      if (integrationsData) {
        const googleDrive = integrationsData.find(i => i.integration_name === 'google_drive')
        const chatGPT = integrationsData.find(i => i.integration_name === 'chatgpt')
        
        if (googleDrive) {
          setGoogleDriveSettings({
            enabled: googleDrive.is_enabled,
            clientId: googleDrive.config?.client_id || '',
            clientSecret: googleDrive.config?.client_secret || '',
            apiKey: googleDrive.config?.api_key || '',
            scopes: googleDrive.config?.scopes || ['https://www.googleapis.com/auth/drive.readonly'],
            id: googleDrive.id
          })
        }

        if (chatGPT) {
          setChatGPTSettings({
            enabled: chatGPT.is_enabled,
            apiKey: chatGPT.config?.api_key || '',
            model: chatGPT.config?.model || 'gpt-4',
            temperature: chatGPT.config?.temperature || 0.7,
            maxTokens: chatGPT.config?.max_tokens || 2000,
            id: chatGPT.id
          })
        }
      }
    } catch (err) {
      console.error('Error fetching API settings:', err)
      error('Error', 'Failed to load API settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Save API Configuration
      await apiSettingsApi.saveApiConfiguration({
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
      })

      // Save Rate Limiting
      await apiSettingsApi.saveRateLimitingSettings({
        enabled: rateLimits.enabled,
        requests_per_minute: rateLimits.requestsPerMinute,
        requests_per_hour: rateLimits.requestsPerHour,
        requests_per_day: rateLimits.requestsPerDay,
        burst_limit: rateLimits.burstLimit
      })

      // Save Google Drive
      await apiSettingsApi.saveIntegration({
        integration_name: 'google_drive',
        is_enabled: googleDriveSettings.enabled,
        config: {
          client_id: googleDriveSettings.clientId,
          client_secret: googleDriveSettings.clientSecret,
          api_key: googleDriveSettings.apiKey,
          scopes: googleDriveSettings.scopes
        }
      })

      // Save ChatGPT
      await apiSettingsApi.saveIntegration({
        integration_name: 'chatgpt',
        is_enabled: chatGPTSettings.enabled,
        config: {
          api_key: chatGPTSettings.apiKey,
          model: chatGPTSettings.model,
          temperature: chatGPTSettings.temperature,
          max_tokens: chatGPTSettings.maxTokens
        }
      })

      success('Settings Saved', 'API settings updated successfully')
    } catch (err) {
      console.error('Error saving settings:', err)
      error('Error', 'Failed to save API settings')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateAPIKey = async () => {
    try {
      const newKey = await apiSettingsApi.createApiKey({
        name: newKeyForm.name,
        scopes: newKeyForm.scopes
      })
      setApiKeys([...apiKeys, newKey])
      setShowAddKeyModal(false)
      setNewKeyForm({ name: '', scopes: ['read'] })
      success('Key Created', 'API key created successfully')
    } catch (err) {
      console.error('Error creating API key:', err)
      error('Error', 'Failed to create API key')
    }
  }

  const handleDeleteKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key?')) return
    try {
      await apiSettingsApi.deleteApiKey(keyId)
      setApiKeys(apiKeys.filter(k => k.id !== keyId))
      success('Key Deleted', 'API key deleted successfully')
    } catch (err) {
      console.error('Error deleting API key:', err)
      error('Error', 'Failed to delete API key')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    success('Copied', 'API key copied to clipboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">API Settings</h1>
        <p className="text-gray-600 mt-1">Configure API keys, rate limiting, and third-party integrations</p>
      </div>

      <div className="space-y-6">
        {/* API Keys */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              API Keys
            </h2>
            <Button onClick={() => setShowAddKeyModal(true)} className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Generate Key
            </Button>
          </div>
          
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No API keys generated yet
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{key.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                        {showSecrets[key.id] ? key.key : '•'.repeat(32)}
                      </code>
                      <button
                        onClick={() => setShowSecrets({ ...showSecrets, [key.id]: !showSecrets[key.id] })}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Scopes: {key.scopes?.join(', ') || 'None'} • Created: {new Date(key.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rate Limiting */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Rate Limiting
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Enable Rate Limiting</div>
                <div className="text-sm text-gray-500">Protect API from abuse with rate limits</div>
              </div>
              <button
                onClick={() => setRateLimits({ ...rateLimits, enabled: !rateLimits.enabled })}
                className="p-2"
              >
                {rateLimits.enabled ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
              </button>
            </div>
            {rateLimits.enabled && (
              <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
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
              <form onSubmit={(e) => e.preventDefault()} className="pt-4 border-t border-gray-200 space-y-4">
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
              </form>
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
              <form onSubmit={(e) => e.preventDefault()} className="pt-4 border-t border-gray-200 space-y-4">
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
              </form>
            )}
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2" />
            API Configuration
          </h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
                <div className="text-sm text-gray-500">Log API requests for monitoring</div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Log Retention (days)</label>
                <input
                  type="number"
                  value={apiSettings.logRetentionDays}
                  onChange={(e) => setApiSettings({ ...apiSettings, logRetentionDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving} className="bg-black text-white hover:bg-gray-800 px-8">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>

    {showAddKeyModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Generate API Key</h2>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
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
                    if (e.target.checked) setNewKeyForm({ ...newKeyForm, scopes: [...newKeyForm.scopes, 'read'] })
                    else setNewKeyForm({ ...newKeyForm, scopes: newKeyForm.scopes.filter(s => s !== 'read') })
                  }} />
                  <span>Read</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newKeyForm.scopes.includes('write')} onChange={(e) => {
                    if (e.target.checked) setNewKeyForm({ ...newKeyForm, scopes: [...newKeyForm.scopes, 'write'] })
                    else setNewKeyForm({ ...newKeyForm, scopes: newKeyForm.scopes.filter(s => s !== 'write') })
                  }} />
                  <span>Write</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newKeyForm.scopes.includes('admin')} onChange={(e) => {
                    if (e.target.checked) setNewKeyForm({ ...newKeyForm, scopes: [...newKeyForm.scopes, 'admin'] })
                    else setNewKeyForm({ ...newKeyForm, scopes: newKeyForm.scopes.filter(s => s !== 'admin') })
                  }} />
                  <span>Admin</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddKeyModal(false)}>Cancel</Button>
              <Button onClick={handleCreateAPIKey} className="bg-black text-white hover:bg-gray-800">Generate Key</Button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>
  )
}
