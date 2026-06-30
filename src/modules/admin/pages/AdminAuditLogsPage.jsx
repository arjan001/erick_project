import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Search, Filter, Download, User, Shield, Settings, FileText } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([
    { id: 1, action: 'user.login', user: 'admin@studio22.com', details: 'User logged in', timestamp: '2024-01-15 10:30:00', ip: '192.168.1.1' },
    { id: 2, action: 'user.update', user: 'admin@studio22.com', details: 'Updated user role', timestamp: '2024-01-15 10:25:00', ip: '192.168.1.1' },
    { id: 3, action: 'settings.update', user: 'admin@studio22.com', details: 'Updated site settings', timestamp: '2024-01-15 10:20:00', ip: '192.168.1.1' },
    { id: 4, action: 'content.delete', user: 'admin@studio22.com', details: 'Deleted project #123', timestamp: '2024-01-15 10:15:00', ip: '192.168.1.1' },
    { id: 5, action: 'user.create', user: 'admin@studio22.com', details: 'Created new user', timestamp: '2024-01-15 10:10:00', ip: '192.168.1.1' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  const getActionIcon = (action) => {
    if (action.startsWith('user')) return User;
    if (action.startsWith('settings')) return Settings;
    if (action.startsWith('content')) return FileText;
    return Shield;
  };

  const getActionColor = (action) => {
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    if (action.includes('update') || action.includes('create')) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  const filteredLogs = logs.filter(log =>
    log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track all system activities and changes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
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
            {filteredLogs.map((log) => {
              const Icon = getActionIcon(log.action);
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm text-gray-600">{log.user}</span>
                    </div>
                    <p className="text-sm text-gray-900 mt-1">{log.details}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.timestamp} • IP: {log.ip}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
