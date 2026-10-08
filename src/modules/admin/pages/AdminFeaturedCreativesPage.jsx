import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Switch } from '@/shared/components/ui/switch'
import { Plus, Edit2, Trash2, Upload, Star, Flame, MessageCircle, X } from 'lucide-react'
import { base44 } from '@/api/base44Client'
import { useToast } from '@/hooks/useToast'
import { FeaturedCreative, Artist } from '@/lib/supabaseEntities'

export default function AdminFeaturedCreativesPage() {
  const { success, error: toastError } = useToast()
  const [creatives, setCreatives] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCreative, setEditingCreative] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    creator_id: '',
    name: '',
    profession: '',
    location: '',
    profile_image: '',
    cover_image: '',
    images: [],
    overlay_text: '',
    badges: [],
    featured: false,
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [creativesData, artistsData] = await Promise.all([
        FeaturedCreative.filter({}, 'order_index', 100),
        Artist.filter({}, 'full_name', 500),
      ])
      setCreatives(creativesData || [])
      setArtists(artistsData || [])
    } catch (err) {
      
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await base44.integrations.Core.UploadFile({ file })
      const fileUrl = response.file_url || response.url
      if (type === 'profile') {
        setFormData({ ...formData, profile_image: fileUrl })
      } else if (type === 'cover') {
        setFormData({ ...formData, cover_image: fileUrl })
      }
    } catch (err) {
      
      toastError('Upload Failed', 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleAddImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await base44.integrations.Core.UploadFile({ file })
      const fileUrl = response.file_url || response.url
      setFormData({ ...formData, images: [...formData.images, fileUrl] })
    } catch (err) {
      
      toastError('Upload Failed', 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  const handleToggleBadge = (badge) => {
    if (formData.badges.includes(badge)) {
      setFormData({ ...formData, badges: formData.badges.filter(b => b !== badge) })
    } else {
      setFormData({ ...formData, badges: [...formData.badges, badge] })
    }
  }

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        images: JSON.stringify(formData.images),
        badges: JSON.stringify(formData.badges),
      }

      if (editingCreative) {
        await FeaturedCreative.update(editingCreative.id, dataToSave)
        success('Creative Updated', 'Featured creative has been updated')
      } else {
        await FeaturedCreative.create(dataToSave)
        success('Creative Created', 'Featured creative has been created')
      }

      setShowModal(false)
      setEditingCreative(null)
      resetForm()
      loadData()
    } catch (err) {
      
      toastError('Save Failed', 'Failed to save creative')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this featured creative?')) return

    try {
      await FeaturedCreative.delete(id)
      success('Creative Deleted', 'Featured creative has been deleted')
      loadData()
    } catch (err) {
      
      toastError('Delete Failed', 'Failed to delete creative')
    }
  }

  const handleEdit = (creative) => {
    setEditingCreative(creative)
    setFormData({
      creator_id: creative.creator_id || '',
      name: creative.name || '',
      profession: creative.profession || '',
      location: creative.location || '',
      profile_image: creative.profile_image || '',
      cover_image: creative.cover_image || '',
      images: Array.isArray(creative.images) ? creative.images : JSON.parse(creative.images || '[]'),
      overlay_text: creative.overlay_text || '',
      badges: Array.isArray(creative.badges) ? creative.badges : JSON.parse(creative.badges || '[]'),
      featured: creative.featured || false,
      order_index: creative.order_index || 0,
      is_active: creative.is_active ?? true,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      creator_id: '',
      name: '',
      profession: '',
      location: '',
      profile_image: '',
      cover_image: '',
      images: [],
      overlay_text: '',
      badges: [],
      featured: false,
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Featured Creatives</h1>
              <p className="text-gray-600 mt-1">Manage featured talent carousel on landing page</p>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setEditingCreative(null)
                setShowModal(true)
              }}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Creative
            </Button>
          </div>
        </div>
      </div>

      {/* Creative List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-4">
          {creatives.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No featured creatives added yet. Click "Add Creative" to get started.</p>
              </CardContent>
            </Card>
          ) : (
            creatives.map((creative) => (
              <Card key={creative.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {creative.profile_image && (
                        <img
                          src={creative.profile_image}
                          alt={creative.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{creative.name}</h3>
                          {creative.featured && (
                            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                              Featured
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            creative.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {creative.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{creative.profession} • {creative.location}</p>
                        {creative.overlay_text && (
                          <p className="text-xs text-gray-500 mt-1">Overlay: {creative.overlay_text}</p>
                        )}
                        <div className="mt-2 flex gap-2">
                          {Array.isArray(creative.badges) ? creative.badges.map((badge) => (
                            <span key={badge} className="text-xs px-2 py-1 bg-gray-100 rounded">{badge}</span>
                          )) : JSON.parse(creative.badges || '[]').map((badge) => (
                            <span key={badge} className="text-xs px-2 py-1 bg-gray-100 rounded">{badge}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(creative)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(creative.id)}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCreative ? 'Edit Featured Creative' : 'Add Featured Creative'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Link to Artist Profile (Optional)</Label>
                <select
                  value={formData.creator_id}
                  onChange={(e) => setFormData({ ...formData, creator_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">-- Select Artist --</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.full_name || artist.username}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Creative name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Profession</Label>
                  <Input
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="e.g., Actor, Director"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Nairobi, Kenya"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Profile Image</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profile')}
                      disabled={uploading}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label
                      htmlFor="profile-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : formData.profile_image ? 'Change Image' : 'Upload Image'}
                    </label>
                    {formData.profile_image && (
                      <img src={formData.profile_image} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Cover Image</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cover')}
                      disabled={uploading}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : formData.cover_image ? 'Change Image' : 'Upload Image'}
                    </label>
                    {formData.cover_image && (
                      <img src={formData.cover_image} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label>Carousel Images</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddImage}
                    disabled={uploading}
                    className="hidden"
                    id="carousel-upload"
                  />
                  <label
                    htmlFor="carousel-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Add Carousel Image'}
                  </label>
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img src={img} alt={`Carousel ${idx}`} className="w-full h-20 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label>Overlay Text</Label>
                <Input
                  value={formData.overlay_text}
                  onChange={(e) => setFormData({ ...formData, overlay_text: e.target.value })}
                  placeholder="e.g., BOLD & BEYOND"
                />
              </div>
              <div>
                <Label>Badges</Label>
                <div className="mt-2 flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleToggleBadge('star')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      formData.badges.includes('star') ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                    Star
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleBadge('flame')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      formData.badges.includes('flame') ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    Flame
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleBadge('chat')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      formData.badges.includes('chat') ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                </div>
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
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label>Featured</Label>
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
                {editingCreative ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
