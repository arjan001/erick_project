import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Save, Shield, Key, Globe } from 'lucide-react';

export default function AdminAuthProvidersPage() {
  const [providers, setProviders] = useState({
    google: { enabled: true, clientId: '', clientSecret: '' },
    github: { enabled: false, clientId: '', clientSecret: '' },
    email: { enabled: true, requireVerification: true }
  });

  const [jwtSettings, setJwtSettings] = useState({
    secret: '',
    expiresIn: '7d',
    algorithm: 'HS256'
  });

  const handleSave = () => {
    console.log('Saving auth provider settings:', providers);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Login Providers</h1>
          <p className="text-gray-600">Configure authentication methods and providers</p>
        </div>
        <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="oauth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="oauth">OAuth Providers</TabsTrigger>
          <TabsTrigger value="email">Email Settings</TabsTrigger>
          <TabsTrigger value="jwt">JWT Configuration</TabsTrigger>
        </TabsList>

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
  );
}
