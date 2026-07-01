import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { HardDrive, Download, Trash2, Search, AlertTriangle, CheckCircle, Clock, Image, FileText, Video } from 'lucide-react';

export default function AdminImageStoragePage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchStorageFiles = async () => {
      try {
        const [artists, teams, projects, clips, backers] = await Promise.all([
          base44.entities.Artist.list('-created_date', 200),
          base44.entities.Team.list('-created_date', 200),
          base44.entities.Project.list('-created_date', 200),
          base44.entities.PortfolioClip.list('-created_date', 200),
          base44.entities.Backer.list('-created_date', 200),
        ]);

        const rows = [];
        artists.forEach(a => a.profile_photo_url && rows.push({ id: `artist-${a.id}`, name: `${a.full_name || 'artist'}_photo`, type: 'image', uploader: a.email, uploadedAt: a.created_date, url: a.profile_photo_url }));
        teams.forEach(t => t.team_logo_url && rows.push({ id: `team-${t.id}`, name: `${t.team_name || 'team'}_logo`, type: 'image', uploader: t.contact_email, uploadedAt: t.created_date, url: t.team_logo_url }));
        projects.forEach(p => p.image_url && rows.push({ id: `project-${p.id}`, name: `${p.project_owner_name || 'project'}_image`, type: 'image', uploader: p.project_owner_email, uploadedAt: p.created_date, url: p.image_url }));
        backers.forEach(b => b.logo_url && rows.push({ id: `backer-${b.id}`, name: `${b.organization_name || 'backer'}_logo`, type: 'image', uploader: b.contact_email, uploadedAt: b.created_date, url: b.logo_url }));
        clips.forEach(c => (c.video_url || c.thumbnail_url) && rows.push({ id: `clip-${c.id}`, name: c.title || 'portfolio_clip', type: c.video_url ? 'video' : 'image', uploader: '', uploadedAt: c.created_date, url: c.video_url || c.thumbnail_url }));

        setFiles(rows);
      } catch (err) {
        console.error('Error fetching storage data:', err);
        error('Error', 'Failed to fetch storage data');
      } finally {
        setLoading(false);
      }
    };
    fetchStorageFiles();
  }, []);

  const handleDeleteFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    success('Removed', 'File removed from this list (source record is unchanged)');
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || f.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-blue-600" />;
      case 'video': return <Video className="w-5 h-5 text-purple-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const imageCount = files.filter(f => f.type === 'image').length;
  const videoCount = files.filter(f => f.type === 'video').length;

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
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
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredFiles.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">No files found</td></tr>
              )}
              {filteredFiles.map(file => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getFileIcon(file.type)}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{file.name}</div>
                        <a href={file.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-xs block">{file.url}</a>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">{file.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{file.uploader || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" title="Open" onClick={() => window.open(file.url, '_blank')}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file.id)} title="Remove from list">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}