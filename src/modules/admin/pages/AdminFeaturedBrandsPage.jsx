import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Switch } from '@/shared/components/ui/switch'
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react'
import { base44 } from '@/api/base44Client'
import { useToast } from '@/hooks/useToast'
import { FeaturedBrand } from '@/lib/supabaseEntities'

export default function AdminFeaturedBrandsPage() {
  const { success, error: toastError } = useToast()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    description: '',
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    loadBrands()
  }, [])

  const loadBrands = async () => {
    setLoading(true)
    try {
      const data = await FeaturedBrand.filter({}, 'order_index', 100)
      setBrands(data || [])
    } catch (err) {
      
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await base44.integrations.Core.UploadFile({ file })
      const fileUrl = response.file_url || response.url
      setFormData({ ...formData, logo_url: fileUrl })
    } catch (err) {
      
      toastError('Upload Failed', 'Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (editingBrand) {
        await FeaturedBrand.update(editingBrand.id, formData)
        success('Brand Updated', 'Featured brand has been updated')
      } else {
        await FeaturedBrand.create(formData)
        success('Brand Created', 'Featured brand has been created')
      }

      setShowModal(false)
      setEditingBrand(null)
      resetForm()
      loadBrands()
    } catch (err) {
      
      toastError('Save Failed', 'Failed to save brand')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this featured brand?')) return

    try {
      await FeaturedBrand.delete(id)
      success('Brand Deleted', 'Featured brand has been deleted')
      loadBrands()
    } catch (err) {
      
      toastError('Delete Failed', 'Failed to delete brand')
    }
  }

  const handleEdit = (brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name || '',
      logo_url: brand.logo_url || '',
      website_url: brand.website_url || '',
      description: brand.description || '',
      order_index: brand.order_index || 0,
      is_active: brand.is_active ?? true,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      website_url: '',
      description: '',
      order_index: 0,
      is_active: true,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Featured Brands</h1>
              <p className="text-gray-600 mt-1">Manage trusted brands carousel on landing page</p>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setEditingBrand(null)
                setShowModal(true)
              }}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-4">
          {brands.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No featured brands added yet. Click "Add Brand" to get started.</p>
              </CardContent>
            </Card>
          ) : (
            brands.map((brand) => (
              <Card key={brand.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {brand.logo_url && (
                        <img
                          src={brand.logo_url}
                          alt={brand.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{brand.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            brand.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {brand.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        {brand.website_url && (
                          <a
                            href={brand.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {brand.website_url}
                          </a>
                        )}
                        {brand.description && (
                          <p className="text-sm text-gray-600 mt-1">{brand.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(brand)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingBrand ? 'Edit Featured Brand' : 'Add Featured Brand'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Brand Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Netflix"
                />
              </div>
              <div>
                <Label>Logo</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : formData.logo_url ? 'Change Logo' : 'Upload Logo'}
                  </label>
                  {formData.logo_url && (
                    <img src={formData.logo_url} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg" />
                  )}
                </div>
              </div>
              <div>
                <Label>Website URL</Label>
                <Input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the brand"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order Index</Label>
                  <Input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gray-900 text-white hover:bg-gray-800">
                {editingBrand ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
