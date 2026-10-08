import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { Upload, Trash2, Folder, Image, Video, FileText, HardDrive } from 'lucide-react'

export default function AdminStoragePage() {
  const [storageStats, setStorageStats] = useState({
    used: 45.2,
    total: 100,
    images: 25.5,
    videos: 15.2,
    documents: 4.5
  })

  const files = [
    { id: 1, name: 'project-banner.jpg', type: 'image', size: '2.5 MB', uploaded: '2024-01-15' },
    { id: 2, name: 'showcase-reel.mp4', type: 'video', size: '125.3 MB', uploaded: '2024-01-14' },
    { id: 3, name: 'portfolio-clip.mp4', type: 'video', size: '45.2 MB', uploaded: '2024-01-13' },
    { id: 4, name: 'team-photo.jpg', type: 'image', size: '1.2 MB', uploaded: '2024-01-12' },
    { id: 5, name: 'contract.pdf', type: 'document', size: '0.5 MB', uploaded: '2024-01-11' },
  ]

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return Image
      case 'video': return Video
      case 'document': return FileText
      default: return FileText
    }
  }

  const getFileColor = (type) => {
    switch (type) {
      case 'image': return 'bg-blue-100 text-blue-600'
      case 'video': return 'bg-purple-100 text-purple-600'
      case 'document': return 'bg-green-100 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image Storage</h1>
          <p className="text-gray-600">Manage file storage and uploads</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800">
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </div>

      {/* Storage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Storage</p>
                <p className="text-2xl font-bold">{storageStats.used} GB</p>
                <p className="text-xs text-gray-500">of {storageStats.total} GB</p>
              </div>
            </div>
            <Progress value={storageStats.used} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Image className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Images</p>
                <p className="text-2xl font-bold">{storageStats.images} GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Videos</p>
                <p className="text-2xl font-bold">{storageStats.videos} GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="text-2xl font-bold">{storageStats.documents} GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {files.map((file) => {
              const Icon = getFileIcon(file.type)
              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getFileColor(file.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-600">{file.size} • {file.uploaded}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{file.type}</Badge>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
