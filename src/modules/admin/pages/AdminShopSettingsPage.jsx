import React, { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Settings, Save, Store, DollarSign, Truck, Globe, ToggleLeft, ToggleRight, CreditCard, Percent, Package, Bell } from 'lucide-react';

export default function AdminShopSettingsPage() {
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);

  const [shopSettings, setShopSettings] = useState({
    // General Shop Settings
    shopName: 'Studio22 Market',
    shopDescription: 'Premium video production equipment and merchandise',
    shopEmail: 'shop@studio22.com',
    shopPhone: '+1-555-0123',
    shopAddress: '123 Studio Lane, Los Angeles, CA 90001',
    
    // Currency & Pricing
    currency: 'USD',
    taxRate: 8.5,
    includeTaxInPrice: false,
    allowBackorders: false,
    lowStockThreshold: 10,
    
    // Shipping Settings
    freeShippingThreshold: 100,
    defaultShippingRate: 9.99,
    internationalShipping: true,
    internationalShippingRate: 24.99,
    processingTime: '1-2 business days',
    
    // Payment Settings
    enableCashOnDelivery: false,
    codFee: 5,
    enableBankTransfer: false,
    bankTransferInstructions: '',
    
    // Order Settings
    autoConfirmOrders: true,
    requireEmailConfirmation: false,
    orderConfirmationTemplate: 'Thank you for your order! Your order #{order_number} has been received.',
    
    // Inventory Settings
    trackInventory: true,
    allowOutOfStockPurchase: false,
    notifyLowStock: true,
    notifyOutOfStock: true,
    
    // Returns & Refunds
    allowReturns: true,
    returnPeriodDays: 30,
    restockingFee: 0,
    returnPolicy: 'Items can be returned within 30 days of purchase in original condition.',
    
    // Notifications
    notifyNewOrder: true,
    notifyLowStockEmail: 'admin@studio22.com',
    notifyOutOfStockEmail: 'admin@studio22.com'
  });

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Saved', 'Shop settings saved successfully');
    } catch (err) {
      console.error('Error saving shop settings:', err);
      error('Failed', 'Failed to save shop settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setShopSettings({ ...shopSettings, [key]: value });
  };

  const handleToggle = (key) => {
    setShopSettings({ ...shopSettings, [key]: !shopSettings[key] });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>
        <p className="text-gray-600 mt-1">Configure e-commerce shop settings</p>
      </div>

      <div>
          <div className="max-w-4xl space-y-6">
            {/* General Shop Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Store className="w-5 h-5 mr-2" />
                General Shop Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={shopSettings.shopName}
                    onChange={(e) => handleChange('shopName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Description</label>
                  <textarea
                    value={shopSettings.shopDescription}
                    onChange={(e) => handleChange('shopDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Email</label>
                    <input
                      type="email"
                      value={shopSettings.shopEmail}
                      onChange={(e) => handleChange('shopEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Phone</label>
                    <input
                      type="tel"
                      value={shopSettings.shopPhone}
                      onChange={(e) => handleChange('shopPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shop Address</label>
                  <input
                    type="text"
                    value={shopSettings.shopAddress}
                    onChange={(e) => handleChange('shopAddress', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Currency & Pricing */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Currency & Pricing
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={shopSettings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={shopSettings.taxRate}
                      onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Include Tax in Price</div>
                    <div className="text-sm text-gray-500">Display prices including tax</div>
                  </div>
                  <button
                    onClick={() => handleToggle('includeTaxInPrice')}
                    className="p-2"
                  >
                    {shopSettings.includeTaxInPrice ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Allow Backorders</div>
                    <div className="text-sm text-gray-500">Allow customers to order out-of-stock items</div>
                  </div>
                  <button
                    onClick={() => handleToggle('allowBackorders')}
                    className="p-2"
                  >
                    {shopSettings.allowBackorders ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={shopSettings.lowStockThreshold}
                    onChange={(e) => handleChange('lowStockThreshold', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Shipping Settings
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold ($)</label>
                    <input
                      type="number"
                      value={shopSettings.freeShippingThreshold}
                      onChange={(e) => handleChange('freeShippingThreshold', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Shipping Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={shopSettings.defaultShippingRate}
                      onChange={(e) => handleChange('defaultShippingRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">International Shipping</div>
                    <div className="text-sm text-gray-500">Enable international shipping</div>
                  </div>
                  <button
                    onClick={() => handleToggle('internationalShipping')}
                    className="p-2"
                  >
                    {shopSettings.internationalShipping ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {shopSettings.internationalShipping && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">International Shipping Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={shopSettings.internationalShippingRate}
                      onChange={(e) => handleChange('internationalShippingRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
                  <input
                    type="text"
                    value={shopSettings.processingTime}
                    onChange={(e) => handleChange('processingTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="e.g., 1-2 business days"
                  />
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Additional Payment Methods
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Enable COD payment option</div>
                  </div>
                  <button
                    onClick={() => handleToggle('enableCashOnDelivery')}
                    className="p-2"
                  >
                    {shopSettings.enableCashOnDelivery ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {shopSettings.enableCashOnDelivery && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">COD Fee ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={shopSettings.codFee}
                      onChange={(e) => handleChange('codFee', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Bank Transfer</div>
                    <div className="text-sm text-gray-500">Enable bank transfer payment option</div>
                  </div>
                  <button
                    onClick={() => handleToggle('enableBankTransfer')}
                    className="p-2"
                  >
                    {shopSettings.enableBankTransfer ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {shopSettings.enableBankTransfer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Transfer Instructions</label>
                    <textarea
                      value={shopSettings.bankTransferInstructions}
                      onChange={(e) => handleChange('bankTransferInstructions', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Provide bank account details and instructions"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Inventory Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Track Inventory</div>
                    <div className="text-sm text-gray-500">Enable inventory tracking</div>
                  </div>
                  <button
                    onClick={() => handleToggle('trackInventory')}
                    className="p-2"
                  >
                    {shopSettings.trackInventory ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Allow Out of Stock Purchase</div>
                    <div className="text-sm text-gray-500">Allow customers to buy out-of-stock items</div>
                  </div>
                  <button
                    onClick={() => handleToggle('allowOutOfStockPurchase')}
                    className="p-2"
                  >
                    {shopSettings.allowOutOfStockPurchase ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Notify Low Stock</div>
                    <div className="text-sm text-gray-500">Send notifications when stock is low</div>
                  </div>
                  <button
                    onClick={() => handleToggle('notifyLowStock')}
                    className="p-2"
                  >
                    {shopSettings.notifyLowStock ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Notify Out of Stock</div>
                    <div className="text-sm text-gray-500">Send notifications when items are out of stock</div>
                  </div>
                  <button
                    onClick={() => handleToggle('notifyOutOfStock')}
                    className="p-2"
                  >
                    {shopSettings.notifyOutOfStock ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Returns & Refunds */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Percent className="w-5 h-5 mr-2" />
                Returns & Refunds
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Allow Returns</div>
                    <div className="text-sm text-gray-500">Enable product returns</div>
                  </div>
                  <button
                    onClick={() => handleToggle('allowReturns')}
                    className="p-2"
                  >
                    {shopSettings.allowReturns ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {shopSettings.allowReturns && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Return Period (Days)</label>
                        <input
                          type="number"
                          value={shopSettings.returnPeriodDays}
                          onChange={(e) => handleChange('returnPeriodDays', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Restocking Fee ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={shopSettings.restockingFee}
                          onChange={(e) => handleChange('restockingFee', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return Policy</label>
                      <textarea
                        value={shopSettings.returnPolicy}
                        onChange={(e) => handleChange('returnPolicy', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Notify New Orders</div>
                    <div className="text-sm text-gray-500">Send email notification for new orders</div>
                  </div>
                  <button
                    onClick={() => handleToggle('notifyNewOrder')}
                    className="p-2"
                  >
                    {shopSettings.notifyNewOrder ? <ToggleRight className="w-6 h-6 text-green-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Notification Email</label>
                  <input
                    type="email"
                    value={shopSettings.notifyLowStockEmail}
                    onChange={(e) => handleChange('notifyLowStockEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Out of Stock Notification Email</label>
                  <input
                    type="email"
                    value={shopSettings.notifyOutOfStockEmail}
                    onChange={(e) => handleChange('notifyOutOfStockEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
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
    </div>
  );
}