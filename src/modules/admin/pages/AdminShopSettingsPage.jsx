import React, { useState, useEffect } from 'react'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Settings, Save, Store, DollarSign, Truck, ToggleLeft, ToggleRight, CreditCard, Package, Bell, RefreshCw } from 'lucide-react'

export default function AdminShopSettingsPage() {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [shopSettings, setShopSettings] = useState({
    enable_mpesa: true,
    enable_card: false,
    shipping_threshold: 5000,
    shipping_cost: 500,
    auto_confirm_orders: true,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shop_settings?select=*&limit=1`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (data && data.length > 0) {
          setShopSettings(data[0])
        }
      } catch (err) {
        console.error('Error fetching shop settings:', err)
        // Use default values if fetch fails
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shop_settings`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(shopSettings)
      })

      if (!response.ok) {
        // Try UPDATE if POST fails (settings might already exist)
        const updateResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shop_settings`, {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(shopSettings)
        })

        if (!updateResponse.ok) {
          throw new Error('Failed to save settings')
        }
      }

      success('Saved', 'Shop settings saved successfully')
    } catch (err) {
      console.error('Error saving shop settings:', err)
      error('Failed', 'Failed to save shop settings')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setShopSettings({ ...shopSettings, [key]: value })
  }

  const handleToggle = (key) => {
    setShopSettings({ ...shopSettings, [key]: !shopSettings[key] })
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop Settings</h1>
        <p className="text-gray-600">Configure e-commerce shop settings, payments, and shipping</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Payment Settings */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Methods
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">M-Pesa Payment</div>
                  <div className="text-sm text-gray-500">Enable M-Pesa mobile money payments</div>
                </div>
                <button
                  onClick={() => handleToggle('enable_mpesa')}
                  className="p-2"
                >
                  {shopSettings.enable_mpesa ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Card Payment</div>
                  <div className="text-sm text-gray-500">Enable credit/debit card payments</div>
                </div>
                <button
                  onClick={() => handleToggle('enable_card')}
                  className="p-2"
                >
                  {shopSettings.enable_card ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Settings */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Shipping Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (KES)</label>
                <input
                  type="number"
                  value={shopSettings.shipping_threshold}
                  onChange={(e) => handleChange('shipping_threshold', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Orders above this amount get free shipping</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Shipping Cost (KES)</label>
                <input
                  type="number"
                  step="0.01"
                  value={shopSettings.shipping_cost}
                  onChange={(e) => handleChange('shipping_cost', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Standard shipping cost for orders below threshold</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Settings */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Order Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Auto Confirm Orders</div>
                  <div className="text-sm text-gray-500">Automatically confirm orders after payment</div>
                </div>
                <button
                  onClick={() => handleToggle('auto_confirm_orders')}
                  className="p-2"
                >
                  {shopSettings.auto_confirm_orders ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="bg-black text-white hover:bg-gray-800"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
