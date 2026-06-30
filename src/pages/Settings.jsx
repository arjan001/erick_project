import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Button } from '@/components/ui/button';
import { Globe, Instagram, Linkedin, Trash2, Plus, Check, X } from 'lucide-react';
import { notifySuccess, notifyError } from '@/lib/sweetAlert';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [artist, setArtist] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // Profile fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [vimeo, setVimeo] = useState('');
  const [imdb, setImdb] = useState('');

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);

  // Privacy settings
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
      await base44.entities.Artist.update(artist.id, {
        phone,
        website,
        instagram,
        linkedin,
        vimeo,
        imdb
      });
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

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />

      <main className="w-full h-full overflow-auto pl-20">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 font-semibold transition-colors relative ${
                activeTab === 'profile' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Contact & Social
              {activeTab === 'profile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 font-semibold transition-colors relative ${
                activeTab === 'notifications' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Notifications
              {activeTab === 'notifications' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-4 px-1 font-semibold transition-colors relative ${
                activeTab === 'privacy' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Privacy
              {activeTab === 'privacy' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
            </button>
          </div>

          {/* Contact & Social Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-600 bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Phone (WhatsApp)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4" /> Instagram Username
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 px-4 py-2 bg-gray-50 border border-gray-300 border-r-0 rounded-l-lg">@</span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="yourusername"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg text-gray-900 focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Linkedin className="w-4 h-4" /> LinkedIn Username
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 px-4 py-2 bg-gray-50 border border-gray-300 border-r-0 rounded-l-lg">in/</span>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="yourprofile"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg text-gray-900 focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>

              {/* Vimeo */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Vimeo Profile</label>
                <input
                  type="url"
                  value={vimeo}
                  onChange={(e) => setVimeo(e.target.value)}
                  placeholder="https://vimeo.com/yourprofile"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* IMDb */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">IMDb Profile</label>
                <input
                  type="url"
                  value={imdb}
                  onChange={(e) => setImdb(e.target.value)}
                  placeholder="https://imdb.com/name/nm0000000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-400"
                />
              </div>

              <Button onClick={handleSaveProfile} className="w-full bg-black text-white hover:bg-gray-800 py-2">
                <Check className="w-4 h-4 mr-2" /> Save Contact Info
              </Button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive email updates about activity</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Job Alerts */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Job Alerts</h3>
                    <p className="text-sm text-gray-600">Get notified about new job opportunities</p>
                  </div>
                  <button
                    onClick={() => setJobAlerts(!jobAlerts)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      jobAlerts ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      jobAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Message Notifications */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Message Notifications</h3>
                    <p className="text-sm text-gray-600">Get notified when you receive messages</p>
                  </div>
                  <button
                    onClick={() => setMessageNotifications(!messageNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      messageNotifications ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      messageNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 py-2">
                <Check className="w-4 h-4 mr-2" /> Save Preferences
              </Button>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {/* Public Profile */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Public Profile</h3>
                    <p className="text-sm text-gray-600">Allow others to view your profile</p>
                  </div>
                  <button
                    onClick={() => setProfilePublic(!profilePublic)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profilePublic ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      profilePublic ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Show Email */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Show Email Address</h3>
                    <p className="text-sm text-gray-600">Display email on your public profile</p>
                  </div>
                  <button
                    onClick={() => setShowEmail(!showEmail)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showEmail ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showEmail ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Show Phone */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Show Phone Number</h3>
                    <p className="text-sm text-gray-600">Display phone on your public profile</p>
                  </div>
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showPhone ? 'bg-black' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showPhone ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 py-2">
                <Check className="w-4 h-4 mr-2" /> Save Privacy Settings
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}