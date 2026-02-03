import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Button } from '@/components/ui/button';

export default function JobApplications() {
  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      try {
        const apps = await base44.entities.Application.filter({
          artist_email: user.email
        });
        
        // Fetch job details for each application
        const enrichedApps = await Promise.all(
          apps.map(async (app) => {
            const job = await base44.entities.Job.get(app.job_id);
            return { ...app, job };
          })
        );
        
        setApplications(enrichedApps);
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };

    fetchApplications();
  }, [user]);

  if (!user) return null;

  const statusColors = {
    applied: 'bg-blue-100 text-blue-700',
    chat_started: 'bg-purple-100 text-purple-700',
    shortlisted: 'bg-green-100 text-green-700',
    hired: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const statusLabels = {
    applied: 'Applied',
    chat_started: 'Chat Started',
    shortlisted: 'Shortlisted',
    hired: 'Hired',
    rejected: 'Rejected'
  };

  return (
    <div className="flex h-screen bg-white">
      <ArtistSidebar />
      
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">Applications</h1>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No applications yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-bold text-sm text-gray-900">Job</th>
                    <th className="text-left py-3 px-4 font-bold text-sm text-gray-900">Client</th>
                    <th className="text-left py-3 px-4 font-bold text-sm text-gray-900">Date Applied</th>
                    <th className="text-left py-3 px-4 font-bold text-sm text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-bold text-sm text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-bold text-sm text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-900 font-medium">{app.job?.title}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{app.job?.client_name}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {app.job?.roles_needed?.[0] || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[app.status]}`}>
                          {statusLabels[app.status]}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="outline" size="sm" className="text-xs">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}