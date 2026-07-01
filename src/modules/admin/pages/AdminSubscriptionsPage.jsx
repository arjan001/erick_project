import React, { useState, useEffect } from 'react';
import { SubscriptionPackage, SubscriptionOrder } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Check, X, Crown, Star, Zap } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [packages, setPackages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [activeTab, setActiveTab] = useState('plans');

  const defaultForm = {
    name: '', description: '', price: '', currency: 'USD',
    billing_cycle: 'monthly', job_applications_limit: 10,
    message_limit: 50, connects_included: 10, featured_listing: false,
    priority_support: false, analytics_access: false,
    active: true, display_order: 0
  };
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pkgs, ords] = await Promise.all([
        SubscriptionPackage.list('-display_order', 50),
        SubscriptionOrder.list('-created_at', 100)
      ]);
      setPackages(pkgs || []);
      setOrders(ords || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        ...form,
        price: parseFloat(form.price) || 0,
        job_applications_limit: parseInt(form.job_applications_limit),
        message_limit: parseInt(form.message_limit),
        connects_included: parseInt(form.connects_included) || 0,
        display_order: parseInt(form.display_order) || 0
      };
      if (editingPkg) {
        await SubscriptionPackage.update(editingPkg.id, data);
      } else {
        await SubscriptionPackage.create(data);
      }
      setShowForm(false);
      setEditingPkg(null);
      setForm(defaultForm);
      fetchData();
    } catch (err) {
      alert('Error saving plan: ' + err.message);
    }
  };

  const handleEdit = (pkg) => {
    setEditingPkg(pkg);
    setForm({ ...pkg });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;
    await SubscriptionPackage.delete(id);
    fetchData();
  };

  const handleToggleActive = async (pkg) => {
    await SubscriptionPackage.update(pkg.id, { active: !pkg.active });
    fetchData();
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
      <p className="text-gray-500 mb-6">Manage plans that artists can subscribe to</p>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {['plans', 'orders'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab ? 'border-black text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab === 'plans' ? `Plans (${packages.length})` : `Orders (${orders.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'plans' && (
        <>
          <div className="flex justify-end mb-6">
            <Button onClick={() => { setEditingPkg(null); setForm(defaultForm); setShowForm(true); }} className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" /> New Plan
            </Button>
          </div>

          {/* Plan Form */}
          {showForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">{editingPkg ? 'Edit Plan' : 'Create Plan'}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Plan Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="e.g. Pro" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (USD) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    placeholder="29.99" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Billing Cycle</label>
                  <select value={form.billing_cycle} onChange={e => setForm({...form, billing_cycle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Job Applications/month (-1 = unlimited)</label>
                  <input type="number" value={form.job_applications_limit} onChange={e => setForm({...form, job_applications_limit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Messages/month (-1 = unlimited)</label>
                  <input type="number" value={form.message_limit} onChange={e => setForm({...form, message_limit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Connects Included (like Fiverr/Upwork connects)</label>
                  <input type="number" value={form.connects_included} onChange={e => setForm({...form, connects_included: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input type="number" value={form.display_order} onChange={e => setForm({...form, display_order: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    rows={2} placeholder="Plan description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                </div>
                <div className="col-span-2 flex gap-6">
                  {[['featured_listing', 'Featured Listing'], ['priority_support', 'Priority Support'], ['analytics_access', 'Analytics Access']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form[key]} onChange={e => setForm({...form, [key]: e.target.checked})} className="w-4 h-4" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">Save Plan</Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingPkg(null); setForm(defaultForm); }}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map(pkg => (
              <div key={pkg.id} className={`bg-white border-2 rounded-xl p-5 ${pkg.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                    <div className="text-2xl font-bold">${pkg.price}<span className="text-sm font-normal text-gray-500">/{pkg.billing_cycle}</span></div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${pkg.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {pkg.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                <div className="space-y-1 text-xs text-gray-600 mb-4">
                  <div className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />{pkg.connects_included || 0} connects included</div>
                  <div className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />{pkg.job_applications_limit === -1 ? 'Unlimited' : pkg.job_applications_limit} applications/mo</div>
                  <div className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />{pkg.message_limit === -1 ? 'Unlimited' : pkg.message_limit} messages/mo</div>
                  {pkg.featured_listing && <div className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />Featured listing</div>}
                  {pkg.priority_support && <div className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />Priority support</div>}
                  {pkg.analytics_access && <div className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />Analytics access</div>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)}><Edit2 className="w-3 h-3 mr-1" />Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => handleToggleActive(pkg)}>
                    {pkg.active ? <X className="w-3 h-3 mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                    {pkg.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(pkg.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {packages.length === 0 && (
              <div className="col-span-3 text-center py-16 text-gray-500">
                <Crown className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No plans yet. Create your first subscription plan.</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Card (last 4)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{order.user_name}</div>
                    <div className="text-xs text-gray-500">{order.user_email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{order.package_name}</td>
                  <td className="px-4 py-3 font-medium">${order.amount} {order.currency}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.card_last4 ? `**** ${order.card_last4}` : '—'}
                    {order.cardholder_name && <div className="text-xs text-gray-400">{order.cardholder_name}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : new Date(order.created_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}