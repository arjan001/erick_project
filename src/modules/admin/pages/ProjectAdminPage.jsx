import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin.api';
import { Search, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';

const PAGE_SIZE = 10;

function ProjectModal({ project, onClose, onApprove, onReject }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{project.project_owner_company || project.project_owner_name}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><span className="text-xs text-gray-400 uppercase">Type</span><p className="font-medium text-gray-800 capitalize">{project.project_type?.replace(/_/g, ' ')}</p></div>
            <div><span className="text-xs text-gray-400 uppercase">Status</span>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${project.status === 'verified' ? 'bg-green-100 text-green-700' : project.status === 'submitted' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{project.status}</span>
            </div>
            <div><span className="text-xs text-gray-400 uppercase">Owner Email</span><p className="font-medium text-gray-800 break-all">{project.project_owner_email}</p></div>
            <div><span className="text-xs text-gray-400 uppercase">Budget</span><p className="font-medium text-gray-800">{project.budget_range?.replace(/_/g, ' ') || '—'}</p></div>
            {project.location_city && <div><span className="text-xs text-gray-400 uppercase">Location</span><p className="font-medium text-gray-800">{project.location_city}, {project.location_country}</p></div>}
            {project.open_to_backing && <div className="col-span-2"><span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Open to Backing</span></div>}
          </div>
          {project.notes && <div><span className="text-xs text-gray-400 uppercase">Notes</span><p className="text-gray-700 mt-1">{project.notes}</p></div>}
        </div>
        {project.status === 'submitted' && (
          <div className="flex gap-2 p-5 border-t border-gray-100">
            <button onClick={() => onApprove(project.id)}
              className="flex-1 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button onClick={() => onReject(project.id)}
              className="flex-1 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectAdminPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    adminApi.projects.list().then(setProjects).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.project_owner_name?.toLowerCase().includes(search.toLowerCase()) || p.project_owner_email?.toLowerCase().includes(search.toLowerCase()) || p.project_type?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleApprove = async (id) => {
    await adminApi.projects.approve(id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'verified' } : p));
    setSelected(null);
  };

  const handleReject = async (id) => {
    await adminApi.projects.reject(id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    setSelected(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Projects</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and manage project submissions</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black bg-white" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black bg-white min-w-[130px]">
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="in_progress">In Progress</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(60,72,100,0.06)' }}>
        {loading ? (
          <div className="py-16 flex justify-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Budget</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Submitted</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No projects found</td></tr>
                  ) : paginated.map(project => (
                    <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{project.project_owner_company || project.project_owner_name}</div>
                        <div className="text-xs text-gray-400">{project.project_owner_email}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell capitalize">{project.project_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{project.budget_range?.replace(/_/g, ' ') || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${project.status === 'verified' ? 'bg-green-100 text-green-700' : project.status === 'submitted' ? 'bg-amber-100 text-amber-700' : project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                        {project.created_date ? new Date(project.created_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(project)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">{filtered.length} total · page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} onApprove={handleApprove} onReject={handleReject} />}
    </div>
  );
}