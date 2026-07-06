import React, { useState, useEffect } from 'react';
import { Artist } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, X, Eye, Ban, CheckCircle, AlertCircle, Search, User, Mail, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

const STATUS_STYLES = {
  active: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200',
  suspended: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-200',
  disabled: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200',
};

const PAGE_SIZE = 10;

export default function AdminArtistsPage() {
  const { success, error: toastError } = useToast();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewingArtist, setViewingArtist] = useState(null);
  const [editingArtist, setEditingArtist] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  const paginatedArtists = filteredArtists.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredArtists.length / PAGE_SIZE);

  const getStatus = (artist) => {
    if (artist.is_suspended) return 'suspended';
    if (artist.is_disabled) return 'disabled';
    return 'active';
  };

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
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Artists Management</h1>
          <p className="text-gray-600">Manage all artists on the platform</p>
        </div>
        <Button onClick={() => openModal()} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-lg">
          <User className="w-4 h-4 mr-2" /> Add Artist
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-white/50 shadow-lg shadow-indigo-100/50 mb-6 p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Datatable */}
      <div className="bg-white rounded-2xl border border-white/50 shadow-lg shadow-indigo-100/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Artist</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedArtists.map((artist) => (
              <tr key={artist.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {artist.profile_photo_url ? (
                      <img src={artist.profile_photo_url} alt={artist.full_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-bold text-indigo-600 ring-2 ring-indigo-100">
                        {artist.full_name?.[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{artist.full_name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{artist.role || 'No role'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    {artist.email || 'No email'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {artist.based_in_city || artist.based_in_country ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      {artist.based_in_city || artist.based_in_country}
                    </div>
                  ) : (
                    <span className="text-gray-400">No location</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 text-xs font-medium rounded-full border shadow-sm ${STATUS_STYLES[getStatus(artist)]}`}>
                    {getStatus(artist).charAt(0).toUpperCase() + getStatus(artist).slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {artist.created_at ? new Date(artist.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button onClick={() => openViewModal(artist)} variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => openModal(artist)} variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => toggleSuspend(artist)} variant="ghost" size="sm" className={artist.is_suspended ? 'text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg' : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg'}>
                      <Ban className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(artist.id)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedArtists.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No artists found</p>
            <Button onClick={() => openModal()} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-lg">
              <User className="w-4 h-4 mr-2" /> Add First Artist
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredArtists.length)} of {filteredArtists.length} artists
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewingArtist && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Artist Details</h2>
              <button onClick={() => setViewingArtist(null)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-600 ring-2 ring-gray-200">
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
                {viewingArtist.based_in_city && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" /> {viewingArtist.based_in_city}</p>
                  </div>
                )}
                {viewingArtist.created_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joined</label>
                    <p className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" /> {new Date(viewingArtist.created_at).toLocaleDateString()}</p>
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
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setViewingArtist(null)} className="rounded-lg">Close</Button>
              <Button onClick={() => { setViewingArtist(null); openModal(viewingArtist); }} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">Edit Artist</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gray-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingArtist ? 'Edit Artist' : 'Add Artist'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-2">Full Name</label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-2">Email</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-2">City</label><Input value={form.based_in_city} onChange={(e) => setForm({ ...form, based_in_city: e.target.value })} className="rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-2">Country</label><Input value={form.based_in_country} onChange={(e) => setForm({ ...form, based_in_country: e.target.value })} className="rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-2">Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-2">Skills</label><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Comma-separated skills" className="rounded-lg" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_suspended} onChange={(e) => setForm({ ...form, is_suspended: e.target.checked })} className="w-4 h-4" /> Suspended</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-lg">Cancel</Button>
              <Button onClick={handleSave} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">{editingArtist ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
