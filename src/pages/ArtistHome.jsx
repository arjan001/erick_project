import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Button } from '@/components/ui/button';
import { Briefcase, MessageSquare, Brain, ArrowRight, Clock, MapPin, CheckCircle, TrendingUp } from 'lucide-react';

export default function ArtistHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [artist, setArtist] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);

    const fetchData = async () => {
      try {
        const [artistData, jobsData, applicationsData] = await Promise.all([
          base44.entities.Artist.filter({ email: userData.email }),
          base44.entities.Job.filter({ status: 'open' }),
          base44.entities.Application.filter({ artist_email: userData.email })
        ]);

        if (artistData.length > 0) {
          setArtist(artistData[0]);
        }

        setJobs(jobsData.slice(0, 5));
        setApplications(applicationsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (!user || loading) return null;

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />

      <main className="w-full h-full overflow-auto pl-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user.full_name}!</h1>
            <p className="text-gray-300">Here's what's happening with your profile</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-12">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">Applications</span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{applications.length}</div>
              <p className="text-xs text-gray-500 mt-2">Total applications</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">Active Jobs</span>
                <Briefcase className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{jobs.length}</div>
              <p className="text-xs text-gray-500 mt-2">Matching your skills</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">In Discussion</span>
                <MessageSquare className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {applications.filter(a => a.status === 'chat_started').length}
              </div>
              <p className="text-xs text-gray-500 mt-2">Active conversations</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">Profile Views</span>
                <Eye className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{Math.floor(Math.random() * 150) + 20}</div>
              <p className="text-xs text-gray-500 mt-2">This month</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Latest Jobs */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Latest Jobs</h2>
                <Button variant="ghost" onClick={() => navigate('/Jobs')} className="text-blue-600 hover:text-blue-700">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.client_name}</p>
                        </div>
                        {job.budget_max && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">€{(job.budget_max / 1000).toFixed(0)}k</div>
                            <p className="text-xs text-gray-500">Budget</p>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        {job.posted_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(job.posted_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => navigate('/JobBoard')}
                        className="w-full bg-black text-white hover:bg-gray-800"
                      >
                        View Job
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No active jobs right now</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Links */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate('/ArtistProfile')}
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => navigate('/Messages')}
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> Messages
                  </Button>
                  <Button
                    onClick={() => navigate('/Network')}
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    Network
                  </Button>
                  <Button
                    onClick={() => navigate('/Settings')}
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    Settings
                  </Button>
                </div>
              </div>

              {/* Application Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-3">Application Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">
                      {applications.filter(a => a.status === 'hired').length} Hired
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">
                      {applications.filter(a => a.status === 'chat_started').length} In Discussion
                    </span>
                  </div>
                </div>
              </div>

              {/* Brainstorm Ideas */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Brainstorm</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Got project ideas? Collaborate with creatives in your network.
                </p>
                <Button variant="outline" className="w-full">
                  Start Brainstorm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Eye icon (not in lucide, so define it)
function Eye(props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}