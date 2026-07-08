import React, { useState, useEffect } from 'react';
import { WorkApproval } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Check, X, Eye, Shuffle, Edit2, Trash2, FileText, User, Plus } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function AdminWorkApprovalPage() {
  const { success, error: toastError } = useToast();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    submitter_type: 'artist', submitter_id: '', title: '', description: '',
    images: [], video_url: '', category: '', tags: [], randomize: false, display_order: 0
  });

  const fetchData = async () => {
    try {
      const all = await WorkApproval.list('created_at', 100);
      setApprovals(all || []);
    } catch (err) {
      console.error('Error fetching work approvals:', err);
      toastError('Load Failed', 'Failed to load work approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (approval = null) => {
    if (approval) {
      setEditing(approval);
      setForm({
        submitter_type: approval.submitter_type || 'artist',
        submitter_id: approval.submitter_id || '',
        title: approval.title || '', description: approval.description || '',
        images: approval.images || [], video_url: approval.video_url || '',
        category: approval.category || '', tags: approval.tags || [],
        randomize: approval.randomize || false, display_order: approval.display_order || 0
      });
    } else {
      setEditing(null);
      setForm({ submitter_type: 'artist', submitter_id: '', title: '', description: '', images: [], video_url: '', category: '', tags: [], randomize: false, display_order: 0 });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toastError('Validation', 'Title is required'); return; }
    try {
      if (editing) {
        await WorkApproval.update(editing.id, form);
        success('Updated', 'Work approval updated');
      } else {
        await WorkApproval.create({ ...form, status: 'pending' });
        success('Created', 'Work approval created');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Error saving work approval:', err);
      toastError('Save Failed', 'Failed to save work approval');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this work approval?')) return;
    try {
      await WorkApproval.delete(id);
      success('Deleted', 'Work approval deleted');
      fetchData();
    } catch (err) {
      toastError('Delete Failed', 'Failed to delete work approval');
    }
  };

  const approveWork = async (approval) => {
    try {
      await WorkApproval.update(approval.id, {
        status: 'approved',
        approved_at: new Date().toISOString()
      });
      success('Approved', 'Work has been approved');
      fetchData();
    } catch (err) {
      toastError('Failed', 'Failed to approve work');
    }
  };

  const rejectWork = async (approval) => {
    const reason = prompt('Rejection reason (optional):');
    try {
      await WorkApproval.update(approval.id, {
        status: 'rejected',
        rejection_reason: reason || ''
      });
      success('Rejected', 'Work has been rejected');
      fetchData();
    } catch (err) {
      toastError('Failed', 'Failed to reject work');
    }
  };

  const toggleRandomize = async (approval) => {
    try {
      await WorkApproval.update(approval.id, { randomize: !approval.randomize });
      fetchData();
    } catch (err) { toastError('Failed', 'Failed to update randomize'); }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" /></div>;
  }

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const approvedApprovals = approvals.filter(a => a.status === 'approved');
  const rejectedApprovals = approvals.filter(a => a.status === 'rejected');

  const ApprovalCard = ({ approval }) => (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-100 relative">
        {approval.images?.[0] ? (
          <img src={approval.images[0]} alt={approval.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FileText className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            approval.submitter_type === 'artist' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
          }`}>
            <User className="w-3 h-3 inline mr-1" />{approval.submitter_type}
          </span>
          {approval.randomize && <span className="px-2 py-1 rounded text-xs font-medium bg-amber-400 text-white"><Shuffle className="w-3 h-3 inline mr-1" />Random</span>}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-gray-900">{approval.title}</h3>
          <div className="flex gap-1">
            <button onClick={() => toggleRandomize(approval)} className={`p-1 rounded ${approval.randomize ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-600'}`}><Shuffle className="w-3.5 h-3.5" /></button>
            <button onClick={() => openModal(approval)} className="p-1 hover:bg-gray-100 rounded text-gray-600"><Edit2 className="w-3.5 h-3.5" /></button>
            <button onClick={() => handleDelete(approval.id)} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
        {approval.category && <p className="text-xs text-gray-500 mb-1">{approval.category}</p>}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{approval.description}</p>
        {approval.status === 'pending' && (
          <div className="flex gap-2">
            <Button onClick={() => approveWork(approval)} size="sm" className="bg-green-600 hover:bg-green-700">
              <Check className="w-3 h-3 mr-1" /> Approve
            </Button>
            <Button onClick={() => rejectWork(approval)} size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
              <X className="w-3 h-3 mr-1" /> Reject
            </Button>
          </div>
        )}
        {approval.status === 'rejected' && approval.rejection_reason && (
          <p className="text-xs text-red-600 mt-2">Reason: {approval.rejection_reason}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Approvals</h1>
          <p className="text-gray-600">Approve artist and client work for display on the platform</p>
        </div>
        <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" /> Add Work Submission
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingApprovals.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedApprovals.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedApprovals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingApprovals.map(approval => <ApprovalCard key={approval.id} approval={approval} />)}
          </div>
          {pendingApprovals.length === 0 && <Card><CardContent className="p-12 text-center text-gray-500">No pending approvals</CardContent></Card>}
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedApprovals.map(approval => <ApprovalCard key={approval.id} approval={approval} />)}
          </div>
          {approvedApprovals.length === 0 && <Card><CardContent className="p-12 text-center text-gray-500">No approved works</CardContent></Card>}
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rejectedApprovals.map(approval => <ApprovalCard key={approval.id} approval={approval} />)}
          </div>
          {rejectedApprovals.length === 0 && <Card><CardContent className="p-12 text-center text-gray-500">No rejected works</CardContent></Card>}
        </TabsContent>
      </Tabs>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Work Submission' : 'Add Work Submission'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Submitter Type</label>
                  <select value={form.submitter_type} onChange={(e) => setForm({ ...form, submitter_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="artist">Artist</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium mb-2">Submitter ID</label><Input value={form.submitter_id} onChange={(e) => setForm({ ...form, submitter_id: e.target.value })} placeholder="User ID" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-2">Title</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Work title" /></div>
              <div><label className="block text-sm font-medium mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Work description" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
              <div><label className="block text-sm font-medium mb-2">Images (comma-separated URLs)</label><Input value={form.images.join(',')} onChange={(e) => setForm({ ...form, images: e.target.value.split(',').filter(Boolean) })} placeholder="https://..." /></div>
              <div><label className="block text-sm font-medium mb-2">Video URL</label><Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Category</label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Film, Commercial" /></div>
                <div><label className="block text-sm font-medium mb-2">Tags (comma-separated)</label><Input value={form.tags.join(',')} onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').filter(Boolean) })} placeholder="tag1, tag2" /></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={form.randomize} onChange={(e) => setForm({ ...form, randomize: e.target.checked })} className="w-4 h-4" />
                  <label className="text-sm">Randomize display order</label>
                </div>
                <div><label className="block text-sm font-medium mb-2">Display Order</label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="w-20" /></div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">{editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}