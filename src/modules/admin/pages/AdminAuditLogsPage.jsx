import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Search, User, Settings, FileText, Shield, Trash2 } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { success, error } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const rows = await base44.entities.AuditLog.list('-created_date', 200);
      setLogs(rows || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      error('Error', 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleDelete = async (id) => {
    try {
      await base44.entities.AuditLog.delete(id);
      setLogs(prev => prev.filter(l => l.id !== id));
      success('Deleted', 'Log entry removed');
    } catch (err) {
      console.error('Error deleting log:', err);
      error('Failed', 'Failed to delete log entry');
    }
  };

  const getActionIcon = (action) => {
    if (action?.startsWith('user') || action?.startsWith('invite')) return User;
    if (action?.startsWith('settings') || action?.startsWith('role')) return Settings;
    if (action?.startsWith('job') || action?.startsWith('project') || action?.startsWith('client')) return FileText;
    return Shield;
  };

  const getActionColor = (action) => {
    if (action?.includes('delete')) return 'bg-red-100 text-red-800';
    if (action?.includes('update') || action?.includes('create') || action?.includes('invite')) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const filteredLogs = logs.filter(log =>
    log.actor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600">Track admin actions performed across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredLogs.length === 0 && (
              <div className="text-center text-sm text-gray-500 py-10">No audit log entries yet</div>
            )}
            {filteredLogs.map((log) => {
              const Icon = getActionIcon(log.action);
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                      <span className="text-sm text-gray-600">{log.actor_email || 'system'}</span>
                    </div>
                    <p className="text-sm text-gray-900 mt-1">{log.details}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.created_date ? new Date(log.created_date).toLocaleString() : ''} • {log.entity_type}{log.entity_id ? ` #${log.entity_id.slice(-6)}` : ''}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(log.id)} title="Delete">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}