import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Bell, FolderKanban, MessageCircle } from 'lucide-react';
import ArtistOnboardingFullModal from '@/components/artist/ArtistOnboardingFullModal';
import UpgradeConnectsBanner from '@/components/artist/UpgradeConnectsBanner';
import StatCard from '@/components/artist/dashboard/StatCard';
import ActivityChart from '@/components/artist/dashboard/ActivityChart';
import RemindersCard from '@/components/artist/dashboard/RemindersCard';
import JobOpportunitiesCard from '@/components/artist/dashboard/JobOpportunitiesCard';
import RecentConversations from '@/components/artist/dashboard/RecentConversations';
import ProfileCompletionRing from '@/components/artist/dashboard/ProfileCompletionRing';
import ConnectsTrackerCard from '@/components/artist/dashboard/ConnectsTrackerCard';
import InviteCodeCard from '@/components/InviteCodeCard';
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
        setMessages(msgsData || []);

        const notifs = await Notification.filter({
          recipient_email: user.email,
          type: 'job_invitation'
        }, '-created_date', 10);
        setInvitations(notifs || []);

        const artists = await Artist.filter({ email: user.email }, '-created_date', 1);
        const artist = artists?.[0] || null;
        setArtistProfile(artist);

        const alreadySeen = sessionStorage.getItem('studio22_onboarding_seen');
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
    { label: 'In Queue', value: queuedApplications.length, icon: Briefcase, accent: true },
    { label: 'Working On', value: activeProjects.length, icon: FolderKanban },
    { label: 'Invitations', value: invitations.length, icon: Bell },
    { label: 'Messages', value: messages.length, icon: MessageCircle },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="w-full">
        {/* Header */}
        <div className="bg-white px-6 sm:px-8 pt-10 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.full_name}</h1>
          <p className="text-gray-500">Here's what's happening with your creative career</p>
        </div>

        <div className="px-6 sm:px-8 pb-8 space-y-8">
          <UpgradeConnectsBanner />

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    idx === 0 ? 'bg-gray-100' : idx === 1 ? 'bg-gray-100' : idx === 2 ? 'bg-gray-100' : 'bg-gray-100'
                  }`}>
                    <stat.icon className={`w-5 h-5 text-gray-600`} />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                </div>
                <div className={`text-2xl font-bold ${stat.accent ? 'text-gray-900' : 'text-gray-700'}`}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Row: Chart | Reminders | Jobs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ActivityChart applications={applications} />
            <RemindersCard invitations={invitations} />
            <JobOpportunitiesCard jobs={jobs} />
          </div>

          {/* Row: Conversations | Profile Progress | Connects */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <RecentConversations userEmail={user.email} />
            <ProfileCompletionRing artist={artistProfile} portfolioCount={artistProfile?.portfolio_clips?.length || 0} />
            <ConnectsTrackerCard connects={artistProfile?.connects_balance} />
          </div>

          {/* Invite Code */}
          <InviteCodeCard />
        </div>
      </main>

      {showOnboarding && artistProfile && (
        <ArtistOnboardingFullModal
          user={user}
          onClose={() => { sessionStorage.setItem('studio22_onboarding_seen', 'true'); setShowOnboarding(false); }}
        />
      )}
    </div>
  );
}