import React, { useState, useEffect } from 'react';
import { Job, AuditLog } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Briefcase, Search, Eye, Trash2, Calendar, MapPin, CheckCircle, XCircle, X, Crown } from 'lucide-react';

const STATUSES = ['open', 'closed', 'filled'];

export default function AdminJobsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const rows = await Job.list('-posted_at');
      setJobs(rows || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      error('Error', 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    try {
      await Job.delete(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      success('Deleted', 'Job deleted successfully');
      AuditLog.create({ actor_email: user?.email, action: 'job.delete', entity_type: 'Job', entity_id: jobId, details: 'Deleted job' }).catch(() => {});
    } catch (err) {
      console.error('Error deleting job:', err);
      error('Failed', 'Failed to delete job');
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await Job.update(jobId, { status: newStatus });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      success('Updated', 'Job status updated successfully');
      AuditLog.create({ actor_email: user?.email, action: 'job.status_update', entity_type: 'Job', entity_id: jobId, details: `Changed status to ${newStatus}` }).catch(() => {});
    } catch (err) {
      console.error('Error updating job status:', err);
      error('Failed', 'Failed to update job status');
    }
  };

  const handleToggleProRequired = async (jobId, currentProRequired) => {
    try {
      await Job.update(jobId, { requires_subscription: !currentProRequired });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, requires_subscription: !currentProRequired } : j));
      success('Updated', `Job ${!currentProRequired ? 'now requires' : 'no longer requires'} Pro subscription`);
      AuditLog.create({ actor_email: user?.email, action: 'job.pro_requirement_update', entity_type: 'Job', entity_id: jobId, details: `Changed pro requirement to ${!currentProRequired}` }).catch(() => {});
    } catch (err) {
      console.error('Error updating pro requirement:', err);
      error('Failed', 'Failed to update pro requirement');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      filled: 'bg-blue-100 text-blue-800',
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
        <p className="text-gray-600 mt-1">View and manage all posted jobs</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="text-sm text-gray-500">Total Jobs: {filteredJobs.length}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pro Required</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredJobs.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No jobs found</td></tr>
              )}
              {filteredJobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{job.short_description}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{job.client_name}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {job.budget_min || job.budget_max ? `$${(job.budget_min || 0).toLocaleString()} - $${(job.budget_max || 0).toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2"><MapPin className="w-3 h-3" />{job.location || 'N/A'}</td>
                  <td className="px-4 py-3">{getStatusBadge(job.status)}</td>
                  <td className="px-4 py-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleProRequired(job.id, job.requires_subscription)} 
                      title={job.requires_subscription ? 'Remove Pro requirement' : 'Require Pro subscription'}
                      className="p-1"
                    >
                      <Crown className={`w-4 h-4 ${job.requires_subscription ? 'text-yellow-600 fill-yellow-600' : 'text-gray-400'}`} />
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedJob(job)} title="View Details" className="p-1">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(job.id, job.status)} title="Toggle Status" className="p-1">
                        {job.status === 'open' ? <XCircle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteJob(job.id)} title="Delete" className="p-1">
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

      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Job Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="font-medium text-gray-500">Title:</span> {selectedJob.title}</div>
              <div><span className="font-medium text-gray-500">Client:</span> {selectedJob.client_name} ({selectedJob.client_email})</div>
              <div><span className="font-medium text-gray-500">Description:</span> {selectedJob.description}</div>
              <div><span className="font-medium text-gray-500">Roles Needed:</span> {selectedJob.roles_needed?.join(', ') || 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Skills:</span> {selectedJob.skills_required?.join(', ') || 'N/A'}</div>
              <div><span className="font-medium text-gray-500">Status:</span> <span className="capitalize">{selectedJob.status}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}