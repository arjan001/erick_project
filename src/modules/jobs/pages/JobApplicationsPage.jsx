import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job, Project, Application } from '@/lib/supabaseEntities';
import { MapPin, Clock } from 'lucide-react';

export default function JobApplications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ericrabar_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      try {
        const userApplications = await Application.filter({ artist_email: user.email });
        
        const enrichedApplications = await Promise.all(
          userApplications.map(async (app) => {
            try {
              if (app.job_id) {
                const job = await Job.get(app.job_id);
                return { ...app, job };
              }
              const project = await Project.get(app.project_id);
              return { ...app, job: project ? {
                title: project.title || project.project_type?.replace(/_/g, ' ') + ' project',
                location: [project.location_city, project.location_country].filter(Boolean).join(', '),
                client_name: project.project_owner_name,
                budget_min: 0,
                budget_type: 'fixed',
                roles_needed: []
              } : null };
            } catch (err) {
              console.error('Error fetching job:', err);
              return { ...app, job: null };
            }
          })
        );
        
        setApplications(enrichedApplications.filter(app => app.job));
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const statusColors = {
    applied: 'bg-blue-100 text-blue-800',
    chat_started: 'bg-purple-100 text-purple-800',
    shortlisted: 'bg-green-100 text-green-800',
    hired: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    applied: 'Applied',
    chat_started: 'In Discussion',
    shortlisted: 'Shortlisted',
    hired: 'Hired',
    rejected: 'Rejected',
  };

  if (!user || loading) return null;

  return (
    <div className="h-full bg-white">
      <main className="w-full h-full flex flex-col overflow-hidden bg-white">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h2>
              <p className="text-gray-600 mb-6">Start applying to jobs to see your applications here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">Job</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">Client</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">Date Applied</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">Budget</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 text-sm">{app.job.title}</div>
                        <div className="text-xs text-gray-600 flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {app.job.location}
                          </span>
                          <span className="text-gray-500">
                            {app.job.roles_needed?.join(', ') || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{app.job.client_name}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {new Date(app.applied_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-black flex items-center gap-1">
                          €{app.job.budget_min || 0}
                        </div>
                        <div className="text-xs text-gray-600">{app.job.budget_type || 'fixed'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[app.status] || app.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          View
                        </button>
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