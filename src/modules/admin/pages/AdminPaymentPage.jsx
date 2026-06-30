import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Save, CreditCard, Wallet, Settings } from 'lucide-react';

export default function AdminPaymentPage() {
  const [stripeSettings, setStripeSettings] = useState({
    enabled: true,
    publishableKey: '',
    secretKey: '',
    webhookSecret: ''
  });

  const [backingSettings, setBackingSettings] = useState({
    enabled: true,
    minAmount: '100',
    maxAmount: '100000',
    feePercentage: '5'
  });

  const handleSave = () => {
    console.log('Saving payment settings');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600">Configure payment gateways and financial settings</p>
        </div>
        <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="stripe" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
          <TabsTrigger value="backing">Backing</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Stripe Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Stripe</Label>
                  <p className="text-sm text-gray-600">Accept payments via Stripe</p>
                </div>
                <Switch
                  checked={stripeSettings.enabled}
                  onCheckedChange={(checked) => setStripeSettings({ ...stripeSettings, enabled: checked })}
                />
              </div>
              {stripeSettings.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Publishable Key</Label>
                    <Input
                      value={stripeSettings.publishableKey}
                      onChange={(e) => setStripeSettings({ ...stripeSettings, publishableKey: e.target.value })}
                      placeholder="pk_live_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <Input
                      type="password"
                      value={stripeSettings.secretKey}
                      onChange={(e) => setStripeSettings({ ...stripeSettings, secretKey: e.target.value })}
                      placeholder="sk_live_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Webhook Secret</Label>
                    <Input
                      type="password"
                      value={stripeSettings.webhookSecret}
                      onChange={(e) => setStripeSettings({ ...stripeSettings, webhookSecret: e.target.value })}
                      placeholder="whsec_..."
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Backing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Backing</Label>
                  <p className="text-sm text-gray-600">Allow project backing/investment</p>
                </div>
                <Switch
                  checked={backingSettings.enabled}
                  onCheckedChange={(checked) => setBackingSettings({ ...backingSettings, enabled: checked })}
                />
              </div>
              {backingSettings.enabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Amount ($)</Label>
                      <Input
                        type="number"
                        value={backingSettings.minAmount}
                        onChange={(e) => setBackingSettings({ ...backingSettings, minAmount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Amount ($)</Label>
                      <Input
                        type="number"
                        value={backingSettings.maxAmount}
                        onChange={(e) => setBackingSettings({ ...backingSettings, maxAmount: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Platform Fee (%)</Label>
                      <Input
                        type="number"
                        value={backingSettings.feePercentage}
                        onChange={(e) => setBackingSettings({ ...backingSettings, feePercentage: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Payment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" placeholder="0" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
