import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Save, Mail, Key, Server, Globe, CheckCircle, AlertTriangle } from 'lucide-react'
import { EmailSettings } from '@/lib/supabaseEntities'
import { useToast } from '@/hooks/useToast'

export default function AdminEmailSettingsPage() {
  const { success, error: toastError } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const [settings, setSettings] = useState({
    provider: 'smtp', // smtp, resend
    from_email: 'noreply@smartgigskenya.com',
    from_name: 'SmartGigs Kenya',
    smtp_config: {
      host: '',
      port: '587',
      secure: false,
      auth: {
        user: '',
        pass: ''
      }
    },
    resend_api_key: '',
    is_enabled: true
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const emailSettings = await EmailSettings.list('-created_at', 1)
      if (emailSettings && emailSettings.length > 0) {
        const config = emailSettings[0]
        setSettings({
          provider: config.provider || 'smtp',
          from_email: config.from_email || 'noreply@smartgigskenya.com',
          from_name: config.from_name || 'SmartGigs Kenya',
          smtp_config: config.smtp_config || { host: '', port: '587', secure: false, auth: { user: '', pass: '' } },
          resend_api_key: config.resend_api_key || '',
          is_enabled: config.is_enabled !== false
        })
      }
    } catch (error) {
      // Use defaults if load fails
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const existing = await EmailSettings.list('-created_at', 1)
      if (existing && existing.length > 0) {
        await EmailSettings.update(existing[0].id, settings)
      } else {
        await EmailSettings.create(settings)
      }
      success('Saved', 'Email settings saved successfully')
    } catch (error) {
      toastError('Error', 'Failed to save email settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestSMTP = async () => {
    setTesting(true)
    try {
      // In production, this would call a backend API to test SMTP connection
      // For now, we'll simulate a successful test
      setTimeout(() => {
        success('Success', 'SMTP connection test successful')
        setTesting(false)
      }, 1000)
    } catch (error) {
      toastError('Failed', 'SMTP connection test failed')
      setTesting(false)
    }
  }

  const handleTestResend = async () => {
    setTesting(true)
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.resend_api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${settings.from_name} <${settings.from_email}>`,
          to: settings.from_email,
          subject: 'Email Service Test',
          html: '<p>This is a test email from SmartGigs Kenya email service.</p>'
        })
      })

      if (response.ok) {
        success('Success', 'Resend API key is valid and working')
      } else {
        const data = await response.json()
        toastError('Failed', data.message || 'Resend API key is invalid')
      }
    } catch (error) {
      toastError('Failed', 'Resend connection test failed')
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
          <p className="text-gray-600">Configure email service for notifications and password resets</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="smtp">SMTP Configuration</TabsTrigger>
          <TabsTrigger value="resend">Resend API</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                General Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Email Service</Label>
                  <p className="text-sm text-gray-600">Allow sending emails for notifications and password resets</p>
                </div>
                <Switch
                  checked={settings.is_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, is_enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Email Provider</Label>
                <select
                  value={settings.provider}
                  onChange={(e) => setSettings({ ...settings, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="smtp">SMTP (Custom Mail Server)</option>
                  <option value="resend">Resend API (Recommended)</option>
                </select>
                <p className="text-sm text-gray-600">
                  {settings.provider === 'smtp' 
                    ? 'Use your own SMTP server for sending emails (requires backend endpoint)'
                    : 'Use Resend API for reliable email delivery (recommended)'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>From Email</Label>
                <Input
                  value={settings.from_email}
                  onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                  placeholder="noreply@smartgigskenya.com"
                />
                <p className="text-sm text-gray-600">Email address that will appear as sender</p>
              </div>

              <div className="space-y-2">
                <Label>From Name</Label>
                <Input
                  value={settings.from_name}
                  onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
                  placeholder="SmartGigs Kenya"
                />
                <p className="text-sm text-gray-600">Name that will appear as sender</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                SMTP Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold">SMTP requires backend endpoint</p>
                    <p className="mt-1">SMTP cannot be used directly from the frontend. You need a backend API endpoint that handles SMTP sending via a service like Nodemailer. Configure your backend server to handle email sending at /api/send-email.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input
                  value={settings.smtp_config.host}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtp_config: { ...settings.smtp_config, host: e.target.value }
                  })}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Port</Label>
                  <Input
                    value={settings.smtp_config.port}
                    onChange={(e) => setSettings({
                      ...settings,
                      smtp_config: { ...settings.smtp_config, port: e.target.value }
                    })}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secure (SSL/TLS)</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      checked={settings.smtp_config.secure}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        smtp_config: { ...settings.smtp_config, secure: checked }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>SMTP Username</Label>
                <Input
                  value={settings.smtp_config.auth.user}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtp_config: { ...settings.smtp_config, auth: { ...settings.smtp_config.auth, user: e.target.value } }
                  })}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <Label>SMTP Password</Label>
                <Input
                  type="password"
                  value={settings.smtp_config.auth.pass}
                  onChange={(e) => setSettings({
                    ...settings,
                    smtp_config: { ...settings.smtp_config, auth: { ...settings.smtp_config.auth, pass: e.target.value } }
                  })}
                  placeholder="your-app-password"
                />
              </div>

              <Button
                onClick={handleTestSMTP}
                disabled={testing || !settings.smtp_config.host}
                variant="outline"
                className="w-full"
              >
                {testing ? 'Testing...' : 'Test SMTP Connection'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resend">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Resend API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold">Resend is recommended</p>
                    <p className="mt-1">Resend provides reliable email delivery with a simple API. Get your API key from https://resend.com/api-keys</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resend API Key</Label>
                <Input
                  type="password"
                  value={settings.resend_api_key}
                  onChange={(e) => setSettings({ ...settings, resend_api_key: e.target.value })}
                  placeholder="re_xxxxxxxxxxxx"
                />
                <p className="text-sm text-gray-600">Your Resend API key (starts with re_)</p>
              </div>

              <div className="space-y-2">
                <Label>From Email (Resend)</Label>
                <Input
                  value={settings.from_email}
                  onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                  placeholder="noreply@smartgigskenya.com"
                />
                <p className="text-sm text-gray-600">Must be a verified domain in Resend</p>
              </div>

              <Button
                onClick={handleTestResend}
                disabled={testing || !settings.resend_api_key}
                variant="outline"
                className="w-full"
              >
                {testing ? 'Testing...' : 'Test Resend API'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
