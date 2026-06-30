import React, { useEffect, useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import ArtistSidebar from '@/components/ArtistSidebar';

import { createPageUrl } from '@/shared/utils/routing';

import { Briefcase, MessageCircle, Lightbulb, ArrowRight, Calendar, DollarSign, MapPin, Users, Bell, Settings, TrendingUp, Crown, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useToast } from '@/hooks/useToast';



export default function ArtistDashboard() {

  const [user, setUser] = useState(null);

  const [jobs, setJobs] = useState([]);

  const [messages, setMessages] = useState([]);

  const [applications, setApplications] = useState([]);

  const [invitations, setInvitations] = useState([]);

  const [subscription, setSubscription] = useState(null);

  const [subscriptionPackage, setSubscriptionPackage] = useState(null);

  const navigate = useNavigate();

  const { success, error } = useToast();



  useEffect(() => {

    const storedUser = localStorage.getItem('studio22_user');

    if (!storedUser) {

      window.location.href = '/signin';

      return;

    }

    setUser(JSON.parse(storedUser));

  }, []);



  useEffect(() => {

    if (!user) return;



    const fetchData = async () => {

      try {

        // Mock data for jobs
        const mockJobs = [
          { id: 1, title: 'Video Editor for Music Video', budget: '$500-800', deadline: '2 days', location: 'Remote' },
          { id: 2, title: 'Graphic Designer for Album Art', budget: '$300-500', deadline: '5 days', location: 'Remote' },
          { id: 3, title: 'Sound Engineer for Podcast', budget: '$200-400', deadline: '1 week', location: 'Remote' },
          { id: 4, title: '3D Animator for Short Film', budget: '$1000-1500', deadline: '2 weeks', location: 'Remote' }
        ];
        setJobs(mockJobs);



        // Mock data for applications
        const mockApplications = [
          { id: 1, job_title: 'Video Editor for Music Video', status: 'pending', applied_date: '2024-01-15' },
          { id: 2, job_title: 'Graphic Designer for Album Art', status: 'accepted', applied_date: '2024-01-14' }
        ];
        setApplications(mockApplications);



        // Mock data for invitations
        const mockInvitations = [
          { id: 1, from: 'Studio Productions', role: 'Video Editor', project: 'Music Video Series' },
          { id: 2, title: 'Freelance Project', from: 'Creative Agency', role: 'Motion Designer' }
        ];
        setInvitations(mockInvitations);



        // Mock data for messages
        const mockMessages = [
          { id: 1, name: 'Studio Productions', message: 'Your application has been reviewed...', time: '2 hours ago' },
          { id: 2, name: 'Creative Agency', message: 'We have a new project for you...', time: '1 day ago' },
          { id: 3, name: 'Music Label', message: 'Interested in collaboration...', time: '2 days ago' }
        ];
        setMessages(mockMessages);



        // Mock subscription data
        setSubscriptionPackage({ name: 'Pro Plan' });

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

      

      <main className="w-full h-full overflow-auto pl-20 transition-all duration-300">

        {/* Header */}
        <div className="bg-gray-900 text-white py-12 px-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome, {user.full_name}</h1>
              <p className="text-gray-300">Your creative dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            {subscriptionPackage && (
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                <Crown className="w-5 h-5 text-yellow-400" />
                <div className="text-right">
                  <div className="font-medium text-yellow-400">{subscriptionPackage.name}</div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
              </div>
            )}
          </div>
        </div>



        <div className="p-12 space-y-8">

          {/* Subscription Banner */}
          {!subscription && (
            <div className="bg-gray-100 border border-gray-300 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-gray-900">Upgrade to Pro</h3>
                    <p className="text-gray-600">Get unlimited job applications, featured listings, and more</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl('ArtistSubscriptionCheckout'))}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  View Plans
                </Button>
              </div>
            </div>
          )}

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
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-700" />
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