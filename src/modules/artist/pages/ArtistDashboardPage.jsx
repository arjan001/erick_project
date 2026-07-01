import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Bell, FolderKanban, MessageCircle } from 'lucide-react';
import ArtistOnboardingModal from '@/components/artist/ArtistOnboardingModal';
import UpgradeConnectsBanner from '@/components/artist/UpgradeConnectsBanner';
import StatCard from '@/components/artist/dashboard/StatCard';
import ActivityChart from '@/components/artist/dashboard/ActivityChart';
import RemindersCard from '@/components/artist/dashboard/RemindersCard';
import JobOpportunitiesCard from '@/components/artist/dashboard/JobOpportunitiesCard';
import RecentConversations from '@/components/artist/dashboard/RecentConversations';
import ProfileCompletionRing from '@/components/artist/dashboard/ProfileCompletionRing';
import ConnectsTrackerCard from '@/components/artist/dashboard/ConnectsTrackerCard';
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
    { label: 'In Queue', value: queuedApplications.length, icon: Briefcase, accent: true },
    { label: 'Working On', value: activeProjects.length, icon: FolderKanban },
    { label: 'Invitations', value: invitations.length, icon: Bell },
    { label: 'Messages', value: messages.length, icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full min-h-screen overflow-auto">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-8 pb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {user.full_name}</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <UpgradeConnectsBanner />

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <StatCard key={idx} icon={stat.icon} label={stat.label} value={stat.value} accent={stat.accent} />
            ))}
          </div>

          {/* Row: Chart | Reminders | Jobs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActivityChart applications={applications} />
            <RemindersCard invitations={invitations} />
            <JobOpportunitiesCard jobs={jobs} />
          </div>

          {/* Row: Conversations | Profile Progress | Connects */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentConversations userEmail={user.email} />
            <ProfileCompletionRing artist={artistProfile} portfolioCount={artistProfile?.portfolio_clips?.length || 0} />
            <ConnectsTrackerCard connects={artistProfile?.connects_balance} />
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