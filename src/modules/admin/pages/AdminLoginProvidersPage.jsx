import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Key, Save, Shield, Lock, Unlock, Globe, ToggleLeft, ToggleRight, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'

export default function AdminLoginProvidersPage() {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [providers, setProviders] = useState([])

  // Load providers from Supabase
  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('auth_providers')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err

      if (data && data.length > 0) {
        setProviders(data)
      } else {
        // Initialize with default providers if none exist
        const defaultProviders = [
          {
            provider_name: 'supabase',
            is_enabled: true,
            is_default: true,
            config: { name: 'Supabase Auth', description: 'Primary authentication provider' }
          },
          {
            provider_name: 'clerk',
            is_enabled: false,
            is_default: false,
            config: { name: 'Clerk', description: 'Alternative authentication provider' }
          }
        ]
        const { data: inserted, error: insertErr } = await supabase
          .from('auth_providers')
          .insert(defaultProviders)
          .select()
        if (insertErr) throw insertErr
        setProviders(inserted || defaultProviders)
      }
    } catch (err) {
      console.error('Error loading providers:', err)
      error('Error', 'Failed to load authentication providers')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProvider = async (providerId, currentStatus) => {
    try {
      const { error: err } = await supabase
        .from('auth_providers')
        .update({ is_enabled: !currentStatus })
        .eq('id', providerId)

      if (err) throw err

      setProviders(prev => prev.map(p =>
        p.id === providerId ? { ...p, is_enabled: !currentStatus } : p
      ))
      success('Updated', 'Provider status updated')
    } catch (err) {
      console.error('Error toggling provider:', err)
      error('Error', 'Failed to update provider status')
    }
  }

  const handleSetDefault = async (providerId) => {
    try {
      // Unset all defaults first
      await supabase
        .from('auth_providers')
        .update({ is_default: false })
        .neq('id', providerId)

      // Set new default
      const { error: err } = await supabase
        .from('auth_providers')
        .update({ is_default: true })
        .eq('id', providerId)

      if (err) throw err

      setProviders(prev => prev.map(p =>
        p.id === providerId ? { ...p, is_default: true } : { ...p, is_default: false }
      ))
      success('Updated', 'Default provider updated')
    } catch (err) {
      console.error('Error setting default provider:', err)
      error('Error', 'Failed to set default provider')
    }
  }

  const handleUpdateConfig = async (providerId, field, value) => {
    try {
      const provider = providers.find(p => p.id === providerId)
      const updatedConfig = { ...provider.config, [field]: value }

      const { error: err } = await supabase
        .from('auth_providers')
        .update({ config: updatedConfig })
        .eq('id', providerId)

      if (err) throw err

      setProviders(prev => prev.map(p =>
        p.id === providerId ? { ...p, config: updatedConfig } : p
      ))
    } catch (err) {
      console.error('Error updating config:', err)
      error('Error', 'Failed to update provider configuration')
    }
  }

  const handleSaveProviders = async () => {
    setSaving(true)
    try {
      // Just save all current state
      for (const provider of providers) {
        await supabase
          .from('auth_providers')
          .update({
            is_enabled: provider.is_enabled,
            is_default: provider.is_default,
            config: provider.config
          })
          .eq('id', provider.id)
      }
      success('Saved', 'Authentication providers saved successfully')
    } catch (err) {
      console.error('Error saving providers:', err)
      error('Failed', 'Failed to save providers')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Login Providers</h1>
        <p className="text-gray-600 mt-1">Configure authentication providers (Supabase, Clerk, etc.)</p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={loadProviders} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
        <Button onClick={handleSaveProviders} disabled={saving} className="bg-black text-white hover:bg-gray-800 flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-4">
        {providers.map(provider => (
          <div key={provider.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    {provider.provider_name}
                    {provider.is_default && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Default</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{provider.config?.description || 'Authentication provider'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${provider.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {provider.is_enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={() => handleToggleProvider(provider.id, provider.is_enabled)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title={provider.is_enabled ? 'Disable' : 'Enable'}
                >
                  {provider.is_enabled ? <Unlock className="w-5 h-5 text-green-600" /> : <Lock className="w-5 h-5 text-gray-400" />}
                </button>
                {!provider.is_default && (
                  <button
                    onClick={() => handleSetDefault(provider.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Set as default"
                  >
                    <Shield className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {provider.is_enabled && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
                  <input
                    type="text"
                    value={provider.config?.name || ''}
                    onChange={(e) => handleUpdateConfig(provider.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={provider.config?.description || ''}
                    onChange={(e) => handleUpdateConfig(provider.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {providers.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="text-gray-500">No authentication providers configured</div>
          </div>
        )}
      </div>
    </div>
  )
}
