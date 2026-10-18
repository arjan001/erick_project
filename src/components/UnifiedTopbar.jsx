import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, User, LogOut, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { Notification, Connection } from '@/lib/supabaseEntities'

export default function UnifiedTopbar({ settingsPage = 'CreatorProfile' }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('smartgigs_sidebar_collapsed') === 'true')
  const [notificationCount, setNotificationCount] = useState(0)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [connectionRequestCount, setConnectionRequestCount] = useState(0)

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('artistdashboard') || path.includes('creatordashboard')) return 'Dashboard'
    if (path.includes('Jobs')) return 'Find Work'
    if (path.includes('JobApplications')) return 'Applications'
    if (path.includes('JobBoard')) return 'Projects from Clients'
    if (path.includes('Messages')) return 'Messages'
    if (path.includes('Network')) return 'Network'
    if (path.includes('Notifications')) return 'Notifications'
    if (path.includes('ArtistFinance') || path.includes('CreatorFinance')) return 'Finances'
    if (path.includes('ArtistProfile') || path.includes('CreatorProfile')) return 'My Profile & Settings'
    if (path.includes('teamdashboard')) return 'Dashboard'
    if (path.includes('TeamProjects')) return 'Our Projects'
    if (path.includes('TeamApplications')) return 'Applications'
    if (path.includes('TeamFinance')) return 'Finances'
    if (path.includes('TeamProfile')) return 'Team Profile & Settings'
    if (path.includes('clientdashboard')) return 'Dashboard'
    if (path.includes('PostJob')) return 'Post a Job'
    if (path.includes('BrowseTalent')) return 'Browse Talent'
    if (path.includes('SavedTalent')) return 'Saved Talent'
    if (path.includes('ClientProjects')) return 'Our Projects'
    if (path.includes('ClientProfile')) return 'Profile & Settings'
    if (path.includes('backerdashboard')) return 'Dashboard'
    if (path.includes('BackerProjects')) return 'My Investments'
    if (path.includes('BackerAnalytics')) return 'Analytics'
    if (path.includes('BackerProfile')) return 'Profile & Settings'
    return 'Dashboard'
  }

  const handleSidebarToggle = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'))
  }

  const handleCollapseToggle = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('smartgigs_sidebar_collapsed', String(newState))
    window.dispatchEvent(new CustomEvent('sidebar-collapse', { detail: { collapsed: newState } }))
  }

  useEffect(() => {
    const handleCollapse = (e) => setSidebarCollapsed(e.detail.collapsed)
    window.addEventListener('sidebar-collapse', handleCollapse)
    return () => window.removeEventListener('sidebar-collapse', handleCollapse)
  }, [])

  // Fetch notification count and connection requests
  useEffect(() => {
    if (!user?.id) return

    const fetchNotificationCount = async () => {
      try {
        const notifications = await Notification.filter({ user_id: user.id, is_read: false })
        setNotificationCount(notifications.length)

        // Fetch pending connection requests
        const pendingConnections = await Connection.filter({ connected_artist_id: user.id, status: 'pending' })
        setConnectionRequestCount(pendingConnections.length)

        // Fetch recent notifications for dropdown
        const recent = await Notification.filter({ user_id: user.id }, '-created_at', 5)
        setRecentNotifications(recent || [])
      } catch (err) {
        console.error('Error fetching notifications:', err)
      }
    }

    fetchNotificationCount()
    const interval = setInterval(fetchNotificationCount, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [user])

  const handleNotificationClick = () => {
    setShowNotificationDropdown(!showNotificationDropdown)
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { is_read: true, read_at: new Date().toISOString() })
      setNotificationCount(prev => Math.max(0, prev - 1))
      setRecentNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 flex-shrink-0"
      style={{ boxShadow: '0 1px 4px 0 rgba(60,72,100,0.06)' }}>
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSidebarToggle}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={handleCollapseToggle}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <div className="text-sm font-semibold text-gray-700 truncate">
            {getPageTitle()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
              {connectionRequestCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse" style={{ animation: 'pulse 2s infinite' }}>
                  {connectionRequestCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotificationDropdown && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  <button onClick={() => setShowNotificationDropdown(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                  ) : (
                    recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          handleMarkAsRead(notification.id)
                          navigate(notification.link_url || '/Notifications')
                          setShowNotificationDropdown(false)
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Bell className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{notification.content}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <Link
                    to="/Notifications"
                    onClick={() => setShowNotificationDropdown(false)}
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate(`/${settingsPage}`)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            title="Profile Settings"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={() => logout(true)}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
