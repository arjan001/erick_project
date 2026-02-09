import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { createPageUrl } from '../utils';
import { Briefcase, MessageCircle, Lightbulb, ArrowRight, Calendar, DollarSign, MapPin, Users, Bell, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ArtistDashboard() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch open jobs
        const jobsData = await base44.entities.Job.filter({ status: 'open' });
        setJobs(jobsData.slice(0, 4));

        // Fetch user's applications
        const appsData = await base44.entities.Application.filter({ artist_email: user.email });
        setApplications(appsData);

        // Fetch job invitations
        const invitationsData = await base44.entities.Notification.filter({
          recipient_email: user.email,
          type: 'job_invitation'
        });
        setInvitations(invitationsData.slice(0, 3));

        // Mock messages for now
        setMessages([
          { id: 1, name: 'Sarah Chen', message: 'Great work on the last project!', time: '2 hours ago' },
          { id: 2, name: 'Design Studio Co', message: 'We would like to discuss collaboration...', time: '5 hours ago' },
          { id: 3, name: 'Alex Studios', message: 'Your portfolio is impressive', time: '1 day ago' }
        ]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  const stats = [
    { label: 'Applications', value: applications.length, icon: Briefcase, color: 'bg-blue-50' },
    { label: 'Pending Invitations', value: invitations.length, icon: Bell, color: 'bg-amber-50' },
    { label: 'Active Messages', value: messages.length, icon: MessageCircle, color: 'bg-green-50' }
  ];

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />
      
      <main className="w-full h-full overflow-auto pl-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-12">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user.full_name}</h1>
          <p className="text-gray-300">Your creative dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="p-12 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className={`${stat.color} border border-gray-200 rounded-lg p-6`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Latest Jobs & Invitations */}
            <div className="col-span-2 space-y-6">
              {/* Latest Job Opportunities */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Latest Job Opportunities</h2>
                  <Link to={createPageUrl('Jobs')} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {jobs.length > 0 ? jobs.map((job) => (
                    <div key={job.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        {job.budget_max && <span className="text-sm font-bold text-gray-900">${job.budget_max}</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{job.short_description || job.description?.substring(0, 100)}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location || 'Remote'}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Posted today</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-8">No jobs available right now</p>
                  )}
                </div>
              </div>

              {/* Job Invitations */}
              {invitations.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-6 bg-amber-50">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-600" />
                    Pending Invitations ({invitations.length})
                  </h2>
                  <div className="space-y-2">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-white rounded border border-amber-200">
                        <p className="text-sm text-gray-800">{inv.message}</p>
                        <Button size="sm" className="bg-black text-white hover:bg-gray-800">View</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Messages & Brainstorm */}
            <div className="space-y-6">
              {/* Recent Messages */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                  <Link to={createPageUrl('Messages')} className="text-sm text-gray-600 hover:text-gray-900">
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <p className="font-semibold text-sm text-gray-900">{msg.name}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{msg.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{msg.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brainstorm & Ideas */}
              <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Brainstorm Ideas
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs text-gray-600">💡 Pitch your unique creative idea or collaboration concept</p>
                  </div>
                  <Button className="w-full bg-black text-white hover:bg-gray-800 text-sm">Share an Idea</Button>
                </div>
              </div>

              {/* Settings Quick Link */}
              <div className="border border-gray-200 rounded-lg p-6">
                <Link to={createPageUrl('Settings')} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Profile Settings</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Growth Tips */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Growth Tips
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>✓ Complete your profile with all skills and portfolio</div>
              <div>✓ Respond to invitations within 24 hours</div>
              <div>✓ Build your network and connect with creators</div>
              <div>✓ Update your availability status regularly</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}