import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Button } from '@/components/ui/button';
import { Bell, Lock, Share2, User, Globe, Mail, Phone, Plus, X, Edit2, Check, Instagram, Linkedin } from 'lucide-react';

const SOCIAL_PLATFORMS = [
  { name: 'Instagram', icon: Instagram, placeholder: '@username', key: 'instagram' },
  { name: 'LinkedIn', icon: Linkedin, placeholder: 'linkedin.com/in/username', key: 'linkedin' },
  { name: 'Website', icon: Globe, placeholder: 'https://yoursite.com', key: 'website' },
  { name: 'Vimeo', icon: Share2, placeholder: 'vimeo.com/username', key: 'vimeo' }
];

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [artist, setArtist] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile tab state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [socials, setSocials] = useState({});
  const [editingSocial, setEditingSocial] = useState(null);
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    jobInvitations: true,
    messages: true,
    newConnections: true,
    projectUpdates: true,
    weeklyDigest: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowConnections: true
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setEmail(parsedUser.email);
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchArtist = async () => {
      try {
        const artistData = await base44.entities.Artist.filter({ email: user.email });
        if (artistData.length > 0) {
          setArtist(artistData[0]);
          setPhone(artistData[0].phone || '');
          setSocials({
            instagram: artistData[0].instagram || '',
            linkedin: artistData[0].linkedin || '',
            website: artistData[0].website || '',
            vimeo: artistData[0].vimeo || '',
            imdb: artistData[0].imdb || ''
          });
        }
      } catch (err) {
        console.error('Error fetching artist:', err);
      }
    };

    fetchArtist();
  }, [user]);

  const handleSaveSocial = async (platform) => {
    if (!artist) return;
    try {
      await base44.entities.Artist.update(artist.id, {
        [platform.key]: socials[platform.key]
      });
      setEditingSocial(null);
    } catch (err) {
      console.error('Error saving social:', err);
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!user) return null;

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />
      
      <main className="w-full h-full overflow-auto pl-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 px-12">
          <h1 className="text-3xl font-bold">Settings & Preferences</h1>
          <p className="text-gray-300 mt-1">Manage your profile, notifications, and privacy</p>
        </div>

        <div className="p-12 max-w-4xl">
          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'privacy', label: 'Privacy', icon: Lock }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 font-semibold transition-colors relative flex items-center gap-2 ${
                    activeTab === tab.id ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
                </button>
              );
            })}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Email */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your primary login email</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                      />
                      <Button className="bg-black text-white hover:bg-gray-800">Save</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Accounts */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Social Accounts & Links</h3>
                <div className="space-y-3">
                  {SOCIAL_PLATFORMS.map(platform => {
                    const Icon = platform.icon;
                    const isEditing = editingSocial === platform.key;
                    return (
                      <div key={platform.key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5 text-gray-600" />
                            <label className="font-semibold text-gray-900">{platform.name}</label>
                          </div>
                          {!isEditing && socials[platform.key] && (
                            <button
                              onClick={() => setEditingSocial(platform.key)}
                              className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={socials[platform.key]}
                              onChange={(e) => setSocials(prev => ({ ...prev, [platform.key]: e.target.value }))}
                              placeholder={platform.placeholder}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveSocial(platform)}
                              className="bg-black text-white hover:bg-gray-800"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSocial(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : socials[platform.key] ? (
                          <p className="text-sm text-gray-700 break-all">{socials[platform.key]}</p>
                        ) : (
                          <button
                            onClick={() => setEditingSocial(platform.key)}
                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add account
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Email Notifications</h3>
              <div className="space-y-4">
                {[
                  { key: 'jobInvitations', label: 'Job Invitations', desc: 'Get notified when someone invites you to apply' },
                  { key: 'messages', label: 'New Messages', desc: 'Receive alerts for new messages' },
                  { key: 'newConnections', label: 'New Connections', desc: 'Be informed about new connection requests' },
                  { key: 'projectUpdates', label: 'Project Updates', desc: 'Updates about your ongoing projects' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of opportunities and activity' }
                ].map(item => (
                  <div key={item.key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange(item.key)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        notifications[item.key] ? 'bg-black' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Privacy Controls</h3>
              <div className="space-y-4">
                {[
                  { key: 'profilePublic', label: 'Public Profile', desc: 'Make your profile visible to other users' },
                  { key: 'showEmail', label: 'Show Email Address', desc: 'Display your email on your profile' },
                  { key: 'showPhone', label: 'Show Phone Number', desc: 'Display your phone number on your profile' },
                  { key: 'allowMessages', label: 'Allow Direct Messages', desc: 'Let others send you messages' },
                  { key: 'allowConnections', label: 'Allow Connection Requests', desc: 'Accept connection requests from other creatives' }
                ].map(item => (
                  <div key={item.key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => handlePrivacyChange(item.key)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        privacy[item.key] ? 'bg-black' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          privacy[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Danger Zone */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  Deactivate Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}