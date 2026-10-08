import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Badge } from '@/shared/components/ui/badge'
import { Save, Key, Database, Shield, Copy, Plus, Trash2 } from 'lucide-react'
import { Switch } from '@/shared/components/ui/switch'

export default function AdminAPIPage() {
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production API', key: 'sk_live_xxxxxxxxxxxx', lastUsed: '2024-01-15', status: 'active' },
    { id: 2, name: 'Test API', key: 'sk_test_xxxxxxxxxxxx', lastUsed: '2024-01-14', status: 'active' },
  ])

  const [rateLimits, setRateLimits] = useState({
    enabled: true,
    requestsPerMinute: '100',
    requestsPerHour: '1000',
    requestsPerDay: '10000'
  })

  const handleSave = () => {
    
  }

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key)
  }

  const handleDeleteKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Settings</h1>
          <p className="text-gray-600">Configure API access, keys, and rate limits</p>
        </div>
        <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="rate">Rate Limits</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Keys
                </CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
 Generate New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{apiKey.name}</p>
                        <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {apiKey.key}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(apiKey.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Last used: {apiKey.lastUsed}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Rate Limiting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Rate Limiting</Label>
                  <p className="text-sm text-gray-600">Limit API requests per time period</p>
                </div>
                <Switch
                  checked={rateLimits.enabled}
                  onCheckedChange={(checked) => setRateLimits({ ...rateLimits, enabled: checked })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Requests per Minute</Label>
                  <Input
                    type="number"
                    value={rateLimits.requestsPerMinute}
                    onChange={(e) => setRateLimits({ ...rateLimits, requestsPerMinute: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requests per Hour</Label>
                  <Input
                    type="number"
                    value={rateLimits.requestsPerHour}
                    onChange={(e) => setRateLimits({ ...rateLimits, requestsPerHour: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requests per Day</Label>
                  <Input
                    type="number"
                    value={rateLimits.requestsPerDay}
                    onChange={(e) => setRateLimits({ ...rateLimits, requestsPerDay: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Webhooks
                </CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                No webhooks configured
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}