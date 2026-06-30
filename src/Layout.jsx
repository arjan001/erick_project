import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, X, Instagram, Linkedin, Play, Menu, User, LogIn } from 'lucide-react';
import TopBanner from './components/home/TopBanner';
import NewProjectForm from './components/NewProjectForm';
import UnifiedSearch from './components/UnifiedSearch';
import ArtistSidebar from './components/ArtistSidebar';
import ClientSidebar from './components/ClientSidebar';

export default function Layout({ children, currentPageName }) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [academyOpen, setAcademyOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState('commercial');
  const [editMode, setEditMode] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  const [showLoginTooltip, setShowLoginTooltip] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('studio22_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  React.useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('studio22_just_logged_in');
    if (justLoggedIn === 'true') {
      setShowLoadingScreen(true);
      sessionStorage.removeItem('studio22_just_logged_in');
      setTimeout(() => setShowLoadingScreen(false), 5000);
    }
  }, []);

  React.useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('studio22_user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isArtistPage = ['Jobs', 'ArtistDashboard', 'ArtistProfile', 'Messages', 'JobApplications', 'JobBoard', 'JobInvitations', 'Network'].includes(currentPageName);
  const isClientPage = ['ClientDashboard', 'ClientPostProject', 'ClientApplications', 'ClientMessages', 'ClientAnalytics', 'ClientSettings'].includes(currentPageName);
  const shouldHideMenus = user && (isArtistPage || isClientPage);

  const categoryInfo = {
    commercial: { title: 'Commercial', desc: 'Brand films, ads, campaigns.\nClear structure. Clear budgets.' },
    short: { title: 'Short Film', desc: 'Narrative driven.\nScript heavy. Small to mid crews.' },
    feature: { title: 'Feature Film', desc: 'Full production planning.\nCast, locations, long schedule.' },
    music: { title: 'Music Video', desc: 'Visual first.\nShort schedule. Strong art direction.' },
    documentary: { title: 'Documentary', desc: 'Real world.\nFlexible planning. Research focused.' }
  };

  const navLinks = [
    { label: 'Projects', href: 'Projects' },
    { label: 'For Creators', href: 'ApplyArtist' },
    { label: 'For Teams', href: 'ApplyTeam' },
    { label: 'Backed', href: 'BackedProjects' },
    { label: 'How It Works', href: 'HowBackingWorks' },
  ];

  const bottomNav = [
    { name: 'Projects', href: 'Projects' },
    { name: 'Creators', href: 'ApplyArtist' },
    { name: 'Teams', href: 'ApplyTeam' },
    { name: 'Post', href: 'SubmitProject', highlight: true },
    { name: 'Backed', href: 'BackedProjects' },
  ];

  return (
    <div className="min-h-screen bg-white text-[#212121] overflow-x-hidden">
      {/* Loading Screen */}
      {showLoadingScreen && (
        <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-gray-200 flex items-center justify-center animate-pulse">
            <span className="text-4xl font-black tracking-tighter text-[#1a1a1a]">22.</span>
          </div>
        </div>
      )}

      {/* Artist Sidebar */}
      {user && isArtistPage && <ArtistSidebar />}
      {/* Client Sidebar */}
      {user && isClientPage && <ClientSidebar />}

      {/* Top Banner */}
      {!shouldHideMenus && <TopBanner />}

      {/* Main Header */}
      {!shouldHideMenus && (
        <header className={`fixed top-[40px] left-0 right-0 z-[40] transition-colors ${exploreOpen ? 'bg-transparent' : 'bg-white border-b border-gray-200'}`}>
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-[56px]">

              {/* Logo */}
              <Link to={createPageUrl('Home')} className="hover:opacity-70 transition-opacity flex-shrink-0">
                <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#1a1a1a]">22.</span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-5">
                {!exploreOpen && (
                  <>
                    <Link to={createPageUrl('Projects')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">Projects</Link>
                    <Link to={createPageUrl('ApplyArtist')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">For Creators</Link>
                    <Link to={createPageUrl('ApplyTeam')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">For Teams</Link>
                    <div className="relative">
                      <button onClick={() => setAcademyOpen(!academyOpen)}
                        className="flex items-center gap-1 text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">
                        Backed <ChevronDown className="w-3 h-3" />
                        <span className="inline-block w-1.5 h-1.5 bg-amber-600 rounded-sm" />
                      </button>
                      {academyOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                          <Link to={createPageUrl('BackedProjects')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setAcademyOpen(false)}>Projects Seeking Backing</Link>
                          <Link to={createPageUrl('HowBackingWorks')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setAcademyOpen(false)}>How Backing Works</Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </nav>

              {/* Desktop Search */}
              {!exploreOpen && (
                <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
                  <UnifiedSearch />
                </div>
              )}

              {/* Right Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Login: icon on mobile, text on desktop */}
                <div className="relative">
                  <Link
                    to={createPageUrl('SignIn')}
                    onMouseEnter={() => setShowLoginTooltip(true)}
                    onMouseLeave={() => setShowLoginTooltip(false)}
                    className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-[#1a1a1a] sm:hidden" />
                    <span className="hidden sm:inline text-sm font-medium text-[#1a1a1a]">Login</span>
                  </Link>
                  {showLoginTooltip && (
                    <div className="sm:hidden absolute top-full right-0 mt-1 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                      Login
                    </div>
                  )}
                </div>

                {/* Post a Project button - hidden on smallest screens */}
                <button
                  onClick={() => setExploreOpen(true)}
                  className="hidden sm:block px-3 sm:px-4 py-2 bg-black text-white hover:bg-gray-800 font-bold text-xs sm:text-sm rounded-md transition-colors whitespace-nowrap"
                >
                  Post a Project
                </button>

                {/* Hamburger - mobile only */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-5 h-5 text-[#1a1a1a]" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Slide-in Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[60]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-[280px] bg-white z-[70] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 h-[96px] border-b border-gray-100">
              <span className="text-xl font-black tracking-tighter text-[#1a1a1a]">22.</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={createPageUrl(link.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-[#1a1a1a] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100 mt-4">
                <button
                  onClick={() => { setMobileMenuOpen(false); setExploreOpen(true); }}
                  className="w-full px-4 py-3 bg-black text-white font-bold text-sm rounded-lg text-center"
                >
                  Post a Project
                </button>
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Mega Menu Overlay */}
      {exploreOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[35]" onClick={() => setExploreOpen(false)} />
          <div className="fixed top-[40px] left-0 right-0 h-[60px] bg-[#EDEDED] z-[39] rounded-t-[25px]" />
          <div className="fixed top-[100px] left-0 right-0 bg-[#EDEDED] z-[40] rounded-b-[25px]" style={{ height: '60vh' }}>
            <div className="flex h-full">
              <div className="w-[30%] bg-[#EDEDED] p-4 sm:p-8 overflow-y-auto rounded-bl-[25px]">
                <button onClick={() => setExploreOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-300 rounded transition-colors z-50">
                  <X className="w-5 h-5 text-[#666]" />
                </button>
                <div className="space-y-2">
                  {Object.entries(categoryInfo).map(([key, info]) => (
                    <div key={key}>
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
                        className={`w-full text-left px-3 sm:px-4 py-3 transition-colors flex items-center justify-between ${expandedCategory === key ? 'bg-gray-300 text-[#1a1a1a]' : 'text-[#999] hover:bg-gray-200 hover:text-[#666]'}`}
                      >
                        <div className="text-xs sm:text-sm font-medium">{info.title}</div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategory === key ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedCategory === key && (
                        <div className="px-3 sm:px-4 py-3 bg-gray-200 text-[#666] text-xs leading-relaxed whitespace-pre-line">{info.desc}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-[70%] bg-[#EDEDED] p-4 sm:p-8 overflow-y-auto rounded-br-[25px]">
                <NewProjectForm selectedCategory={expandedCategory || 'commercial'} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className={shouldHideMenus ? 'pt-0 pb-24' : 'pt-[96px] pb-28'}>
        {React.cloneElement(children, { editMode })}
      </main>

      {/* Bottom Floating Navigation */}
      {!shouldHideMenus && (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[calc(100vw-16px)]">
          <div className="bg-[#3a3a3a] rounded-2xl shadow-2xl backdrop-blur-sm border border-white/10">
            <div className="flex items-center px-2 py-2">
              {/* Logo / Edit trigger */}
              {currentPageName === 'Home' ? (
                <button
                  onMouseDown={() => { const t = setTimeout(() => setEditMode(true), 3000); setPressTimer(t); }}
                  onMouseUp={() => { if (pressTimer) { clearTimeout(pressTimer); setPressTimer(null); } }}
                  onMouseLeave={() => { if (pressTimer) { clearTimeout(pressTimer); setPressTimer(null); } }}
                  onTouchStart={() => { const t = setTimeout(() => setEditMode(true), 3000); setPressTimer(t); }}
                  onTouchEnd={() => { if (pressTimer) { clearTimeout(pressTimer); setPressTimer(null); } }}
                  className={`flex items-center justify-center px-2 py-1.5 rounded-lg transition-all mr-1 flex-shrink-0 ${editMode ? 'bg-white text-black' : 'hover:bg-white/5 text-white'}`}
                >
                  <span className="text-base font-black tracking-tighter">22.</span>
                </button>
              ) : (
                <Link to={createPageUrl('Home')} className="flex items-center justify-center px-2 py-1.5 hover:bg-white/5 rounded-lg transition-all mr-1 flex-shrink-0">
                  <span className="text-base font-black text-white tracking-tighter">22.</span>
                </Link>
              )}

              <div className="h-5 w-px bg-gray-600 mr-1 flex-shrink-0" />

              {editMode && currentPageName === 'Home' && (
                <button onClick={() => setEditMode(false)} className="px-2 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 bg-red-500 text-white hover:bg-red-600 mr-1">
                  Exit Edit
                </button>
              )}

              {bottomNav.map((item) => {
                const isActive = currentPageName === item.href;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.href)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                      item.highlight
                        ? 'bg-[#FFD700] text-black hover:bg-[#FFC700]'
                        : isActive
                          ? 'text-white bg-white/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Footer */}
      {!shouldHideMenus && (
        <footer className="bg-[#1a1a1a] text-white py-16">
          <div className="max-w-[1800px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
              <div>
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Studio22</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to={createPageUrl('Home')} className="hover:text-white">Platform</Link></li>
                  <li><Link to={createPageUrl('Services')} className="hover:text-white">About</Link></li>
                  <li><Link to={createPageUrl('BackedProjects')} className="hover:text-white">Backed Projects</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">For Clients</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to={createPageUrl('SubmitProject')} className="hover:text-white">Post a Project</Link></li>
                  <li><Link to={createPageUrl('Home')} className="hover:text-white">Browse Creators</Link></li>
                  <li><Link to={createPageUrl('Services')} className="hover:text-white">How It Works</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">For Creators</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to={createPageUrl('ApplyArtist')} className="hover:text-white">Join as Creator</Link></li>
                  <li><Link to={createPageUrl('Home')} className="hover:text-white">Browse Projects</Link></li>
                  <li><Link to={createPageUrl('Work')} className="hover:text-white">Showcase Work</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">For Teams</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to={createPageUrl('ApplyTeam')} className="hover:text-white">Join as Team</Link></li>
                  <li><Link to={createPageUrl('Home')} className="hover:text-white">Browse Projects</Link></li>
                  <li><Link to={createPageUrl('Services')} className="hover:text-white">Services</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Backing</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to={createPageUrl('BackedProjects')} className="hover:text-white">Projects Seeking Backing</Link></li>
                  <li><Link to={createPageUrl('HowBackingWorks')} className="hover:text-white">How Backing Works</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-sm uppercase tracking-wider">Legal</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
                  <li><a href="#" className="hover:text-white">Imprint</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-sm text-gray-400">© 2026 Studio22. All rights reserved.</div>
              <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Play className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}