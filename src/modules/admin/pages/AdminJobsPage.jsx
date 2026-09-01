import React, { useState, useEffect } from 'react';
import { Job, AuditLog } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, Search, Eye, Trash2, Calendar, MapPin, CheckCircle, XCircle, X, Crown, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUSES = ['draft', 'pending_approval', 'open', 'closed', 'filled'];

export default function AdminJobsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    job_type: 'director',
    employment_type: 'fulltime',
    location: '',
    budget: '',
    duration: 'short_term',
    status: 'open'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    let newStatus;
    if (currentStatus === 'pending_approval') {
      newStatus = 'open'; // Approve the job
    } else if (currentStatus === 'open') {
      newStatus = 'closed';
    } else {
      newStatus = 'open';
    }
    
    try {
      await Job.update(jobId, { status: newStatus });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      const message = currentStatus === 'pending_approval' ? 'Job approved and is now live' : 'Job status updated successfully';
      success('Updated', message);
      AuditLog.create({ actor_email: user?.email, action: 'job.status_update', entity_type: 'Job', entity_id: jobId, details: `Changed status to ${newStatus}` }).catch(() => {});
    } catch (err) {
      console.error('Error updating job status:', err);
      error('Failed', 'Failed to update job status');
    }
  };

  const handleCreateJob = async () => {
    if (!createForm.title || !createForm.description) {
      error('Validation Error', 'Title and description are required');
      return;
    }
    try {
      const newJob = await Job.create({
        title: createForm.title,
        description: createForm.description,
        job_type: createForm.job_type,
        employment_type: createForm.employment_type,
        location: createForm.location,
        budget: parseFloat(createForm.budget) || 0,
        duration: createForm.duration,
        status: createForm.status,
        client_email: user?.email || 'admin@ericrabar.com',
        client_name: user?.full_name || 'Admin'
      });
      setJobs(prev => [newJob, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        job_type: 'director',
        employment_type: 'fulltime',
        location: '',
        budget: '',
        duration: 'short_term',
        status: 'open'
      });
      success('Created', 'Job created successfully');
      AuditLog.create({ actor_email: user?.email, action: 'job.create', entity_type: 'Job', entity_id: newJob.id, details: 'Created job' }).catch(() => {});
    } catch (err) {
      console.error('Error creating job:', err);
      error('Failed', 'Failed to create job');
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
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      open: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      filled: 'bg-blue-100 text-blue-800',
    };
    return <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status.replace('_', ' ')}</span>;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         job.client_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         job.job_type?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, filterStatus]);

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
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
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
              {paginatedJobs.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No jobs found</td></tr>
              )}
              {paginatedJobs.map(job => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`px-3 ${currentPage === page ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Job</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <Input
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Job title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Job description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  value={createForm.job_type}
                  onChange={(e) => setCreateForm({ ...createForm, job_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="director">Director</option>
                  <option value="cinematographer">Cinematographer</option>
                  <option value="editor">Editor</option>
                  <option value="sound_engineer">Sound Engineer</option>
                  <option value="producer">Producer</option>
                  <option value="actor">Actor</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                <select
                  value={createForm.employment_type}
                  onChange={(e) => setCreateForm({ ...createForm, employment_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="fulltime">Full-time</option>
                  <option value="day_payment">Day Payment</option>
                  <option value="gig">Gig</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <Input
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  placeholder="City or remote"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <Input
                  type="number"
                  value={createForm.budget}
                  onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={createForm.duration}
                  onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="short_term">Short-term</option>
                  <option value="long_term">Long-term</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button onClick={handleCreateJob} className="bg-black text-white hover:bg-gray-800">Create Job</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}