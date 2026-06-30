import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Briefcase, Search, Filter, Eye, Edit, Trash2, Calendar, DollarSign, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function AdminJobsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

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

    const fetchJobs = async () => {
      try {
        const mockJobs = [
          { id: 1, title: 'Video Editor for Documentary', company: 'Film Productions Inc', type: 'contract', budget: 5000, location: 'Remote', status: 'active', postedDate: '2026-06-28', applicants: 15, description: 'Looking for experienced video editor for documentary project.' },
          { id: 2, title: 'Cinematographer for Music Video', company: 'Music Records', type: 'freelance', budget: 2500, location: 'Los Angeles', status: 'active', postedDate: '2026-06-27', applicants: 8, description: 'Need cinematographer for upcoming music video shoot.' },
          { id: 3, title: 'Motion Graphics Designer', company: 'Creative Agency', type: 'full-time', budget: 65000, location: 'New York', status: 'closed', postedDate: '2026-06-25', applicants: 32, description: 'Full-time motion graphics designer position available.' },
          { id: 4, title: 'VFX Artist for Feature Film', company: 'Studio Productions', type: 'contract', budget: 12000, location: 'Vancouver', status: 'pending', postedDate: '2026-06-24', applicants: 5, description: 'VFX artist needed for feature film post-production.' },
          { id: 5, title: 'Colorist for Commercial', company: 'Ad Agency', type: 'freelance', budget: 1500, location: 'Remote', status: 'active', postedDate: '2026-06-23', applicants: 12, description: 'Color grading for 30-second commercial spot.' },
          { id: 6, title: 'Sound Designer for Game', company: 'Game Studio', type: 'contract', budget: 8000, location: 'Remote', status: 'active', postedDate: '2026-06-22', applicants: 20, description: 'Sound design for indie game project.' }
        ];
        setJobs(mockJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        error('Error', 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleDeleteJob = async (jobId) => {
    try {
      setJobs(jobs.filter(j => j.id !== jobId));
      success('Deleted', 'Job deleted successfully');
    } catch (err) {
      console.error('Error deleting job:', err);
      error('Failed', 'Failed to delete job');
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      success('Updated', 'Job status updated successfully');
    } catch (err) {
      console.error('Error updating job status:', err);
      error('Failed', 'Failed to update job status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
      case 'closed':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Closed</span>;
      case 'pending':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesType = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600 mt-1">View and manage all posted jobs</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                Total Jobs: {filteredJobs.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicants</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{job.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{job.company}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                          {job.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${job.budget.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {job.applicants}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(job.postedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(job.id, job.status)} title="Toggle Status">
                            {job.status === 'active' ? <XCircle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-green-600" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteJob(job.id)} title="Delete">
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
