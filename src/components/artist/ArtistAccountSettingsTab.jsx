import React, { useState } from 'react';
import { Artist } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Globe, Instagram, Linkedin, Check, Bell, Shield } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

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

export default function ArtistAccountSettingsTab({ artist, userEmail, onUpdate }) {
  const { success, error: toastError } = useToast();

  const [phone, setPhone] = useState(artist?.phone || '');
  const [vimeo, setVimeo] = useState(artist?.vimeo || '');
  const [imdb, setImdb] = useState(artist?.imdb || '');
  const [website, setWebsite] = useState(artist?.website || '');
  const [instagram, setInstagram] = useState(artist?.instagram || '');
  const [linkedin, setLinkedin] = useState(artist?.linkedin || '');

  const [emailNotifications, setEmailNotifications] = useState(artist?.email_notifications ?? true);
  const [jobAlerts, setJobAlerts] = useState(artist?.job_alerts ?? true);
  const [messageNotifications, setMessageNotifications] = useState(artist?.message_notifications ?? true);

  const [profilePublic, setProfilePublic] = useState(artist?.profile_public ?? true);
  const [showEmail, setShowEmail] = useState(artist?.show_email ?? false);
  const [showPhone, setShowPhone] = useState(artist?.show_phone ?? false);

  const handleSaveContact = async () => {
    if (!artist) return;
    try {
      const updated = await Artist.update(artist.id, { phone, website, instagram, linkedin, vimeo, imdb });
      onUpdate(updated);
      success('Profile Updated', 'Your contact info has been saved');
    } catch (err) {
      console.error('Error saving profile:', err);
      toastError('Save Failed', 'Failed to update profile');
    }
  };

  const handleSavePreferences = async () => {
    if (!artist) return;
    try {
      const updated = await Artist.update(artist.id, {
        email_notifications: emailNotifications,
        job_alerts: jobAlerts,
        message_notifications: messageNotifications,
        profile_public: profilePublic,
        show_email: showEmail,
        show_phone: showPhone
      });
      onUpdate(updated);
      success('Preferences Updated', 'Your preferences have been saved');
    } catch (err) {
      console.error('Error saving preferences:', err);
      toastError('Save Failed', 'Failed to update preferences');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="font-bold text-gray-900 text-base mb-1">Contact & Social</h3>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
          <input type="email" value={userEmail} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-500 bg-gray-50 cursor-not-allowed" />
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
            <Instagram className="w-4 h-4 text-indigo-500" /> Instagram
          </label>
          <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram URL or @username" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-indigo-500" /> LinkedIn
          </label>
          <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Vimeo Profile</label>
          <input type="url" value={vimeo} onChange={(e) => setVimeo(e.target.value)} placeholder="https://vimeo.com/yourprofile" className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">IMDb Profile</label>
          <input type="url" value={imdb} onChange={(e) => setImdb(e.target.value)} placeholder="https://imdb.com/name/nm0000000" className={inputClass} />
        </div>

        <Button onClick={handleSaveContact} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5">
          <Check className="w-4 h-4 mr-2" /> Save Contact Info
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-indigo-500" /> Notifications</h3>
        <ToggleRow title="Email Notifications" description="Receive email updates about activity" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
        <ToggleRow title="Job Alerts" description="Get notified about new job opportunities" checked={jobAlerts} onChange={() => setJobAlerts(!jobAlerts)} />
        <ToggleRow title="Message Notifications" description="Get notified when you receive messages" checked={messageNotifications} onChange={() => setMessageNotifications(!messageNotifications)} isLast />
        <Button onClick={handleSavePreferences} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5 mt-4">
          <Check className="w-4 h-4 mr-2" /> Save Notification Preferences
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-500" /> Privacy</h3>
        <ToggleRow title="Public Profile" description="Allow others to view your profile" checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} />
        <ToggleRow title="Show Email Address" description="Display email on your public profile" checked={showEmail} onChange={() => setShowEmail(!showEmail)} />
        <ToggleRow title="Show Phone Number" description="Display phone on your public profile" checked={showPhone} onChange={() => setShowPhone(!showPhone)} isLast />
        <Button onClick={handleSavePreferences} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl py-2.5 mt-4">
          <Check className="w-4 h-4 mr-2" /> Save Privacy Settings
        </Button>
      </div>
    </div>
  );
}