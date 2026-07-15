import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, LogOut, Settings, MessageCircle, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/shared/utils/routing';
import { Message, Artist, Team, ProjectOwner, Backer } from '@/lib/supabaseEntities';
import { useSidebar } from '@/layouts/DashboardLayout';

// Modern TailAdmin-style top bar shared across all dashboard roles.
export default function DashboardTopbar({ title, settingsPage = 'Settings' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { setMobileSidebarOpen } = useSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [recentSenders, setRecentSenders] = useState([]);

  const fetchMessages = async () => {
    if (!user?.email) return;
    try {
      const msgs = await Message.filter({ recipient_email: user.email, read: false }, '-created_date', 10);
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

  useEffect(() => { 
    fetchMessages();
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    const interval = setInterval(() => {
      fetchMessages();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadMessagesCount = messages.length;

  const handleOpenMessages = () => {
    setMessagesOpen(!messagesOpen);
    setMenuOpen(false);
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
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
          />
        </div>
      </div>

      {/* Mobile search button */}
      <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
        <Search className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Messages Button */}
        <div className="relative">
          <button onClick={handleOpenMessages} className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500">
            <MessageCircle className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
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
                  <Link to={createPageUrl('Messages')} onClick={() => setMessagesOpen(false)} className="text-xs text-indigo-600 hover:underline">View all</Link>
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {sender.avatar ? (
                            <img src={sender.avatar} alt={sender.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-indigo-600">{sender.name?.[0]?.toUpperCase()}</span>
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

        <div className="relative">
          <button
            onClick={() => { setMenuOpen(!menuOpen); }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {user?.full_name || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
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