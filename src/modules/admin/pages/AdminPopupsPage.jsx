import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import { Plus, Edit2, Trash2, Upload, Play, X, ExternalLink } from 'lucide-react'
import { base44 } from '@/api/base44Client'
import { useToast } from '@/hooks/useToast'
import DynamicPopupModal from '@/components/landing/backstage/DynamicPopupModal'

const popupEntity = base44.entities.popups || {
  list: async () => [],
  filter: async () => [],
  get: async () => null,
  create: async () => null,
  update: async () => null,
  delete: async () => null,
}

export default function AdminPopupsPage() {
  const { success, error: toastError } = useToast()
  const [popups, setPopups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPopup, setEditingPopup] = useState(null)
  const [previewPopup, setPreviewPopup] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    image_url: '',
    video_url: '',
    video_source: 'upload',
    cta_text: '',
    cta_link: '',
    popup_type: 'announcement',
    display_type: 'modal',
    position: 'center',
    target_audience: ['all'],
    show_on_pages: ['all'],
    is_active: true,
    is_dismissible: true,
    show_once_per_session: true,
    show_after_seconds: 0,
    priority: 0,
  })

  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadPopups()
  }, [])

  const loadPopups = async () => {
    setLoading(true)
    try {
      const data = await popupEntity.filter({}, '-created_at', 100)
      setPopups(data || [])
    } catch (err) {
      
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await base44.integrations.Core.UploadFile({ file })
      const fileUrl = response.file_url || response.url
      setFormData({ ...formData, image_url: fileUrl })
    } catch (err) {
      
      toastError('Upload Failed', 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const response = await base44.integrations.Core.UploadFile({ file })
      const fileUrl = response.file_url || response.url
      setFormData({ ...formData, video_url: fileUrl, video_source: 'upload' })
    } catch (err) {
      
      toastError('Upload Failed', 'Failed to upload video')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        target_audience: Array.isArray(formData.target_audience) ? formData.target_audience : [formData.target_audience],
        show_on_pages: Array.isArray(formData.show_on_pages) ? formData.show_on_pages : [formData.show_on_pages],
      }

      if (editingPopup) {
        await popupEntity.update(editingPopup.id, dataToSave)
        success('Popup Updated', 'Popup has been updated successfully')
      } else {
        await popupEntity.create(dataToSave)
        success('Popup Created', 'Popup has been created successfully')
      }

      setShowModal(false)
      setEditingPopup(null)
      resetForm()
      loadPopups()
    } catch (err) {
      
      toastError('Save Failed', 'Failed to save popup')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this popup?')) return

    try {
      await popupEntity.delete(id)
      success('Popup Deleted', 'Popup has been deleted')
      loadPopups()
    } catch (err) {
      
      toastError('Delete Failed', 'Failed to delete popup')
    }
  }

  const handleEdit = (popup) => {
    setEditingPopup(popup)
    setFormData({
      title: popup.title || '',
      body: popup.body || '',
      image_url: popup.image_url || '',
      video_url: popup.video_url || '',
      video_source: popup.video_source || 'upload',
      cta_text: popup.cta_text || '',
      cta_link: popup.cta_link || '',
      popup_type: popup.popup_type || 'announcement',
      display_type: popup.display_type || 'modal',
      position: popup.position || 'center',
      target_audience: popup.target_audience || ['all'],
      show_on_pages: popup.show_on_pages || ['all'],
      is_active: popup.is_active ?? true,
      is_dismissible: popup.is_dismissible ?? true,
      show_once_per_session: popup.show_once_per_session ?? true,
      show_after_seconds: popup.show_after_seconds || 0,
      priority: popup.priority || 0,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      image_url: '',
      video_url: '',
      video_source: 'upload',
      cta_text: '',
      cta_link: '',
      popup_type: 'announcement',
      display_type: 'modal',
      position: 'center',
      target_audience: ['all'],
      show_on_pages: ['all'],
      is_active: true,
      is_dismissible: true,
      show_once_per_session: true,
      show_after_seconds: 0,
      priority: 0,
    })
  }

  const handlePreview = (popup) => {
    setPreviewPopup(popup)
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
              <h1 className="text-3xl font-bold text-gray-900">Dynamic Popups</h1>
              <p className="text-gray-600 mt-1">Manage modal popups, announcements, and promotional content</p>
            </div>
            <Button
              onClick={() => {
                resetForm()
                setEditingPopup(null)
                setShowModal(true)
              }}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Popup
            </Button>
          </div>
        </div>
      </div>

      {/* Popup List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-4">
          {popups.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No popups created yet. Click "Create Popup" to get started.</p>
              </CardContent>
            </Card>
          ) : (
            popups.map((popup) => (
              <Card key={popup.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{popup.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          popup.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {popup.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                          {popup.popup_type}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{popup.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {popup.image_url && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Upload className="w-3 h-3" /> Image
                          </span>
                        )}
                        {popup.video_url && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Play className="w-3 h-3" /> Video
                          </span>
                        )}
                        {popup.cta_text && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> CTA
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(popup)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(popup)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(popup.id)}
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
                {editingPopup ? 'Edit Popup' : 'Create Popup'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Popup title"
                />
              </div>
              <div>
                <Label>Body Content</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Popup body text (supports HTML)"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Image</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : formData.image_url ? 'Change Image' : 'Upload Image'}
                    </label>
                    {formData.image_url && (
                      <img src={formData.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Video</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploading}
                      className="hidden"
                      id="video-upload"
                    />
                    <label
                      htmlFor="video-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : formData.video_url ? 'Change Video' : 'Upload Video'}
                    </label>
                    {formData.video_url && (
                      <p className="mt-2 text-xs text-gray-500 truncate">{formData.video_url}</p>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label>Video Source</Label>
                <Select
                  value={formData.video_source}
                  onValueChange={(value) => setFormData({ ...formData, video_source: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upload">Upload</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="external">External URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.video_source !== 'upload' && (
                <div>
                  <Label>Video URL</Label>
                  <Input
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CTA Text</Label>
                  <Input
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="e.g., Learn More"
                  />
                </div>
                <div>
                  <Label>CTA Link</Label>
                  <Input
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.popup_type}
                    onValueChange={(value) => setFormData({ ...formData, popup_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="trailer">Trailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Display</Label>
                  <Select
                    value={formData.display_type}
                    onValueChange={(value) => setFormData({ ...formData, display_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modal">Modal</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="slide-in">Slide-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Position</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
                <Switch
                  checked={formData.is_dismissible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_dismissible: checked })}
                />
                <Label>Dismissible</Label>
                <Switch
                  checked={formData.show_once_per_session}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_once_per_session: checked })}
                />
                <Label>Show Once Per Session</Label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gray-900 text-white hover:bg-gray-800">
                {editingPopup ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPopup && (
        <DynamicPopupModal popup={previewPopup} onClose={() => setPreviewPopup(null)} />
      )}
    </div>
  )
}
