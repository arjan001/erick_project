import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Save, Shield, Key, Globe, UserCheck } from 'lucide-react'
import { AuthProvider } from '@/lib/supabaseEntities'
import { useToast } from '@/hooks/useToast'

export default function AdminAuthProvidersPage() {
  const { success, error: toastError } = useToast()
  const [providers, setProviders] = useState({
    supabase: { enabled: true, isDefault: true, config: {} },
    clerk: { enabled: false, isDefault: false, config: { publishableKey: '', secretKey: '' } },
    google: { enabled: true, clientId: '', clientSecret: '' },
    github: { enabled: false, clientId: '', clientSecret: '' },
    email: { enabled: true, requireVerification: true }
  })

  const [jwtSettings, setJwtSettings] = useState({
    secret: '',
    expiresIn: '7d',
    algorithm: 'HS256'
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAuthProviders()
  }, [])

  const loadAuthProviders = async () => {
    try {
      const authProviders = await AuthProvider.list('-created_at', 10)
      if (authProviders && authProviders.length > 0) {
        const providerMap = {}
        authProviders.forEach(provider => {
          providerMap[provider.provider_name] = {
            enabled: provider.is_enabled,
            isDefault: provider.is_default,
            config: provider.config || {}
          }
        })
        setProviders(prev => ({ ...prev, ...providerMap }))
      }
    } catch (error) {
      // Use defaults if load fails
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save Supabase provider
      await AuthProvider.create({
        provider_name: 'supabase',
        is_enabled: providers.supabase.enabled,
        is_default: providers.supabase.isDefault,
        config: providers.supabase.config
      })

      // Save Clerk provider
      await AuthProvider.create({
        provider_name: 'clerk',
        is_enabled: providers.clerk.enabled,
        is_default: providers.clerk.isDefault,
        config: providers.clerk.config
      })

      success('Saved', 'Authentication providers updated successfully')
    } catch (error) {
      toastError('Error', 'Failed to save authentication providers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Login Providers</h1>
          <p className="text-gray-600">Configure authentication methods and providers</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="auth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="auth">Auth Providers</TabsTrigger>
          <TabsTrigger value="oauth">OAuth Providers</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
          <TabsTrigger value="jwt">JWT Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Authentication Providers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Supabase */}
              <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-green-600 font-bold">SB</span>
                    </div>
                    <div>
                      <p className="font-medium">Supabase</p>
                      <p className="text-sm text-gray-600">Primary authentication provider</p>
                    </div>
                  </div>
                  <Switch
                    checked={providers.supabase.enabled}
                    onCheckedChange={(checked) => setProviders({
                      ...providers,
                      supabase: { ...providers.supabase, enabled: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <Label>Set as Default</Label>
                    <p className="text-sm text-gray-600">Users will be redirected to this provider by default</p>
                  </div>
                  <Switch
                    checked={providers.supabase.isDefault}
                    onCheckedChange={(checked) => setProviders({
                      ...providers,
                      supabase: { ...providers.supabase, isDefault: checked }
                    })}
                  />
                </div>
              </div>

              {/* Clerk */}
              <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                      <span className="text-purple-600 font-bold">C</span>
                    </div>
                    <div>
                      <p className="font-medium">Clerk</p>
                      <p className="text-sm text-gray-600">Alternative authentication provider (optional)</p>
                    </div>
                  </div>
                  <Switch
                    checked={providers.clerk.enabled}
                    onCheckedChange={(checked) => setProviders({
                      ...providers,
                      clerk: { ...providers.clerk, enabled: checked }
                    })}
                  />
                </div>
                {providers.clerk.enabled && (
                  <div className="space-y-2 pt-2">
                    <Label>Publishable Key</Label>
                    <Input
                      value={providers.clerk.config.publishableKey}
                      onChange={(e) => setProviders({
                        ...providers,
                        clerk: { ...providers.clerk, config: { ...providers.clerk.config, publishableKey: e.target.value } }
                      })}
                      placeholder="pk_test_..."
                    />
                    <Label>Secret Key</Label>
                    <Input
                      type="password"
                      value={providers.clerk.config.secretKey}
                      onChange={(e) => setProviders({
                        ...providers,
                        clerk: { ...providers.clerk, config: { ...providers.clerk.config, secretKey: e.target.value } }
                      })}
                      placeholder="sk_test_..."
                    />
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <Label>Set as Default</Label>
                        <p className="text-sm text-gray-600">Users will be redirected to Clerk by default</p>
                      </div>
                      <Switch
                        checked={providers.clerk.isDefault}
                        onCheckedChange={(checked) => setProviders({
                          ...providers,
                          clerk: { ...providers.clerk, isDefault: checked }
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oauth">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                OAuth Providers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google */}
              <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                      <span className="text-red-600 font-bold">G</span>
                    </div>
                    <div>
                      <p className="font-medium">Google</p>
                      <p className="text-sm text-gray-600">Allow Google OAuth login</p>
                    </div>
                  </div>
                  <Switch
                    checked={providers.google.enabled}
                    onCheckedChange={(checked) => setProviders({
                      ...providers,
                      google: { ...providers.google, enabled: checked }
                    })}
                  />
                </div>
                {providers.google.enabled && (
                  <div className="space-y-2 pt-2">
                    <Label>Client ID</Label>
                    <Input
                      value={providers.google.clientId}
                      onChange={(e) => setProviders({
                        ...providers,
                        google: { ...providers.google, clientId: e.target.value }
                      })}
                      placeholder="your-client-id.apps.googleusercontent.com"
                    />
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      value={providers.google.clientSecret}
                      onChange={(e) => setProviders({
                        ...providers,
                        google: { ...providers.google, clientSecret: e.target.value }
                      })}
                      placeholder="GOCSPX-..."
                    />
                  </div>
                )}
              </div>

              {/* GitHub */}
              <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
                      <span className="text-white font-bold">GH</span>
                    </div>
                    <div>
                      <p className="font-medium">GitHub</p>
                      <p className="text-sm text-gray-600">Allow GitHub OAuth login</p>
                    </div>
                  </div>
                  <Switch
                    checked={providers.github.enabled}
                    onCheckedChange={(checked) => setProviders({
                      ...providers,
                      github: { ...providers.github, enabled: checked }
                    })}
                  />
                </div>
                {providers.github.enabled && (
                  <div className="space-y-2 pt-2">
                    <Label>Client ID</Label>
                    <Input
                      value={providers.github.clientId}
                      onChange={(e) => setProviders({
                        ...providers,
                        github: { ...providers.github, clientId: e.target.value }
                      })}
                      placeholder="your-client-id"
                    />
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      value={providers.github.clientSecret}
                      onChange={(e) => setProviders({
                        ...providers,
                        github: { ...providers.github, clientSecret: e.target.value }
                      })}
                      placeholder="your-client-secret"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Email Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Email Login</Label>
                  <p className="text-sm text-gray-600">Allow users to login with email/password</p>
                </div>
                <Switch
                  checked={providers.email.enabled}
                  onCheckedChange={(checked) => setProviders({
                    ...providers,
                    email: { ...providers.email, enabled: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-gray-600">Users must verify email before access</p>
                </div>
                <Switch
                  checked={providers.email.requireVerification}
                  onCheckedChange={(checked) => setProviders({
                    ...providers,
                    email: { ...providers.email, requireVerification: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jwt">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                JWT Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>JWT Secret</Label>
                <Input
                  type="password"
                  value={jwtSettings.secret}
                  onChange={(e) => setJwtSettings({ ...jwtSettings, secret: e.target.value })}
                  placeholder="your-secret-key"
                />
              </div>
              <div className="space-y-2">
                <Label>Token Expiration</Label>
                <Input
                  value={jwtSettings.expiresIn}
                  onChange={(e) => setJwtSettings({ ...jwtSettings, expiresIn: e.target.value })}
                  placeholder="7d"
                />
              </div>
              <div className="space-y-2">
                <Label>Algorithm</Label>
                <select
                  value={jwtSettings.algorithm}
                  onChange={(e) => setJwtSettings({ ...jwtSettings, algorithm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="HS256">HS256</option>
                  <option value="RS256">RS256</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
