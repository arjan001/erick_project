import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Job, Application } from '@/lib/supabaseEntities';
import ClientSidebar from '@/components/ClientSidebar';
import { BarChart3, TrendingUp, Users, Briefcase, Eye } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';

export default function ClientAnalytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalJobs: 0,
    openJobs: 0,
    totalApplications: 0,
    acceptedApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));

    const fetchStats = async () => {
      try {
        const userEmail = JSON.parse(storedUser).email;
        
        const projects = await Project.filter({ project_owner_email: userEmail });
        const jobs = await Job.filter({ client_email: userEmail });
        
        const jobIds = jobs.map(j => j.id);
        const allApplications = await Promise.all(
          jobIds.map(jobId => Application.filter({ job_id: jobId }))
        );
        const applications = allApplications.flat();

        setStats({
          totalProjects: projects.length,
          activeProjects: projects.filter(p => p.status === 'in_progress' || p.status === 'verified').length,
          totalJobs: jobs.length,
          openJobs: jobs.filter(j => j.status === 'open').length,
          totalApplications: applications.length,
          acceptedApplications: applications.filter(a => a.status === 'accepted').length
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-white">
        <ClientSidebar />
        <main className="w-full h-full flex items-center justify-center pl-20">
          <div className="text-gray-600">Loading analytics...</div>
        </main>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Active Projects', value: stats.activeProjects, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Total Jobs Posted', value: stats.totalJobs, icon: Users, color: 'bg-purple-500' },
    { label: 'Open Jobs', value: stats.openJobs, icon: Eye, color: 'bg-orange-500' },
    { label: 'Total Applications', value: stats.totalApplications, icon: BarChart3, color: 'bg-pink-500' },
    { label: 'Accepted Applications', value: stats.acceptedApplications, icon: TrendingUp, color: 'bg-teal-500' }
  ];

  return (
    <div className="h-screen bg-white">
      <ClientSidebar />
      <main className="w-full h-full flex flex-col overflow-y-auto bg-white pl-20">
        <div className="p-6 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600 mb-8">Track your project and job performance</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Application Acceptance Rate</span>
                <span className="font-bold text-gray-900">
                  {stats.totalApplications > 0 
                    ? Math.round((stats.acceptedApplications / stats.totalApplications) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${stats.totalApplications > 0 
                      ? (stats.acceptedApplications / stats.totalApplications) * 100 
                      : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}