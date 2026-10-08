import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export default function UnifiedTopbar({ settingsPage = 'CreatorProfile' }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('smartgigs_sidebar_collapsed') === 'true')

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
          <Link
            to="/Notifications"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
          </Link>
          <button
            onClick={() => navigate(settingsPage)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
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
