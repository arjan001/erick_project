import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Button } from '@/components/ui/button';
import { Globe, Instagram, Linkedin, Check, User as UserIcon, Bell, Shield } from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/sweetAlert';

const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

function ToggleRow({ title, description, checked, onChange, isLast }) {
  return (
    <div className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [artist, setArtist] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [vimeo, setVimeo] = useState('');
  const [imdb, setImdb] = useState('');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);

  const [profilePublic, setProfilePublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setEmail(userData.email);

    const fetchArtist = async () => {
      try {
        const artistData = await base44.entities.Artist.filter({ email: userData.email });
        if (artistData.length > 0) {
          const a = artistData[0];
          setArtist(a);
          setPhone(a.phone || '');
          setWebsite(a.website || '');
          setInstagram(a.instagram || '');
          setLinkedin(a.linkedin || '');
          setVimeo(a.vimeo || '');
          setImdb(a.imdb || '');
        }
      } catch (err) {
        console.error('Error fetching artist:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!artist) return;
    try {
      await base44.entities.Artist.update(artist.id, { phone, website, instagram, linkedin, vimeo, imdb });
      setArtist({ ...artist, phone, website, instagram, linkedin, vimeo, imdb });
      notifySuccess('Profile Updated', 'Your contact info has been saved');
    } catch (err) {
      console.error('Error saving profile:', err);
      notifyError('Save Failed', 'Failed to update profile');
    }
  };

  const handleSavePreferences = async () => {
    if (!artist) return;
    try {
      await base44.entities.Artist.update(artist.id, {
        email_notifications: emailNotifications,
        job_alerts: jobAlerts,
        message_notifications: messageNotifications,
        profile_public: profilePublic,
        show_email: showEmail,
        show_phone: showPhone
      });
      notifySuccess('Preferences Updated', 'Your preferences have been saved');
    } catch (err) {
      console.error('Error saving preferences:', err);
      notifyError('Save Failed', 'Failed to update preferences');
    }
  };

  if (!user || loading) return null;

  const tabs = [
    { id: 'profile', label: 'Contact & Social', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ArtistSidebar />

      <main className="w-full pl-20">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-500 mb-8">Manage your account, notifications and privacy</p>

          {/* Profile header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user?.full_name || 'Artist'}</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white border border-gray-100 rounded-xl p-1.5 shadow-sm w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Contact & Social Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                <input type="email" value={email} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-500 bg-gray-50 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Phone (WhatsApp)</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" /> Website
                </label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-indigo-500" /> Instagram Username
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 px-4 py-2.5 bg-gray-50 border border-gray-200 border-r-0 rounded-l-xl">@</span>
                  <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="yourusername" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-r-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-indigo-500" /> LinkedIn Username
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 px-4 py-2.5 bg-gray-50 border border-gray-200 border-r-0 rounded-l-xl">in/</span>
                  <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="yourprofile" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-r-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Vimeo Profile</label>
                <input type="url" value={vimeo} onChange={(e) => setVimeo(e.target.value)} placeholder="https://vimeo.com/yourprofile" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">IMDb Profile</label>
                <input type="url" value={imdb} onChange={(e) => setImdb(e.target.value)} placeholder="https://imdb.com/name/nm0000000" className={inputClass} />
              </div>

              <Button onClick={handleSaveProfile} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5">
                <Check className="w-4 h-4 mr-2" /> Save Contact Info
              </Button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl space-y-6">
              <div>
                <ToggleRow title="Email Notifications" description="Receive email updates about activity" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                <ToggleRow title="Job Alerts" description="Get notified about new job opportunities" checked={jobAlerts} onChange={() => setJobAlerts(!jobAlerts)} />
                <ToggleRow title="Message Notifications" description="Get notified when you receive messages" checked={messageNotifications} onChange={() => setMessageNotifications(!messageNotifications)} isLast />
              </div>
              <Button onClick={handleSavePreferences} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5">
                <Check className="w-4 h-4 mr-2" /> Save Preferences
              </Button>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl space-y-6">
              <div>
                <ToggleRow title="Public Profile" description="Allow others to view your profile" checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} />
                <ToggleRow title="Show Email Address" description="Display email on your public profile" checked={showEmail} onChange={() => setShowEmail(!showEmail)} />
                <ToggleRow title="Show Phone Number" description="Display phone on your public profile" checked={showPhone} onChange={() => setShowPhone(!showPhone)} isLast />
              </div>
              <Button onClick={handleSavePreferences} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5">
                <Check className="w-4 h-4 mr-2" /> Save Privacy Settings
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}