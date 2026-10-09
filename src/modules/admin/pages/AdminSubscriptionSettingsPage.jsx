import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SubscriptionPackage } from '@/lib/supabaseEntities'
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
      const data = await SubscriptionPackage.list()
      setPackages(data)
    } catch (err) {
      toastError('Load Failed', 'Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePackage = async () => {
    try {
      await SubscriptionPackage.create({
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
      toastError('Create Failed', 'Failed to create package')
    }
  }

  const handleUpdatePackage = async () => {
    if (!editingPackage) return
    try {
      await SubscriptionPackage.update(editingPackage.id, packageForm)
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

  const handleDeletePackage = async (id) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    try {
      await SubscriptionPackage.delete(id)
      success('Package Deleted', 'Subscription package deleted successfully')
      fetchPackages()
    } catch (err) {
      toastError('Delete Failed', 'Failed to delete package')
    }
  }

  const handleEdit = (pkg) => {
    setEditingPackage(pkg)
    setPackageForm(pkg)
    setShowModal(true)
  }

  const resetForm = () => {
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
                  ${pkg.price} <span className="text-sm font-normal text-gray-600">/{pkg.billing_cycle}</span>
                </p>
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
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{pkg.job_applications_limit} job applications/month</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>{pkg.connects_included} connects included</span>
              </div>
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingPackage ? 'Edit Package' : 'Add Package'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} />
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
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <Input type="number" value={packageForm.price} onChange={(e) => setPackageForm({ ...packageForm, price: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={packageForm.currency}
                    onChange={(e) => setPackageForm({ ...packageForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="KES">KES</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Billing Cycle</label>
                <select
                  value={packageForm.billing_cycle}
                  onChange={(e) => setPackageForm({ ...packageForm, billing_cycle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Job Applications Limit</label>
                  <Input type="number" value={packageForm.job_applications_limit} onChange={(e) => setPackageForm({ ...packageForm, job_applications_limit: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message Limit</label>
                  <Input type="number" value={packageForm.message_limit} onChange={(e) => setPackageForm({ ...packageForm, message_limit: parseInt(e.target.value) })} />
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
