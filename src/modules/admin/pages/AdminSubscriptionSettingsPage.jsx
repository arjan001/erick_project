import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { base44 } from '@/api/base44Client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CreditCard, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, DollarSign, Users, Check } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast.jsx'

export default function AdminSubscriptionSettingsPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)

  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    billing_cycle: 'monthly',
    job_applications_limit: 5,
    message_limit: 50,
    connects_included: 0,
    duration_days: 30,
    featured_listing: false,
    priority_support: false,
    analytics_access: false,
    active: true
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const data = await base44.entities.SubscriptionPackage.list()
      setPackages(data)
    } catch (err) {
      
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePackage = async () => {
    try {
      await base44.entities.SubscriptionPackage.create({
        ...packageForm,
        created_at: new Date().toISOString()
      })
      success('Package Created', 'Subscription package created successfully')
      setShowModal(false)
      setPackageForm({
        name: '',
        description: '',
        price: 0,
        currency: 'USD',
        billing_cycle: 'monthly',
        job_applications_limit: 5,
        message_limit: 50,
        connects_included: 0,
        duration_days: 30,
        featured_listing: false,
        priority_support: false,
        analytics_access: false,
        active: true
      })
      fetchPackages()
    } catch (err) {
      
      toastError('Creation Failed', 'Failed to create package')
    }
  }

  const handleUpdatePackage = async () => {
    if (!editingPackage) return
    try {
      await base44.entities.SubscriptionPackage.update(editingPackage.id, {
        ...packageForm,
        updated_at: new Date().toISOString()
      })
      success('Package Updated', 'Subscription package updated successfully')
      setShowModal(false)
      setEditingPackage(null)
      setPackageForm({
        name: '',
        description: '',
        price: 0,
        currency: 'USD',
        billing_cycle: 'monthly',
        job_applications_limit: 5,
        message_limit: 50,
        connects_included: 0,
        duration_days: 30,
        featured_listing: false,
        priority_support: false,
        analytics_access: false,
        active: true
      })
      fetchPackages()
    } catch (err) {
      
      toastError('Update Failed', 'Failed to update package')
    }
  }

  const handleToggleActive = async (pkg) => {
    try {
      await base44.entities.SubscriptionPackage.update(pkg.id, {
        active: !pkg.active,
        updated_at: new Date().toISOString()
      })
      success('Status Updated', `Package ${pkg.active ? 'disabled' : 'enabled'}`)
      fetchPackages()
    } catch (err) {
      
      toastError('Update Failed', 'Failed to update package status')
    }
  }

  const handleDeletePackage = async (pkgId) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    try {
      await base44.entities.SubscriptionPackage.delete(pkgId)
      success('Package Deleted', 'Subscription package deleted successfully')
      fetchPackages()
    } catch (err) {
      
      toastError('Delete Failed', 'Failed to delete package')
    }
  }

  const openModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg)
      setPackageForm(pkg)
    } else {
      setEditingPackage(null)
      setPackageForm({
        name: '',
        description: '',
        price: 0,
        currency: 'USD',
        billing_cycle: 'monthly',
        job_applications_limit: 5,
        message_limit: 50,
        connects_included: 0,
        duration_days: 30,
        featured_listing: false,
        priority_support: false,
        analytics_access: false,
        active: true
      })
    }
    setShowModal(true)
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Settings</h1>
          <p className="text-gray-600">Manage subscription packages and pricing</p>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{pkg.name}</h3>
                <p className="text-3xl font-bold text-gray-900">
                  ${pkg.price}
                  <span className="text-sm font-normal text-gray-500">/{pkg.billing_cycle}</span>
                </p>
              </div>
              <button
                onClick={() => handleToggleActive(pkg)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {pkg.active ? (
                  <ToggleRight className="w-5 h-5 text-green-600" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-700">
                <Users className="w-4 h-4 mr-2" />
                {pkg.job_applications_limit === -1 ? 'Unlimited' : `${pkg.job_applications_limit}`} job applications/month
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <CreditCard className="w-4 h-4 mr-2" />
                {pkg.message_limit === -1 ? 'Unlimited' : `${pkg.message_limit}`} messages/month
              </div>
              {pkg.featured_listing && (
                <div className="flex items-center text-sm text-green-600">
                  <Check className="w-4 h-4 mr-2" />
                  Featured listing
                </div>
              )}
              {pkg.priority_support && (
                <div className="flex items-center text-sm text-green-600">
                  <Check className="w-4 h-4 mr-2" />
                  Priority support
                </div>
              )}
              {pkg.analytics_access && (
                <div className="flex items-center text-sm text-green-600">
                  <Check className="w-4 h-4 mr-2" />
                  Advanced analytics
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openModal(pkg)} className="flex-1">
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeletePackage(pkg.id)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingPackage ? 'Edit Package' : 'Create Package'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Package Name</label>
                <Input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  placeholder="e.g., Basic, Pro, Enterprise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  placeholder="Describe the package benefits"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Price</label>
                  <Input
                    type="number"
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Billing Cycle</label>
                  <select
                    value={packageForm.billing_cycle}
                    onChange={(e) => setPackageForm({ ...packageForm, billing_cycle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Job Applications Limit</label>
                  <Input
                    type="number"
                    value={packageForm.job_applications_limit}
                    onChange={(e) => setPackageForm({ ...packageForm, job_applications_limit: parseInt(e.target.value) })}
                    placeholder="-1 for unlimited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Message Limit</label>
                  <Input
                    type="number"
                    value={packageForm.message_limit}
                    onChange={(e) => setPackageForm({ ...packageForm, message_limit: parseInt(e.target.value) })}
                    placeholder="-1 for unlimited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Connects Included</label>
                  <Input
                    type="number"
                    value={packageForm.connects_included}
                    onChange={(e) => setPackageForm({ ...packageForm, connects_included: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Duration (Days)</label>
                  <Input
                    type="number"
                    value={packageForm.duration_days}
                    onChange={(e) => setPackageForm({ ...packageForm, duration_days: parseInt(e.target.value) })}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={packageForm.featured_listing}
                    onChange={(e) => setPackageForm({ ...packageForm, featured_listing: e.target.checked })}
                    className="w-4 h-4 mr-2"
                  />
                  <span className="text-sm text-gray-700">Featured Listing</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={packageForm.priority_support}
                    onChange={(e) => setPackageForm({ ...packageForm, priority_support: e.target.checked })}
                    className="w-4 h-4 mr-2"
                  />
                  <span className="text-sm text-gray-700">Priority Support</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={packageForm.analytics_access}
                    onChange={(e) => setPackageForm({ ...packageForm, analytics_access: e.target.checked })}
                    className="w-4 h-4 mr-2"
                  />
                  <span className="text-sm text-gray-700">Advanced Analytics Access</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={packageForm.active}
                    onChange={(e) => setPackageForm({ ...packageForm, active: e.target.checked })}
                    className="w-4 h-4 mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={editingPackage ? handleUpdatePackage : handleCreatePackage}
                  className="bg-black text-white hover:bg-gray-800 flex-1"
                >
                  {editingPackage ? 'Update Package' : 'Create Package'}
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
