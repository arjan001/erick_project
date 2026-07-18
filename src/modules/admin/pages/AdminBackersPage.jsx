import React, { useState, useEffect } from 'react';
import { Backer } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, X, Eye, Ban, CheckCircle, AlertCircle, Search, User, Mail, Calendar, MapPin, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 border-green-200',
  suspended: 'bg-orange-100 text-orange-700 border-orange-200',
  disabled: 'bg-red-100 text-red-700 border-red-200',
};

const PAGE_SIZE = 10;

export default function AdminBackersPage() {
  const { success, error: toastError } = useToast();
  const [backers, setBackers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewingBacker, setViewingBacker] = useState(null);
  const [editingBacker, setEditingBacker] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    full_name: '', email: '', bio: '', location: '', investment_focus: '', status: 'active', is_suspended: false, is_disabled: false
  });

  const fetchData = async () => {
    try {
      const all = await Backer.list('-created_at', 100);
      setBackers(all || []);
    } catch (err) {
      console.error('Error fetching backers:', err);
      toastError('Load Failed', 'Failed to load backers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredBackers = backers.filter(backer => {
    const matchesSearch = backer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         backer.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && !backer.is_suspended && !backer.is_disabled) ||
                          (statusFilter === 'suspended' && backer.is_suspended) ||
                          (statusFilter === 'disabled' && backer.is_disabled);
    return matchesSearch && matchesStatus;
  });

  const paginatedBackers = filteredBackers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredBackers.length / PAGE_SIZE);

  const getStatus = (backer) => {
    if (backer.is_suspended) return 'suspended';
    if (backer.is_disabled) return 'disabled';
    return 'active';
  };

  const openModal = (backer = null) => {
    if (backer) {
      setEditingBacker(backer);
      setForm({
        full_name: backer.full_name || '',
        email: backer.email || '',
        bio: backer.bio || '',
        location: backer.location || '',
        investment_focus: backer.investment_focus || '',
        status: backer.status || 'active',
        is_suspended: backer.is_suspended || false,
        is_disabled: backer.is_disabled || false
      });
    } else {
      setEditingBacker(null);
      setForm({ full_name: '', email: '', bio: '', location: '', investment_focus: '', status: 'active', is_suspended: false, is_disabled: false });
    }
    setShowModal(true);
  };

  const openViewModal = (backer) => {
    setViewingBacker(backer);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) { toastError('Validation', 'Name is required'); return; }
    try {
      if (editingBacker) {
        await Backer.update(editingBacker.id, form);
        success('Updated', 'Backer updated');
      } else {
        await Backer.create(form);
        success('Created', 'Backer created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving backer:', err);
      toastError('Save Failed', `Failed to save backer: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this backer? This action cannot be undone.')) return;
    try {
      await Backer.delete(id);
      success('Deleted', 'Backer deleted');
      fetchData();
    } catch (err) {
      toastError('Delete Failed', 'Failed to delete backer');
    }
  };

  const toggleSuspend = async (backer) => {
    try {
      await Backer.update(backer.id, { is_suspended: !backer.is_suspended });
      success(!backer.is_suspended ? 'Suspended' : 'Unsuspended', `Backer ${!backer.is_suspended ? 'suspended' : 'unsuspended'}`);
      fetchData();
    } catch (err) {
      toastError('Failed', 'Failed to update suspension status');
    }
  };

  const toggleDisable = async (backer) => {
    try {
      await Backer.update(backer.id, { is_disabled: !backer.is_disabled });
      success(!backer.is_disabled ? 'Disabled' : 'Enabled', `Backer ${!backer.is_disabled ? 'disabled' : 'enabled'}`);
      fetchData();
    } catch (err) {
      toastError('Failed', 'Failed to update disabled status');
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" /></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backers Management</h1>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
          <User className="w-4 h-4 mr-2" /> Add Backer
        </Button>
      </div>

      {/* Datatable */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search backers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-lg border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="disabled">Disabled</option>
          </select>
          <div className="text-sm text-gray-500 whitespace-nowrap">{filteredBackers.length} backers</div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Backer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Investment Focus</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedBackers.map((backer) => (
              <tr key={backer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {backer.profile_image ? (
                      <img src={backer.profile_image} alt={backer.full_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {backer.full_name?.[0]?.toUpperCase() || 'B'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{backer.full_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{backer.role || 'Backer'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-gray-400" />
                    {backer.email || 'No email'}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {backer.investment_focus ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-gray-400" />
                      {backer.investment_focus}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">No focus</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${STATUS_STYLES[getStatus(backer)]}`}>
                    {getStatus(backer).charAt(0).toUpperCase() + getStatus(backer).slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {backer.created_at ? new Date(backer.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button onClick={() => openViewModal(backer)} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-1">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => openModal(backer)} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 p-1">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => toggleSuspend(backer)} variant="ghost" size="sm" className={`${backer.is_suspended ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'} p-1`}>
                      <Ban className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => toggleDisable(backer)} variant="ghost" size="sm" className={`${backer.is_disabled ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'} p-1`}>
                      <AlertCircle className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(backer.id)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedBackers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-4">No backers found</p>
            <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
              <User className="w-4 h-4 mr-2" /> Add First Backer
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, filteredBackers.length)} of {filteredBackers.length}
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                >
                  {page}
                </Button>
              ))}
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewingBacker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Backer Details</h2>
              <button onClick={() => setViewingBacker(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                {viewingBacker.profile_image ? (
                  <img src={viewingBacker.profile_image} alt={viewingBacker.full_name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
                    {viewingBacker.full_name?.[0]?.toUpperCase() || 'B'}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingBacker.full_name || 'Unknown'}</h3>
                  <p className="text-gray-600">{viewingBacker.email || 'No email'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="font-medium">{viewingBacker.is_suspended ? 'Suspended' : viewingBacker.is_disabled ? 'Disabled' : 'Active'}</p>
                </div>
                {viewingBacker.investment_focus && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Investment Focus</label>
                    <p className="font-medium flex items-center gap-2"><DollarSign className="w-4 h-4" /> {viewingBacker.investment_focus}</p>
                  </div>
                )}
                {viewingBacker.created_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joined</label>
                    <p className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(viewingBacker.created_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {viewingBacker.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <p className="mt-1 text-gray-700">{viewingBacker.bio}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setViewingBacker(null)}>Close</Button>
              <Button onClick={() => { setViewingBacker(null); openModal(viewingBacker); }} className="bg-black text-white hover:bg-gray-800">Edit Backer</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingBacker ? 'Edit Backer' : 'Add Backer'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-2">Full Name</label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Email</label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Investment Focus</label><Input value={form.investment_focus} onChange={(e) => setForm({ ...form, investment_focus: e.target.value })} placeholder="e.g., Film, Tech, Startups" /></div>
              <div><label className="block text-sm font-medium mb-2">Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_suspended} onChange={(e) => setForm({ ...form, is_suspended: e.target.checked })} className="w-4 h-4" /> Suspended</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_disabled} onChange={(e) => setForm({ ...form, is_disabled: e.target.checked })} className="w-4 h-4" /> Disabled</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">{editingBacker ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
