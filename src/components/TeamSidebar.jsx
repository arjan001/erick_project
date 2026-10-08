import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { useSidebar } from '@/layouts/DashboardLayout'
import { useAuth } from '@/lib/AuthContext'
import { 
  LayoutDashboard, Users, Briefcase, MessageSquare,
  CreditCard, Settings, LogOut, ChevronLeft, ChevronRight, Building2, Share2, Bell, Ticket
} from 'lucide-react'
import { Message, Notification } from '@/lib/supabaseEntities'

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'TeamDashboard' },
  { icon: Users, label: 'Team Members', path: 'TeamMembers' },
  { icon: Briefcase, label: 'Projects', path: 'TeamProjects' },
  { icon: MessageSquare, label: 'Messages', path: 'TeamMessages', showBadge: true },
  { icon: Share2, label: 'Network', path: 'Network' },
  { icon: Bell, label: 'Notifications', path: 'Notifications', showNotificationBadge: true },
  { icon: Ticket, label: 'Support Tickets', path: 'SupportTickets' },
  { icon: CreditCard, label: 'Payments', path: 'TeamPayments' },
  { icon: Settings, label: 'Profile & Settings', path: 'TeamProfile' },
]

export default function TeamSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [team, setTeam] = useState(null)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const { sidebarExpanded: expanded, setSidebarExpanded, mobileSidebarOpen, setMobileSidebarOpen } = useSidebar()
  const { logout, user } = useAuth()

  useEffect(() => {
    if (!user?.email) return

    const fetchUnreadMessages = async () => {
      try {
        // Messages table uses conversation_id and sender_id, not recipient_email
        // For now, set to 0 until proper conversation-based messaging is implemented
        setUnreadMessageCount(0)
      } catch {
        setUnreadMessageCount(0)
      }
    }

    const fetchUnreadNotifications = async () => {
      try {
        const notifs = await Notification.filter({ recipient_email: user.email })
        setUnreadNotificationCount((notifs || []).filter(n => !n.read).length)
      } catch {
        setUnreadNotificationCount(0)
      }
    }

    fetchUnreadMessages()
    fetchUnreadNotifications()

    // Poll for updates every 30 seconds instead of using subscribe
    const interval = setInterval(() => {
      fetchUnreadMessages()
      fetchUnreadNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const storedUser = localStorage.getItem('ericrabar_user')
    if (!storedUser) return
    const user = JSON.parse(storedUser)
    const fetchTeam = async () => {
      try {
        const { Team } = await import('@/lib/supabaseEntities')
        const teams = await Team.filter({ contact_email: user.email }, '-created_date', 1)
        if (teams?.[0]) setTeam(teams[0])
      } catch {
        // team not found — leave null
      }
    }
    fetchTeam()
  }, [])

  const toggle = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen)
    } else {
      setSidebarExpanded(!expanded)
    }
  }

  const handleLogout = () => { logout(true); }

  return (
    <aside
      className={`h-full bg-[#0A0A0A] shadow-[2px_0_12px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-300 z-50 flex-shrink-0 fixed lg:relative ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${expanded ? 'w-64' : 'w-20'}`}
    >
      {/* Logo + Toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-[#1a1a1a]">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          {expanded && (
            <div>
              <div className="font-bold text-gray-900 text-sm">ER.</div>
              <div className="text-xs text-gray-500">Team Portal</div>
            </div>
          )}
        </Link>
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors text-gray-400"
        >
          {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname.toLowerCase().includes(item.path.toLowerCase())
          
          if (!expanded) {
            return (
              <div key={item.path} className="relative group">
                <button
                  onClick={() => navigate(createPageUrl(item.path))}
                  className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-[#C9A962]/10 text-[#C9A962] font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.showBadge && unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                    </span>
                  )}
                  {item.showNotificationBadge && unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </span>
                  )}
                </button>
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a1a] rotate-45"></div>
                </div>
              </div>
            )
          }
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(createPageUrl(item.path))}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive ? 'bg-[#C9A962]/10 text-[#C9A962] font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm whitespace-nowrap flex-1 text-left">{item.label}</span>
              {item.showBadge && unreadMessageCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
              {item.showNotificationBadge && unreadNotificationCount > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1a1a1a] p-2 space-y-1">
        {!expanded && team && (
          <div className="relative group">
            <div className="flex items-center justify-center w-full p-2 rounded-xl">
              <div className="w-8 h-8 bg-[#1a1a1a] ring-2 ring-[#222] rounded-full flex-shrink-0" />
            </div>
            {/* Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              {team.team_name}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a1a] rotate-45"></div>
            </div>
          </div>
        )}
        {expanded && team && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 bg-[#1a1a1a] ring-2 ring-[#222] rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-xs truncate">{team.team_name}</div>
              <div className="text-xs text-gray-500">Team Admin</div>
            </div>
          </div>
        )}
        {!expanded ? (
          <div className="relative group">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
            </button>
            {/* Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-[#1a1a1a] text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
              Logout
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a1a] rotate-45"></div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Logout
          </button>
        )}
      </div>
    </aside>
  )
}