import React, { useState, useEffect } from 'react'
import { Artist, Team, Project, PortfolioClip, Backer } from '@/lib/supabaseEntities'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { HardDrive, Download, Trash2, Search, AlertTriangle, CheckCircle, Clock, Image, FileText, Video, Eye, X } from 'lucide-react'
import DataTable from '@/components/admin/DataTable'

export default function AdminImageStoragePage() {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [previewFile, setPreviewFile] = useState(null)

  useEffect(() => {
    const fetchStorageFiles = async () => {
      try {
        const [artists, teams, projects, clips, backers] = await Promise.all([
          Artist.list('-created_at', 200),
          Team.list('-created_at', 200),
          Project.list('-created_at', 200),
          PortfolioClip.list('-created_at', 200),
          Backer.list('-created_at', 200),
        ])

        const rows = []
        artists.forEach(a => a.profile_photo_url && rows.push({ id: `artist-${a.id}`, name: `${a.full_name || 'artist'}_photo`, type: 'image', uploader: a.email, uploadedAt: a.created_at, url: a.profile_photo_url }))
        teams.forEach(t => t.logo && rows.push({ id: `team-${t.id}`, name: `${t.team_name || 'team'}_logo`, type: 'image', uploader: t.contact_email, uploadedAt: t.created_at, url: t.logo }))
        projects.forEach(p => p.image_url && rows.push({ id: `project-${p.id}`, name: `${p.project_owner_name || 'project'}_image`, type: 'image', uploader: p.project_owner_email, uploadedAt: p.created_at, url: p.image_url }))
        backers.forEach(b => b.logo_url && rows.push({ id: `backer-${b.id}`, name: `${b.organization_name || 'backer'}_logo`, type: 'image', uploader: b.contact_email, uploadedAt: b.created_at, url: b.logo_url }))
        clips.forEach(c => (c.video_url || c.thumbnail_url) && rows.push({ id: `clip-${c.id}`, name: c.title || 'portfolio_clip', type: c.video_url ? 'video' : 'image', uploader: '', uploadedAt: c.created_date, url: c.video_url || c.thumbnail_url }))

        setFiles(rows)
      } catch (err) {

        error('Error', 'Failed to fetch storage data')
      } finally {
        setLoading(false)
      }
    }
    fetchStorageFiles()
  }, [])

  const handleDeleteFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
    success('Removed', 'File removed from this list (source record is unchanged)')
  }

  const handlePreview = (file) => {
    setPreviewFile(file)
  }

  const columns = [
    { key: 'name', label: 'File Name', sortable: true, filterable: true },
    {
      key: 'type', label: 'Type', sortable: true, filterable: true, render: (value) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">{value}</span>
      )
    },
    { key: 'uploadedAt', label: 'Uploaded', sortable: true, filterable: false, render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
    { key: 'uploader', label: 'Owner', sortable: true, filterable: true },
  ]

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || f.type === filterType
    return matchesSearch && matchesType
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.uploadedAt) - new Date(a.uploadedAt)
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
    return 0
  })

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-blue-600" />
      case 'video': return <Video className="w-5 h-5 text-purple-600" />
      default: return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const imageCount = files.filter(f => f.type === 'image').length
  const videoCount = files.filter(f => f.type === 'video').length

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Image Storage</h1>
        <p className="text-gray-600 mt-1">Files uploaded across artist, team, project, and backer profiles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Files</div>
              <div className="text-2xl font-bold text-gray-900">{files.length.toLocaleString()}</div>
            </div>
            <HardDrive className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Images</div>
              <div className="text-2xl font-bold text-gray-900">{imageCount.toLocaleString()}</div>
            </div>
            <Image className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Videos</div>
              <div className="text-2xl font-bold text-gray-900">{videoCount.toLocaleString()}</div>
            </div>
            <Video className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {files.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4" />
          No uploaded files found yet across profiles.
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={filteredFiles}
          columns={columns}
          searchable={true}
          exportable={true}
          pagination={true}
          pageSize={20}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handlePreview(row); }} title="Preview">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); window.open(row.url, '_blank'); }} title="Open">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteFile(row.id); }} title="Remove from list">
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )}
        />
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{previewFile.name}</h2>
              <button onClick={() => setPreviewFile(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-100 min-h-[400px]">
              {previewFile.type === 'image' ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[70vh] object-contain" />
              ) : previewFile.type === 'video' ? (
                <video src={previewFile.url} controls className="max-w-full max-h-[70vh]" />
              ) : (
                <FileText className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setPreviewFile(null)}>Close</Button>
              <Button onClick={() => window.open(previewFile.url, '_blank')} className="bg-black text-white hover:bg-gray-800">Open Original</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}