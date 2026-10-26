import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SubscriptionPackage } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreditCard, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, DollarSign, Users, Check, MessageSquare, Star, Zap, BarChart3 } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast.jsx'
import { auditService } from '@/services/auditService'

export default function AdminSubscriptionSettingsPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)

  const [packageForm, setPackageForm] = useState({
    name: '',
    slug: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'KES',
    features: {
      job_applications_limit: 5,
      message_limit: 50,
      connects_included: 0,
      featured_listing: false,
      priority_support: false,
      analytics_access: false,
      custom_perks: []
    },
    active: true
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const data = await SubscriptionPackage.list()
      setPackages(data)
      
      await auditService.log({
        action: 'read',
        entity_type: 'subscription_packages',
        module_name: 'admin',
        metadata: { count: data?.length || 0 }
      })
    } catch (err) {
      await auditService.logError(err, 'admin', { action: 'read_packages' })
      toastError('Load Failed', 'Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePackage = async () => {
    try {
      await SubscriptionPackage.create({
        name: packageForm.name,
        slug: packageForm.slug || packageForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: packageForm.description,
        price_monthly: packageForm.price_monthly,
        price_yearly: packageForm.price_yearly,
        currency: packageForm.currency,
        features: packageForm.features,
        active: packageForm.active,
        created_at: new Date().toISOString()
      })
      success('Package Created', 'Subscription package created successfully')
      setShowModal(false)
      resetForm()
      fetchPackages()
      
      await auditService.logCreate('subscription_packages', newPackage.id, 'admin', { packageForm })
    } catch (err) {
      await auditService.logError(err, 'admin', { action: 'create_package' })
      toastError('Create Failed', 'Failed to create package')
    }
  }

  const handleUpdatePackage = async () => {
    if (!editingPackage) return
    try {
      await SubscriptionPackage.update(editingPackage.id, {
        name: packageForm.name,
        slug: packageForm.slug || packageForm.name.toLowerCase().replace(/\s+/g, '-'),
        description: packageForm.description,
        price_monthly: packageForm.price_monthly,
        price_yearly: packageForm.price_yearly,
        currency: packageForm.currency,
        features: packageForm.features,
        active: packageForm.active
      })
      success('Package Updated', 'Subscription package updated successfully')
      setShowModal(false)
      setEditingPackage(null)
      resetForm()
      fetchPackages()
    } catch (err) {
      toastError('Update Failed', 'Failed to update package')
    }
  }

  const handleDeletePackage = async (id) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    try {
      await SubscriptionPackage.delete(id)
      success('Package Deleted', 'Subscription package deleted successfully')
      await auditService.logDelete('subscription_packages', id, 'admin')
      fetchPackages()
    } catch (err) {
      await auditService.logError(err, 'admin', { action: 'delete_package', package_id: id })
      toastError('Delete Failed', 'Failed to delete package')
    }
  }

  const handleEdit = (pkg) => {
    setEditingPackage(pkg)
    setPackageForm({
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description,
      price_monthly: pkg.price_monthly || 0,
      price_yearly: pkg.price_yearly || 0,
      currency: pkg.currency || 'KES',
      features: pkg.features || {
        job_applications_limit: 5,
        message_limit: 50,
        connects_included: 0,
        featured_listing: false,
        priority_support: false,
        analytics_access: false,
        custom_perks: []
      },
      active: pkg.active !== false
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setPackageForm({
      name: '',
      slug: '',
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      currency: 'KES',
      features: {
        job_applications_limit: 5,
        message_limit: 50,
        connects_included: 0,
        featured_listing: false,
        priority_support: false,
        analytics_access: false,
        custom_perks: []
      },
      active: true
    })
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Subscription Settings</h1>
        <Button onClick={() => setShowModal(true)} className="bg-black text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {pkg.currency} {pkg.price_monthly?.toLocaleString() || 0} <span className="text-sm font-normal text-gray-600">/month</span>
                </p>
                {pkg.price_yearly && (
                  <p className="text-sm text-gray-600">
                    {pkg.currency} {pkg.price_yearly?.toLocaleString() || 0} <span className="text-xs">/year</span>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeletePackage(pkg.id)} className="text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
            <div className="space-y-2 text-sm">
              {pkg.features?.job_applications_limit && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{pkg.features.job_applications_limit} job applications/month</span>
                </div>
              )}
              {pkg.features?.connects_included && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{pkg.features.connects_included} connects included</span>
                </div>
              )}
              {pkg.features?.message_limit && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{pkg.features.message_limit} messages/month</span>
                </div>
              )}
              {pkg.features?.featured_listing && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Featured listing</span>
                </div>
              )}
              {pkg.features?.priority_support && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span>Priority support</span>
                </div>
              )}
              {pkg.features?.analytics_access && (
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span>Analytics access</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                {pkg.active ? <Check className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                <span className="text-sm">{pkg.active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingPackage ? 'Edit Package' : 'Add Package'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug (URL-friendly name)</label>
                <Input value={packageForm.slug} onChange={(e) => setPackageForm({ ...packageForm, slug: e.target.value })} placeholder="package-name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Monthly Price</label>
                  <Input type="number" value={packageForm.price_monthly} onChange={(e) => setPackageForm({ ...packageForm, price_monthly: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Yearly Price</label>
                  <Input type="number" value={packageForm.price_yearly} onChange={(e) => setPackageForm({ ...packageForm, price_yearly: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  value={packageForm.currency}
                  onChange={(e) => setPackageForm({ ...packageForm, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Applications Limit</label>
                    <Input type="number" value={packageForm.features.job_applications_limit} onChange={(e) => setPackageForm({ ...packageForm, features: { ...packageForm.features, job_applications_limit: parseInt(e.target.value) } })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message Limit</label>
                    <Input type="number" value={packageForm.features.message_limit} onChange={(e) => setPackageForm({ ...packageForm, features: { ...packageForm.features, message_limit: parseInt(e.target.value) } })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Connects Included</label>
                    <Input type="number" value={packageForm.features.connects_included} onChange={(e) => setPackageForm({ ...packageForm, features: { ...packageForm.features, connects_included: parseInt(e.target.value) } })} />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={packageForm.features.featured_listing}
                      onChange={(e) => setPackageForm({ ...packageForm, features: { ...packageForm.features, featured_listing: e.target.checked } })}
                      className="rounded"
                    />
                    <span className="text-sm">Featured Listing</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={packageForm.features.priority_support}
                      onChange={(e) => setPackageForm({ ...packageForm, features: { ...packageForm.features, priority_support: e.target.checked } })}
                      className="rounded"
                    />
                    <span className="text-sm">Priority Support</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={packageForm.features.analytics_access}
                      onChange={(e) => setPackageForm({ ...packageForm, features: { ...packageForm.features, analytics_access: e.target.checked } })}
                      className="rounded"
                    />
                    <span className="text-sm">Analytics Access</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={editingPackage ? handleUpdatePackage : handleCreatePackage} className="flex-1 bg-black text-white">
                  {editingPackage ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
