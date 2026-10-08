import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Save, Upload, Shield, HardDrive } from 'lucide-react'
import { FileUploadSettings } from '@/lib/supabaseEntities'
import { useToast } from '@/hooks/useToast'

export default function AdminFileUploadSettingsPage() {
  const { success, error: toastError } = useToast()
  const [settings, setSettings] = useState({
    max_file_size_mb: 10,
    allowed_image_types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowed_video_types: ['video/mp4', 'video/webm', 'video/quicktime'],
    allowed_document_types: ['application/pdf'],
    require_admin_approval: false
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settingsList = await FileUploadSettings.list('-created_at', 1)
      if (settingsList && settingsList.length > 0) {
        setSettings(settingsList[0])
      }
    } catch (error) {
      // Use defaults if load fails
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const settingsList = await FileUploadSettings.list('-created_at', 1)
      if (settingsList && settingsList.length > 0) {
        await FileUploadSettings.update(settingsList[0].id, settings)
      } else {
        await FileUploadSettings.create(settings)
      }
      success('Saved', 'File upload settings updated successfully')
    } catch (error) {
      toastError('Error', 'Failed to save file upload settings')
    } finally {
      setLoading(false)
    }
  }

  const addImageType = () => {
    setSettings({
      ...settings,
      allowed_image_types: [...settings.allowed_image_types, '']
    ])
  }

  const updateImageType = (index, value) => {
    const newTypes = [...settings.allowed_image_types]
    newTypes[index] = value
    setSettings({ ...settings, allowed_image_types: newTypes })
  }

  const removeImageType = (index) => {
    const newTypes = settings.allowed_image_types.filter((_, i) => i !== index)
    setSettings({ ...settings, allowed_image_types: newTypes })
  }

  const addVideoType = () => {
    setSettings({
      ...settings,
      allowed_video_types: [...settings.allowed_video_types, '']
    })
  }

  const updateVideoType = (index, value) => {
    const newTypes = [...settings.allowed_video_types]
    newTypes[index] = value
    setSettings({ ...settings, allowed_video_types: newTypes })
  }

  const removeVideoType = (index) => {
    const newTypes = settings.allowed_video_types.filter((_, i) => i !== index)
    setSettings({ ...settings, allowed_video_types: newTypes })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">File Upload Settings</h1>
          <p className="text-gray-600">Configure file upload validation and security</p>
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-black text-white hover:bg-gray-800">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Maximum File Size (MB)</Label>
              <Input
                type="number"
                value={settings.max_file_size_mb}
                onChange={(e) => setSettings({ ...settings, max_file_size_mb: parseInt(e.target.value) || 10 })}
                min="1"
                max="100"
              />
              <p className="text-sm text-gray-600">Maximum file size allowed for uploads</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Admin Approval</Label>
                <p className="text-sm text-gray-600">All uploads must be approved by admin</p>
              </div>
              <Switch
                checked={settings.require_admin_approval}
                onCheckedChange={(checked) => setSettings({ ...settings, require_admin_approval: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Allowed Image Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.allowed_image_types.map((type, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={type}
                  onChange={(e) => updateImageType(index, e.target.value)}
                  placeholder="image/jpeg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImageType(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={addImageType} variant="outline" className="w-full">
              + Add Image Type
            </Button>
          </CardContent>
        </Card>

        {/* Video Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Allowed Video Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.allowed_video_types.map((type, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={type}
                  onChange={(e) => updateVideoType(index, e.target.value)}
                  placeholder="video/mp4"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeVideoType(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={addVideoType} variant="outline" className="w-full">
              + Add Video Type
            </Button>
          </CardContent>
        </Card>

        {/* Document Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Allowed Document Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings.allowed_document_types.map((type, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={type}
                  onChange={(e) => {
                    const newTypes = [...settings.allowed_document_types]
                    newTypes[index] = e.target.value
                    setSettings({ ...settings, allowed_document_types: newTypes })
                  }}
                  placeholder="application/pdf"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newTypes = settings.allowed_document_types.filter((_, i) => i !== index)
                    setSettings({ ...settings, allowed_document_types: newTypes })
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              onClick={() => setSettings({ ...settings, allowed_document_types: [...settings.allowed_document_types, ''] })}
              variant="outline"
              className="w-full"
            >
              + Add Document Type
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
