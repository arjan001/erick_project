import React, { useEffect, useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { createPageUrl } from '@/shared/utils/routing';

import { Briefcase, MessageCircle, ArrowRight, Calendar, MapPin, Bell, Settings, TrendingUp, Crown, FolderKanban, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';

import DashboardStatCard from '@/components/DashboardStatCard';

import ArtistOnboardingModal from '@/components/artist/ArtistOnboardingModal';

import QuickNotesCard from '@/components/artist/QuickNotesCard';

import UpgradeConnectsBanner from '@/components/artist/UpgradeConnectsBanner';

import { useToast } from '@/hooks/useToast';

import { Job, Application, Message, Notification, Artist } from '@/lib/supabaseEntities';

import { useAuth } from '@/lib/AuthContext';



export default function ArtistDashboard() {

  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  const [jobs, setJobs] = useState([]);

  const [messages, setMessages] = useState([]);

  const [applications, setApplications] = useState([]);

  const [invitations, setInvitations] = useState([]);

  const [artistProfile, setArtistProfile] = useState(null);

  const [showOnboarding, setShowOnboarding] = useState(false);

  const navigate = useNavigate();

  const { success, error } = useToast();



  useEffect(() => {

    if (!isLoadingAuth && !isAuthenticated) {

      navigate('/SignIn');

    }

  }, [isLoadingAuth, isAuthenticated, navigate]);



  useEffect(() => {

    if (!user) return;



    const fetchData = async () => {

      try {

        const [jobsData, appsData, msgsData] = await Promise.all([
          Job.filter({ status: 'open' }, '-created_date', 5),
          Application.filter({ artist_email: user.email }, '-created_date', 10),
          Message.filter({ recipient_email: user.email }, '-created_date', 5),
        ]);

        setJobs(jobsData || []);
        setApplications(appsData || []);

        // Map messages to display format
        const formatted = (msgsData || []).map(m => ({
          id: m.id,
          name: m.sender_email,
          message: m.text || '',
          time: new Date(m.created_date).toLocaleDateString()
        }));
        setMessages(formatted);

        // Invitations = notifications of type job_invitation
        const notifs = await Notification.filter({
          recipient_email: user.email,
          type: 'job_invitation'
        }, '-created_date', 10);
        setInvitations(notifs || []);

        const artists = await Artist.filter({ email: user.email }, '-created_date', 1);
        const artist = artists?.[0] || null;
        setArtistProfile(artist);

        const alreadySeen = sessionStorage.getItem('studio22_onboarding_seen');
        const isIncomplete = artist && !artist.based_in_country;
        if (artist && isIncomplete && !alreadySeen) {
          setShowOnboarding(true);
        }

      } catch (err) {

        console.error('Error fetching dashboard data:', err);

      }

    };



    fetchData();

  }, [user]);



  if (isLoadingAuth) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;



  const queuedApplications = applications.filter(a => ['applied', 'chat_started', 'shortlisted'].includes(a.status));
  const activeProjects = applications.filter(a => a.status === 'hired');

  const stats = [

    { label: 'In Queue', value: queuedApplications.length, icon: Briefcase, color: 'bg-blue-50' },

    { label: 'Projects Working On', value: activeProjects.length, icon: FolderKanban, color: 'bg-indigo-50' },

    { label: 'Pending Invitations', value: invitations.length, icon: Bell, color: 'bg-amber-50' },

    { label: 'Active Messages', value: messages.length, icon: MessageCircle, color: 'bg-green-50' }

  ];

  const subscription = null;
  const subscriptionPackage = null;



  return (

    <div className="min-h-screen bg-gray-50">

      <main className="w-full min-h-screen overflow-auto">

        {/* Header */}
        <div className="px-6 sm:px-8 pt-8 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user.full_name}</h1>
            <p className="text-gray-500 text-sm">Your creative dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            {subscriptionPackage && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
                <Crown className="w-5 h-5 text-amber-500" />
                <div className="text-right">
                  <div className="font-medium text-amber-600 text-sm">{subscriptionPackage.name}</div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200">
              <Zap className="w-5 h-5 text-indigo-500" />
              <div className="text-right">
                <div className="font-medium text-gray-900 text-sm">{artistProfile?.connects_balance ?? '—'}</div>
                <div className="text-xs text-gray-400">Connects left</div>
              </div>
            </div>
          </div>
        </div>



        <div className="p-6 sm:p-8 space-y-8">

          <UpgradeConnectsBanner />

          {/* Quick Stats */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            {stats.map((stat, idx) => (
              <DashboardStatCard key={idx} icon={stat.icon} label={stat.label} value={stat.value} iconBg={stat.color} iconColor="text-indigo-600" />
            ))}

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



              {/* Quick Notes */}

              <QuickNotesCard />



              {/* Settings Quick Link */}

              <div className="border border-gray-200 rounded-lg p-6">

                <Link to={createPageUrl('ArtistProfile')} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">

                  <div className="flex items-center gap-2">

                    <Settings className="w-5 h-5 text-gray-600" />

                    <span className="font-semibold text-gray-900">Profile & Settings</span>

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

      {showOnboarding && artistProfile && (
        <ArtistOnboardingModal
          artist={artistProfile}
          onClose={() => { sessionStorage.setItem('studio22_onboarding_seen', 'true'); setShowOnboarding(false); }}
          onComplete={(updated) => { setArtistProfile(updated); sessionStorage.setItem('studio22_onboarding_seen', 'true'); setShowOnboarding(false); }}
        />
      )}

    </div>

  );

}