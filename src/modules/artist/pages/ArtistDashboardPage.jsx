import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Bell, FolderKanban, MessageCircle, Crown, TrendingUp, Users, Zap, ArrowRight } from 'lucide-react';
import ArtistOnboardingFullModal from '@/components/artist/ArtistOnboardingFullModal';
import UpgradeConnectsBanner from '@/components/artist/UpgradeConnectsBanner';
import StatCard from '@/components/artist/dashboard/StatCard';
import ActivityChart from '@/components/artist/dashboard/ActivityChart';
import RemindersCard from '@/components/artist/dashboard/RemindersCard';
import JobOpportunitiesCard from '@/components/artist/dashboard/JobOpportunitiesCard';
import RecentConversations from '@/components/artist/dashboard/RecentConversations';
import ProfileCompletionRing from '@/components/artist/dashboard/ProfileCompletionRing';
import ConnectsTrackerCard from '@/components/artist/dashboard/ConnectsTrackerCard';
import QuickNotesCard from '@/components/artist/QuickNotesCard';
import { Job, Application, Message, Notification, Artist, Subscription } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';

export default function ArtistDashboard() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [artistProfile, setArtistProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      navigate('/SignIn');
    }
  }, [isLoadingAuth, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [jobsData, appsData, msgsData, subsData] = await Promise.all([
          Job.filter({ status: 'open' }, '-created_at', 5),
          Application.filter({ artist_email: user.email }, '-created_at', 10),
          Message.filter({ recipient_email: user.email }, '-created_at', 5),
          Subscription.filter({ user_email: user.email }, '-created_at', 1)
        ]);

        setJobs(jobsData || []);
        setApplications(appsData || []);
        setMessages(msgsData || []);
        setSubscription(subsData?.[0] || null);

        const notifs = await Notification.filter({
          recipient_email: user.email,
          type: 'job_invitation'
        }, '-created_date', 10);
        setInvitations(notifs || []);

        const artists = await Artist.filter({ email: user.email }, '-created_date', 1);
        const artist = artists?.[0] || null;
        setArtistProfile(artist);

        const alreadySeen = sessionStorage.getItem('ericrabar_onboarding_seen');
        const isIncomplete = artist && (!artist.based_in_country || artist.onboarding_completed === false);
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
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const queuedApplications = applications.filter(a => ['applied', 'chat_started', 'shortlisted'].includes(a.status));
  const activeProjects = applications.filter(a => a.status === 'hired');

  const stats = [
    { label: 'In Queue', value: queuedApplications.length, icon: Briefcase, accent: '#2A9D8F' },
    { label: 'Working On', value: activeProjects.length, icon: FolderKanban, accent: '#F4A261' },
    { label: 'Invitations', value: invitations.length, icon: Bell, accent: '#E9C46A' },
    { label: 'Messages', value: messages.length, icon: MessageCircle, accent: '#2A9D8F' },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="w-full">
        <div className="px-4 sm:px-5 md:px-7 lg:px-9 pt-7 pb-12">
          <UpgradeConnectsBanner />

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>

          {/* Main content grid */}
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Latest Jobs - larger, first */}
            <div className="lg:col-span-2">
              <JobOpportunitiesCard jobs={jobs} />
            </div>

            {/* Dynamic Subscription/Connects card */}
            <div>
              {subscription ? (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">Premium Member</div>
                        <div className="text-xs text-gray-600">{subscription.package_name || 'Premium Plan'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">Level 1</div>
                      <div className="text-xs text-gray-600">Upgrade for more</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-600">Progress to Level 2</span>
                      <span className="font-bold text-gray-900">35%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-700">Unlimited job applications</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">Priority in search results</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700">Direct client access</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/Pricing')}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade Plan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Upgrade to Premium</div>
                      <div className="text-xs text-gray-600">Get more connects and features</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/Pricing')}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    View Plans
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom row */}
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-5">
              <RemindersCard invitations={invitations} />
              <RecentConversations userEmail={user.email} />
              <QuickNotesCard />
            </div>
          </div>

        </div>
      </main>

      {showOnboarding && artistProfile && (
        <ArtistOnboardingFullModal
          user={user}
          onClose={() => { sessionStorage.setItem('ericrabar_onboarding_seen', 'true'); setShowOnboarding(false); }}
        />
      )}
    </div>
  );
}