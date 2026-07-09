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
import QuickNotesCard from '@/components/artist/QuickNotesCard';
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
    { label: 'In Queue', value: queuedApplications.length, icon: Briefcase, accent: '#2A9D8F' },
    { label: 'Working On', value: activeProjects.length, icon: FolderKanban, accent: '#F4A261' },
    { label: 'Invitations', value: invitations.length, icon: Bell, accent: '#E9C46A' },
    { label: 'Messages', value: messages.length, icon: MessageCircle, accent: '#2A9D8F' },
  ];

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <main className="w-full">
        <div className="px-5 sm:px-7 lg:px-9 pt-7 pb-12">
          <UpgradeConnectsBanner />

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-5">
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

            {/* Connects card */}
            <div>
              <ConnectsTrackerCard connects={artistProfile?.connects_balance} />
            </div>

            {/* Bottom row */}
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-5">
              <RemindersCard invitations={invitations} />
              <RecentConversations userEmail={user.email} />
              <QuickNotesCard />
            </div>
          </div>

          {/* Invite Code — full width */}
          <div className="mt-5">
            <InviteCodeCard />
          </div>
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