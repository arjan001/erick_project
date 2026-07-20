import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, LogOut, Settings, MessageCircle, Menu, Users, Home, Bell, CreditCard, UserCheck, Briefcase, MessageSquare, Heart, Star, Ticket, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/shared/utils/routing';
import { Message, Artist, Team, ProjectOwner, Backer, Notification } from '@/lib/supabaseEntities';
import { useSidebar } from '@/layouts/DashboardLayout';

// Modern TailAdmin-style top bar shared across all dashboard roles.
export default function DashboardTopbar({ title, settingsPage = 'Settings' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setMobileSidebarOpen } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentSenders, setRecentSenders] = useState([]);
  const [artistProfile, setArtistProfile] = useState(null);

  const fetchMessages = async () => {
    if (!user?.email) return;
    try {
      // Messages table uses is_read, not read
      const msgs = await Message.filter({ recipient_email: user.email, is_read: false }, '-created_at', 10);
      setMessages(msgs || []);
      
      // Get unique senders
      const senderEmails = [...new Set(msgs.map(m => m.sender_email))];
      const sendersData = await Promise.all(
        senderEmails.map(async (email) => {
          try {
            const [artists, teams, owners, backers] = await Promise.all([
              Artist.filter({ email }),
              Team.filter({ contact_email: email }),
              ProjectOwner.filter({ email }),
              Backer.filter({ contact_email: email })
            ]);
            const artist = artists?.[0];
            const team = teams?.[0];
            const owner = owners?.[0];
            const backer = backers?.[0];
            
            return {
              email,
              name: artist?.full_name || team?.team_name || owner?.full_name || backer?.organization_name || email,
              avatar: artist?.profile_photo_url || team?.team_logo_url || owner?.profile_photo_url || backer?.logo_url || null
            };
          } catch {
            return { email, name: email, avatar: null };
          }
        })
      );
      setRecentSenders(sendersData.slice(0, 5));
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user?.email) return;
    try {
      const notifs = await Notification.filter({ recipient_email: user.email }, '-created_at', 10);
      setNotifications(notifs || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchNotifications();
  }, [user]);


  useEffect(() => {
    if (!user?.email) return;
    const interval = setInterval(() => {
      fetchMessages();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    const fetchProfile = async () => {
      try {
        if (user.role === 'artist' || user.role === 'artist_admin') {
          const artists = await Artist.filter({ email: user.email });
          if (artists?.[0]) {
            setArtistProfile(artists[0]);
          }
        } else if (user.role === 'team' || user.role === 'team_admin') {
          const teams = await Team.filter({ contact_email: user.email });
          if (teams?.[0]) {
            setArtistProfile(teams[0]);
          }
        } else if (user.role === 'backer') {
          const backers = await Backer.filter({ contact_email: user.email });
          if (backers?.[0]) {
            setArtistProfile(backers[0]);
          }
        } else if (user.role === 'client' || user.role === 'project_owner') {
          const owners = await ProjectOwner.filter({ email: user.email });
          if (owners?.[0]) {
            setArtistProfile(owners[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, [user]);

  const unreadMessagesCount = messages.length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleOpenMessages = () => {
    setMessagesOpen(!messagesOpen);
    setNotificationsOpen(false);
    setMenuOpen(false);
  };

  const handleOpenNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setMessagesOpen(false);
    setMenuOpen(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { read: true });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'message': <MessageSquare className="w-4 h-4 text-white" />,
      'connection_request': <UserCheck className="w-4 h-4 text-white" />,
      'job_application': <Briefcase className="w-4 h-4 text-white" />,
      'job_status': <Briefcase className="w-4 h-4 text-white" />,
      'subscription': <Star className="w-4 h-4 text-white" />,
      'payment': <CreditCard className="w-4 h-4 text-white" />,
      'connects': <Zap className="w-4 h-4 text-white" />,
      'ticket_response': <Ticket className="w-4 h-4 text-white" />,
      'endorsement': <Heart className="w-4 h-4 text-white" />,
      'testimonial': <Star className="w-4 h-4 text-white" />,
      'project_update': <Briefcase className="w-4 h-4 text-white" />,
      'system': <Bell className="w-4 h-4 text-white" />,
    };
    return iconMap[type] || <Bell className="w-4 h-4 text-white" />;
  };

  const getNotificationIconColor = (type) => {
    const colorMap = {
      'message': 'bg-blue-500',
      'connection_request': 'bg-green-500',
      'job_application': 'bg-purple-500',
      'job_status': 'bg-orange-500',
      'subscription': 'bg-yellow-500',
      'payment': 'bg-emerald-500',
      'connects': 'bg-cyan-500',
      'ticket_response': 'bg-indigo-500',
      'endorsement': 'bg-pink-500',
      'testimonial': 'bg-rose-500',
      'project_update': 'bg-teal-500',
      'system': 'bg-gray-500',
    };
    return colorMap[type] || 'bg-gray-500';
  };

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };


  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>}
      </div>

      <div className="flex-1 max-w-md sm:block hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search or type command..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all"
          />
        </div>
      </div>

      {/* Mobile search button */}
      <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
        <Search className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Back to Site Button */}
        <Link to="/" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
          <Home className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Site</span>
        </Link>

        {/* Messages Button */}
        <div className="relative">
          <button onClick={handleOpenMessages} className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500">
            <MessageCircle className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-black rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </button>

          {messagesOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMessagesOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-20 max-h-96 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <span className="font-semibold text-gray-900 text-sm">Messages</span>
                  <Link to={createPageUrl('Messages')} onClick={() => setMessagesOpen(false)} className="text-xs text-gray-600 hover:underline">View all</Link>
                </div>
                <div className="overflow-y-auto flex-1">
                  {recentSenders.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">No new messages</div>
                  ) : (
                    recentSenders.map((sender, idx) => (
                      <Link
                        key={idx}
                        to={createPageUrl('Messages')}
                        onClick={() => setMessagesOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {sender.avatar ? (
                            <img src={sender.avatar} alt={sender.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-600">{sender.name?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{sender.name}</p>
                          <p className="text-xs text-gray-500 truncate">New message</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button onClick={handleOpenNotifications} className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500">
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-black rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-20 max-h-96 flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <span className="font-semibold text-gray-900 text-sm">Notifications</span>
                  <Link to={createPageUrl('Notifications')} onClick={() => setNotificationsOpen(false)} className="text-xs text-gray-600 hover:underline">View all</Link>
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">No notifications</div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleMarkAsRead(notification.id)}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationIconColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{formatNotificationTime(notification.created_at)}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setMenuOpen(!menuOpen); }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {artistProfile?.profile_photo_url || artistProfile?.team_logo_url ? (
                <img src={artistProfile.profile_photo_url || artistProfile.team_logo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {artistProfile?.full_name || artistProfile?.team_name || user?.full_name || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-900 truncate">{artistProfile?.full_name || artistProfile?.team_name || user?.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to={createPageUrl(settingsPage)}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4" /> Profile & Settings
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}