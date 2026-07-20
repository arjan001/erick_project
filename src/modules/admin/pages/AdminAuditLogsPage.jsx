import React, { useState, useEffect } from 'react';
import { AuditLog } from '@/lib/supabaseEntities';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Download, Filter, X, Eye, ChevronLeft, ChevronRight, Calendar, User, Shield, Settings, FileText, Database, Activity, LogOut, LogIn, UserPlus, Trash2, Edit, Plus, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const PAGE_SIZE = 20;

const ACTION_ICONS = {
  'login': LogIn,
  'logout': LogOut,
  'register': UserPlus,
  'create': Plus,
  'update': Edit,
  'delete': Trash2,
  'view': Eye,
  'export': Download,
  'import': Database,
  'settings': Settings,
  'user': User,
  'role': Shield,
  'job': FileText,
  'project': FileText,
  'client': User,
  'default': Activity
};

const ACTION_COLORS = {
  'login': 'bg-blue-100 text-blue-700',
  'logout': 'bg-gray-100 text-gray-700',
  'register': 'bg-green-100 text-green-700',
  'create': 'bg-emerald-100 text-emerald-700',
  'update': 'bg-amber-100 text-amber-700',
  'delete': 'bg-red-100 text-red-700',
  'view': 'bg-purple-100 text-purple-700',
  'export': 'bg-cyan-100 text-cyan-700',
  'import': 'bg-indigo-100 text-indigo-700',
  'settings': 'bg-slate-100 text-slate-700',
  'default': 'bg-gray-100 text-gray-700'
};

const MODULE_COLORS = {
  'auth': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'users': 'bg-blue-50 text-blue-700 border-blue-200',
  'roles': 'bg-purple-50 text-purple-700 border-purple-200',
  'artists': 'bg-pink-50 text-pink-700 border-pink-200',
  'teams': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'projects': 'bg-amber-50 text-amber-700 border-amber-200',
  'jobs': 'bg-orange-50 text-orange-700 border-orange-200',
  'featured': 'bg-rose-50 text-rose-700 border-rose-200',
  'settings': 'bg-slate-50 text-slate-700 border-slate-200',
  'system': 'bg-gray-50 text-gray-700 border-gray-200',
  'default': 'bg-gray-50 text-gray-700 border-gray-200'
};

export default function AdminAuditLogsPage() {
  const { success, error } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [viewLog, setViewLog] = useState(null);
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const rows = await AuditLog.list('-created_at', 500);
      setLogs(rows || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      error('Error', 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase() || '';
    for (const [key, icon] of Object.entries(ACTION_ICONS)) {
      if (actionLower.includes(key)) return icon;
    }
    return ACTION_ICONS.default;
  };

  const getActionColor = (action) => {
    const actionLower = action?.toLowerCase() || '';
    for (const [key, color] of Object.entries(ACTION_COLORS)) {
      if (actionLower.includes(key)) return color;
    }
    return ACTION_COLORS.default;
  };

  const getModuleColor = (module) => {
    return MODULE_COLORS[module?.toLowerCase()] || MODULE_COLORS.default;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.actor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action?.toLowerCase().includes(filterAction);
    const matchesModule = filterModule === 'all' || log.module?.toLowerCase() === filterModule;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const logDate = new Date(log.created_at);
      const today = new Date();
      if (filterDate === 'today') {
        matchesDate = logDate.toDateString() === today.toDateString();
      } else if (filterDate === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = logDate >= weekAgo;
      } else if (filterDate === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = logDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesAction && matchesModule && matchesDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Actor', 'Action', 'Module', 'Entity Type', 'Entity ID', 'Details', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.created_at || '',
        log.actor_email || 'system',
        log.action || '',
        log.module || '',
        log.entity_type || '',
        log.entity_id || '',
        `"${(log.details || '').replace(/"/g, '""')}"`,
        log.ip_address || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    success('Export Successful', 'Audit logs exported to CSV');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-gray-600 mt-1">Track all system activities and user actions</p>
          </div>
          <Button onClick={handleExport} className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Logs</p>
                <p className="text-xl font-bold text-gray-900">{logs.length}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Today</p>
                <p className="text-xl font-bold text-green-600">{logs.filter(l => {
                  const today = new Date().toDateString();
                  return new Date(l.created_at).toDateString() === today;
                }).length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">This Week</p>
                <p className="text-xl font-bold text-blue-600">{logs.filter(l => {
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return new Date(l.created_at) >= weekAgo;
                }).length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Unique Users</p>
                <p className="text-xl font-bold text-purple-600">{new Set(logs.map(l => l.actor_email)).size}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              placeholder="Search logs by action, user, or details..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="register">Register</option>
          </select>
          <select
            value={filterModule}
            onChange={(e) => { setFilterModule(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
          >
            <option value="all">All Modules</option>
            <option value="auth">Auth</option>
            <option value="users">Users</option>
            <option value="roles">Roles</option>
            <option value="artists">Artists</option>
            <option value="teams">Teams</option>
            <option value="projects">Projects</option>
            <option value="jobs">Jobs</option>
            <option value="featured">Featured</option>
            <option value="settings">Settings</option>
          </select>
          <select
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLogs.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No audit log entries found</td></tr>
              )}
              {paginatedLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {(log.actor_email || 'system')[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-900">{log.actor_email || 'system'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        <ActionIcon className="w-3.5 h-3.5" />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getModuleColor(log.module)}`}>
                        {log.module || 'system'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">{log.details || '-'}</p>
                      {log.entity_type && (
                        <p className="text-xs text-gray-400 mt-1">{log.entity_type}{log.entity_id ? ` #${log.entity_id.slice(-6)}` : ''}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewLog(log)} className="p-2 hover:bg-gray-100">
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">{filteredLogs.length} total · page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Log Details Dialog */}
      {viewLog && (
        <Dialog open={!!viewLog} onOpenChange={() => setViewLog(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Audit Log Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                  <p className="font-semibold text-gray-900">{viewLog.created_at ? new Date(viewLog.created_at).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Actor</p>
                  <p className="font-semibold text-gray-900">{viewLog.actor_email || 'system'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Action</p>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getActionColor(viewLog.action)}`}>
                    {React.createElement(getActionIcon(viewLog.action), { className: "w-3.5 h-3.5" })}
                    {viewLog.action}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Module</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getModuleColor(viewLog.module)}`}>
                    {viewLog.module || 'system'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Entity Type</p>
                  <p className="font-semibold text-gray-900">{viewLog.entity_type || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Entity ID</p>
                  <p className="font-semibold text-gray-900 font-mono text-xs">{viewLog.entity_id || 'N/A'}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Details</p>
                <p className="text-sm text-gray-900">{viewLog.details || 'No details available'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">IP Address</p>
                  <p className="font-semibold text-gray-900 font-mono text-xs">{viewLog.ip_address || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Actor Role</p>
                  <p className="font-semibold text-gray-900">{viewLog.actor_role || 'N/A'}</p>
                </div>
              </div>
              {viewLog.user_agent && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">User Agent</p>
                  <p className="text-xs text-gray-600 font-mono break-all">{viewLog.user_agent}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewLog(null)} className="rounded-xl">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}