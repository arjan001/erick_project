import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, X, Instagram, Linkedin, Play } from 'lucide-react';
import TopBanner from './components/home/TopBanner';
import NewProjectForm from './components/NewProjectForm';
import UnifiedSearch from './components/UnifiedSearch';
import ArtistSidebar from './components/ArtistSidebar';
import ClientSidebar from './components/ClientSidebar';

export default function Layout({ children, currentPageName }) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [academyOpen, setAcademyOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('commercial');
  const [expandedCategory, setExpandedCategory] = useState('commercial');
  const [editMode, setEditMode] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
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
      setTimeout(() => {
        setShowLoadingScreen(false);
      }, 5000);
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
    commercial: {
      title: 'Commercial',
      desc: 'Brand films, ads, campaigns.\nClear structure. Clear budgets.'
    },
    short: {
      title: 'Short Film',
      desc: 'Narrative driven.\nScript heavy. Small to mid crews.'
    },
    feature: {
      title: 'Feature Film',
      desc: 'Full production planning.\nCast, locations, long schedule.'
    },
    music: {
      title: 'Music Video',
      desc: 'Visual first.\nShort schedule. Strong art direction.'
    },
    documentary: {
      title: 'Documentary',
      desc: 'Real world.\nFlexible planning. Research focused.'
    }
  };

  const bottomNav = [
    { name: 'Projects', href: 'Projects' },
    { name: 'Creators', href: 'ApplyArtist' },
    { name: 'Teams', href: 'ApplyTeam' },
    { name: 'Post Project', href: 'SubmitProject', highlight: true },
  ];

  return (
    <div className={`min-h-screen bg-white text-[#212121] ${exploreOpen ? 'overflow-hidden' : ''}`}>
      {/* Loading Screen */}
      {showLoadingScreen && (
        <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-gray-200 flex items-center justify-center animate-pulse">
            <span className="text-4xl font-black tracking-tighter text-[#1a1a1a]">22.</span>
          </div>
        </div>
      )}

      {/* Artist Sidebar (when logged in on artist pages) */}
      {user && isArtistPage && <ArtistSidebar />}
      
      {/* Client Sidebar (when logged in on client pages) */}
      {user && isClientPage && <ClientSidebar />}

      {/* Top Banner */}
      {!shouldHideMenus && <TopBanner />}

      {/* Main Header (Awwwards Style) */}
      {!shouldHideMenus && (<header className={`fixed top-[40px] left-0 right-0 z-[40] transition-colors ${exploreOpen ? 'bg-transparent' : 'bg-white border-b border-gray-200'}`}>
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between h-[60px]">
            {/* Left Navigation */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link 
                to={createPageUrl('ArtistDashboard')} 
                className="hover:opacity-70 transition-opacity"
              >
                <span className="text-2xl font-black tracking-tighter text-[#1a1a1a]">22.</span>
              </Link>

              {/* Main Nav */}
              <nav className="hidden lg:flex items-center gap-6">
                {!exploreOpen && (
                    <>
                      <Link to={createPageUrl('Projects')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">
                        Projects
                      </Link>
                    <Link to={createPageUrl('ApplyArtist')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">
                      For Creators
                    </Link>
                    <Link to={createPageUrl('ApplyTeam')} className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors">
                      For Teams
                    </Link>
                    <div className="relative">
                      <button 
                        onClick={() => setAcademyOpen(!academyOpen)}
                        className="flex items-center gap-1 text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors"
                      >
                        Backed <ChevronDown className="w-3 h-3" />
                        <span className="inline-block w-1.5 h-1.5 bg-amber-600 rounded-sm"></span>
                      </button>
                      {academyOpen && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                          <Link to={createPageUrl('BackedProjects')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Projects Seeking Backing
                          </Link>
                          <Link to={createPageUrl('HowBackingWorks')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            How Backing Works
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </nav>
            </div>

            {/* Center Search */}
            {!exploreOpen && (
              <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                <UnifiedSearch />
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('SignIn')}>
                <Button variant="ghost" size="sm" className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 hover:bg-transparent">
                  Login
                </Button>
              </Link>
              <button
                onClick={() => setExploreOpen(true)}
                className="px-4 py-2 bg-black text-white hover:bg-gray-800 font-bold text-sm rounded-md transition-colors"
              >
                Post a Project
              </button>
            </div>
          </div>
        </div>
        </header>
      )}

      {/* Mega Menu Overlay */}
      {exploreOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/30 z-[35]"
            onClick={() => setExploreOpen(false)}
          />

          {/* Top menu background - rounded cap */}
          <div className="fixed top-[40px] left-0 right-0 h-[60px] bg-[#EDEDED] z-[39] rounded-t-[25px]" />

          {/* Mega Menu Container */}
          <div className="fixed top-[100px] left-0 right-0 bg-[#EDEDED] z-[40] rounded-b-[25px]" style={{ height: '60vh' }}>
            <div className="flex h-full">
              {/* LEFT COLUMN - 30% width - Categories */}
              <div className="w-[30%] bg-[#EDEDED] p-8 overflow-y-auto rounded-bl-[25px]">
                <button 
                  onClick={() => setExploreOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-300 rounded transition-colors z-50"
                >
                  <X className="w-5 h-5 text-[#666]" />
                </button>

                <div className="space-y-2">
                  {Object.entries(categoryInfo).map(([key, info]) => (
                    <div key={key}>
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
                        className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between ${
                          expandedCategory === key 
                            ? 'bg-gray-300 text-[#1a1a1a]' 
                            : 'text-[#999] hover:bg-gray-200 hover:text-[#666]'
                        }`}
                      >
                        <div className="text-sm font-medium">{info.title}</div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedCategory === key ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedCategory === key && (
                        <div className="px-4 py-3 bg-gray-200 text-[#666] text-xs leading-relaxed whitespace-pre-line">
                          {info.desc}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN - 70% width - New Project Form */}
              <div className="w-[70%] bg-[#EDEDED] p-8 overflow-y-auto rounded-br-[25px]">
                <NewProjectForm selectedCategory={expandedCategory || 'commercial'} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className={shouldHideMenus ? 'pt-0 pb-24' : 'pt-[100px] pb-24'}>
        {React.cloneElement(children, { editMode })}
      </main>

        {/* Bottom Floating Navigation */}
        {!shouldHideMenus && (<nav className="fixed bottom-6 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 animate-slideUp">
        <div className="bg-[#3a3a3a] rounded-2xl shadow-2xl backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-0 px-2 md:px-3 py-2.5 overflow-x-auto scrollbar-hide">
            {currentPageName === 'Home' ? (
              <button
                onMouseDown={() => {
                  const timer = setTimeout(() => {
                    setEditMode(true);
                  }, 3000);
                  setPressTimer(timer);
                }}
                onMouseUp={() => {
                  if (pressTimer) {
                    clearTimeout(pressTimer);
                    setPressTimer(null);
                  }
                }}
                onMouseLeave={() => {
                  if (pressTimer) {
                    clearTimeout(pressTimer);
                    setPressTimer(null);
                  }
                }}
                onTouchStart={() => {
                  const timer = setTimeout(() => {
                    setEditMode(true);
                  }, 3000);
                  setPressTimer(timer);
                }}
                onTouchEnd={() => {
                  if (pressTimer) {
                    clearTimeout(pressTimer);
                    setPressTimer(null);
                  }
                }}
                className={`flex items-center justify-center px-2 md:px-3 py-2 rounded-lg transition-all mr-1 md:mr-2 flex-shrink-0 ${
                  editMode ? 'bg-white text-black' : 'hover:bg-white/5 text-white'
                }`}
                title={editMode ? 'Edit Mode Active' : 'Hold for 3 seconds to edit'}
              >
                <span className="text-base md:text-lg font-black tracking-tighter">22.</span>
              </button>
            ) : (
              <Link 
                to={user ? (isArtistPage ? createPageUrl('ArtistDashboard') : createPageUrl('TeamDashboard')) : createPageUrl('Home')}
                className="flex items-center justify-center px-2 md:px-3 py-2 hover:bg-white/5 rounded-lg transition-all mr-1 md:mr-2 flex-shrink-0"
              >
                <span className="text-base md:text-lg font-black text-white tracking-tighter">22.</span>
              </Link>
            )}

            <div className="h-6 w-px bg-gray-600 mr-1 md:mr-2 flex-shrink-0" />

            {editMode && currentPageName === 'Home' && (
              <button
                onClick={() => setEditMode(false)}
                className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 bg-red-500 text-white hover:bg-red-600"
              >
                Exit Edit Mode
              </button>
            )}

            {bottomNav.map((item) => {
               const isActive = currentPageName === item.href;
               return (
                 <Link
                   key={item.name}
                   to={createPageUrl(item.href)}
                   className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 relative ${
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

            <Link
              to={createPageUrl('BackedProjects')}
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 text-gray-300 hover:text-white hover:bg-white/5"
            >
              Backed
            </Link>

            <div className="h-6 w-px bg-gray-600 mx-1 md:mx-2 flex-shrink-0" />

            <Link
              to={createPageUrl('Admin')}
              className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap flex-shrink-0 text-gray-400 hover:text-white hover:bg-white/5"
            >
              Admin
            </Link>
          </div>
        </div>
      </nav>
      )}

        {/* Footer (Awwwards Style) */}
        {!shouldHideMenus && (<footer className="bg-[#1a1a1a] text-white py-16">
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
            <div className="text-sm text-gray-400">
              © 2026 Studio22. All rights reserved.
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Play className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          </div>
      </footer>
      )}
        </div>
        );
        }