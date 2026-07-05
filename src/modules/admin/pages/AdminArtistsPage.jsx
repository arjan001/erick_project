import React, { useState, useEffect } from 'react';
import { Artist } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, X, Eye, Ban, CheckCircle, AlertCircle, Search, Filter, MoreVertical, User, Mail, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function AdminArtistsPage() {
  const { success, error: toastError } = useToast();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewingArtist, setViewingArtist] = useState(null);
  const [editingArtist, setEditingArtist] = useState(null);
  const [form, setForm] = useState({
    full_name: '', email: '', bio: '', location: '', skills: '', status: 'active', is_suspended: false, is_disabled: false
  });

  const fetchData = async () => {
    try {
      const all = await Artist.list('-created_at', 100);
      setArtists(all || []);
    } catch (err) {
      console.error('Error fetching artists:', err);
      toastError('Load Failed', 'Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && !artist.is_suspended && !artist.is_disabled) ||
                          (statusFilter === 'suspended' && artist.is_suspended) ||
                          (statusFilter === 'disabled' && artist.is_disabled);
    return matchesSearch && matchesStatus;
  });

  const openModal = (artist = null) => {
    if (artist) {
      setEditingArtist(artist);
      setForm({
        full_name: artist.full_name || '',
        email: artist.email || '',
        bio: artist.bio || '',
        location: artist.location || '',
        skills: artist.skills || '',
        status: artist.status || 'active',
        is_suspended: artist.is_suspended || false,
        is_disabled: artist.is_disabled || false
      });
    } else {
      setEditingArtist(null);
      setForm({ full_name: '', email: '', bio: '', location: '', skills: '', status: 'active', is_suspended: false, is_disabled: false });
    }
    setShowModal(true);
  };

  const openViewModal = (artist) => {
    setViewingArtist(artist);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { toastError('Validation', 'Name is required'); return; }
    try {
      if (editingArtist) {
        await Artist.update(editingArtist.id, form);
        success('Updated', 'Artist updated');
      } else {
        await Artist.create(form);
        success('Created', 'Artist created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving artist:', err);
      toastError('Save Failed', `Failed to save artist: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this artist? This action cannot be undone.')) return;
    try {
      await Artist.delete(id);
      success('Deleted', 'Artist deleted');
      fetchData();
    } catch (err) {
      toastError('Delete Failed', 'Failed to delete artist');
    }
  };

  const toggleSuspend = async (artist) => {
    try {
      await Artist.update(artist.id, { is_suspended: !artist.is_suspended });
      success(!artist.is_suspended ? 'Suspended' : 'Unsuspended', `Artist ${!artist.is_suspended ? 'suspended' : 'unsuspended'}`);
      fetchData();
    } catch (err) {
      toastError('Failed', 'Failed to update suspension status');
    }
  };

  const toggleDisable = async (artist) => {
    try {
      await Artist.update(artist.id, { is_disabled: !artist.is_disabled });
      success(!artist.is_disabled ? 'Disabled' : 'Enabled', `Artist ${!artist.is_disabled ? 'disabled' : 'enabled'}`);
      fetchData();
    } catch (err) {
      toastError('Failed', 'Failed to update disabled status');
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Artists Management</h1>
          <p className="text-gray-600">Manage all artists on the platform</p>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
          <User className="w-4 h-4 mr-2" /> Add Artist
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArtists.map((artist) => (
          <Card key={artist.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">
                    {artist.full_name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{artist.full_name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500">{artist.email || 'No email'}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {artist.is_suspended && <Ban className="w-4 h-4 text-orange-500" title="Suspended" />}
                  {artist.is_disabled && <AlertCircle className="w-4 h-4 text-red-500" title="Disabled" />}
                  {!artist.is_suspended && !artist.is_disabled && <CheckCircle className="w-4 h-4 text-green-500" title="Active" />}
                </div>
              </div>

              {artist.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{artist.location}</span>
                </div>
              )}

              {artist.skills && (
                <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                  <span className="font-medium">Skills:</span> {artist.skills}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={() => openViewModal(artist)} variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
                <Button onClick={() => openModal(artist)} variant="outline" size="sm" className="flex-1">
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button onClick={() => toggleSuspend(artist)} variant="outline" size="sm" className={artist.is_suspended ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}>
                  <Ban className="w-4 h-4" />
                </Button>
                <Button onClick={() => toggleDisable(artist)} variant="outline" size="sm" className={artist.is_disabled ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}>
                  <AlertCircle className="w-4 h-4" />
                </Button>
                <Button onClick={() => handleDelete(artist.id)} variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArtists.length === 0 && (
        <Card><CardContent className="p-12 text-center text-gray-500">
          <p className="mb-4">No artists found</p>
          <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
            <User className="w-4 h-4 mr-2" /> Add First Artist
          </Button>
        </CardContent></Card>
      )}

      {/* View Modal */}
      {viewingArtist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Artist Details</h2>
              <button onClick={() => setViewingArtist(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                  {viewingArtist.full_name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingArtist.full_name || 'Unknown'}</h3>
                  <p className="text-gray-600">{viewingArtist.email || 'No email'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="font-medium">{viewingArtist.is_suspended ? 'Suspended' : viewingArtist.is_disabled ? 'Disabled' : 'Active'}</p>
                </div>
                {viewingArtist.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4" /> {viewingArtist.location}</p>
                  </div>
                )}
                {viewingArtist.created_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joined</label>
                    <p className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(viewingArtist.created_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {viewingArtist.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="mt-1 text-gray-700">{viewingArtist.bio}</p>
                </div>
              )}

              {viewingArtist.skills && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Skills</label>
                  <p className="mt-1 text-gray-700">{viewingArtist.skills}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setViewingArtist(null)}>Close</Button>
              <Button onClick={() => { setViewingArtist(null); openModal(viewingArtist); }} className="bg-black text-white hover:bg-gray-800">Edit Artist</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingArtist ? 'Edit Artist' : 'Add Artist'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-2">Full Name</label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Email</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Location</label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-2">Skills</label><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Comma-separated skills" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_suspended} onChange={(e) => setForm({ ...form, is_suspended: e.target.checked })} className="w-4 h-4" /> Suspended</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_disabled} onChange={(e) => setForm({ ...form, is_disabled: e.target.checked })} className="w-4 h-4" /> Disabled</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">{editingArtist ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
