import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { HardDrive, Upload, Download, Trash2, Search, Filter, AlertTriangle, CheckCircle, Clock, Image, FileText, Video } from 'lucide-react';

export default function AdminImageStoragePage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storageData, setStorageData] = useState({
    totalStorage: 0,
    usedStorage: 0,
    availableStorage: 0,
    totalFiles: 0,
    imageCount: 0,
    videoCount: 0,
    documentCount: 0,
    otherCount: 0
  });
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'artist_admin') {
      window.location.href = '/';
      return;
    }
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchStorageData = async () => {
      try {
        // In a real app, fetch from storage API
        // For now, use mock data
        const mockStorageData = {
          totalStorage: 100 * 1024 * 1024 * 1024, // 100 GB
          usedStorage: 45.2 * 1024 * 1024 * 1024, // 45.2 GB
          availableStorage: 54.8 * 1024 * 1024 * 1024, // 54.8 GB
          totalFiles: 12453,
          imageCount: 8934,
          videoCount: 2156,
          documentCount: 1203,
          otherCount: 160
        };

        const mockFiles = [
          { id: 1, name: 'portfolio_banner.jpg', type: 'image', size: 2456789, uploadedAt: '2026-06-28T10:30:00', uploader: 'john@example.com', url: 'https://example.com/banner.jpg' },
          { id: 2, name: 'showreel_2026.mp4', type: 'video', size: 156789234, uploadedAt: '2026-06-27T15:45:00', uploader: 'jane@example.com', url: 'https://example.com/showreel.mp4' },
          { id: 3, name: 'project_contract.pdf', type: 'document', size: 456789, uploadedAt: '2026-06-26T09:15:00', uploader: 'mike@example.com', url: 'https://example.com/contract.pdf' },
          { id: 4, name: 'profile_pic.jpg', type: 'image', size: 567890, uploadedAt: '2026-06-25T14:20:00', uploader: 'sarah@example.com', url: 'https://example.com/profile.jpg' },
          { id: 5, name: 'behind_scenes.mov', type: 'video', size: 234567890, uploadedAt: '2026-06-24T11:00:00', uploader: 'tom@example.com', url: 'https://example.com/bts.mov' },
          { id: 6, name: 'resume.pdf', type: 'document', size: 234567, uploadedAt: '2026-06-23T16:30:00', uploader: 'lisa@example.com', url: 'https://example.com/resume.pdf' },
          { id: 7, name: 'headshot.jpg', type: 'image', size: 890123, uploadedAt: '2026-06-22T08:45:00', uploader: 'dave@example.com', url: 'https://example.com/headshot.jpg' },
          { id: 8, name: 'demo_reel.mp4', type: 'video', size: 98765432, uploadedAt: '2026-06-21T13:15:00', uploader: 'emma@example.com', url: 'https://example.com/demo.mp4' }
        ];

        setStorageData(mockStorageData);
        setFiles(mockFiles);
      } catch (err) {
        console.error('Error fetching storage data:', err);
        error('Error', 'Failed to fetch storage data');
      } finally {
        setLoading(false);
      }
    };

    fetchStorageData();
  }, [user]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDeleteFile = async (fileId) => {
    try {
      setFiles(files.filter(f => f.id !== fileId));
      success('Deleted', 'File deleted successfully');
    } catch (err) {
      console.error('Error deleting file:', err);
      error('Failed', 'Failed to delete file');
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || f.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    if (sortBy === 'size') return b.size - a.size;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5 text-blue-600" />;
      case 'video': return <Video className="w-5 h-5 text-purple-600" />;
      case 'document': return <FileText className="w-5 h-5 text-green-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const storagePercentage = (storageData.usedStorage / storageData.totalStorage) * 100;

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <AdminSidebar />
      <main className="fixed inset-0 flex flex-col bg-white pl-20">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Image Storage</h1>
          <p className="text-gray-600 mt-1">Monitor and manage file storage</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Storage Overview */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Storage</div>
                  <div className="text-2xl font-bold text-gray-900">{formatBytes(storageData.totalStorage)}</div>
                </div>
                <HardDrive className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Used Storage</div>
                  <div className="text-2xl font-bold text-gray-900">{formatBytes(storageData.usedStorage)}</div>
                </div>
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Available</div>
                  <div className="text-2xl font-bold text-gray-900">{formatBytes(storageData.availableStorage)}</div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Files</div>
                  <div className="text-2xl font-bold text-gray-900">{storageData.totalFiles.toLocaleString()}</div>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Storage Breakdown */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Images</div>
                  <div className="font-semibold">{storageData.imageCount.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Videos</div>
                  <div className="font-semibold">{storageData.videoCount.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Documents</div>
                  <div className="font-semibold">{storageData.documentCount.toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Other</div>
                  <div className="font-semibold">{storageData.otherCount.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Usage Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Storage Usage</span>
              <span className="text-sm text-gray-500">{storagePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  storagePercentage > 80 ? 'bg-red-500' : storagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${storagePercentage}%` }}
              />
            </div>
            {storagePercentage > 80 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Storage is running low. Consider cleaning up old files.</span>
              </div>
            )}
          </div>

          {/* Files List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                    <option value="document">Documents</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="size">Sort by Size</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
                <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" />
                  Export List
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploader</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFiles.map(file => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getFileIcon(file.type)}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{file.url}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 capitalize">
                          {file.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatBytes(file.size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {file.uploader}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="Download">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file.id)} title="Delete">
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
      </main>
    </div>
  );
}
