import React, { useState, useEffect } from 'react';
import { Artist, Subscription } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Globe, Instagram, Linkedin, Check, Bell, Shield, Phone, Film, Star, Crown, Save } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import SubscriptionBadge from '@/modules/artist/components/SubscriptionBadge';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all";

function ModernToggle({ title, description, checked, onChange, isLast }) {
  return (
    <div className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="flex-1 pr-4">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 flex-shrink-0 ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
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

  const [subscription, setSubscription] = useState(null);
  const [subPackage, setSubPackage] = useState(null);

  React.useEffect(() => {
    const fetchSub = async () => {
      if (!userEmail) return;
      try {
        const subs = await Subscription.filter({ user_email: userEmail, status: 'active' });
        if (subs?.[0]) {
          setSubscription(subs[0]);
          const { SubscriptionPackage } = await import('@/lib/supabaseEntities');
          const pkgs = await SubscriptionPackage.filter({ id: subs[0].package_id });
          if (pkgs?.[0]) setSubPackage(pkgs[0]);
        }
      } catch (e) { /* no subscription */ }
    };
    fetchSub();
  }, [userEmail]);

  const handleSaveContact = async () => {
    if (!artist) return;
    try {
      const updated = await Artist.update(artist.id, { phone, website, instagram, linkedin, vimeo, imdb });
      onUpdate(updated);
      success('Saved', 'Your contact info has been updated');
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
      success('Saved', 'Your preferences have been updated');
    } catch (err) {
      console.error('Error saving preferences:', err);
      toastError('Save Failed', 'Failed to update preferences');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Subscription Status */}
      {subscription && subPackage && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-sm">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">{subPackage.name} Plan</h3>
              <p className="text-xs text-amber-700">Active subscription</p>
            </div>
          </div>
          <SubscriptionBadge subscription={subscription} package={subPackage} />
        </div>
      )}

      {/* Contact & Social */}
      <SectionCard title="Contact & Social Links" icon={Phone} action={
        <Button onClick={handleSaveContact} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg">
          <Save className="w-3.5 h-3.5 mr-1.5" /> Save
        </Button>
      }>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
            <input type="email" value={userEmail} disabled className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Phone (WhatsApp)</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" /> Website
              </label>
              <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-indigo-500" /> Instagram
              </label>
              <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@username" className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-indigo-500" /> LinkedIn
              </label>
              <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="LinkedIn URL" className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-indigo-500" /> Vimeo
              </label>
              <input type="url" value={vimeo} onChange={(e) => setVimeo(e.target.value)} placeholder="vimeo.com/..." className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">IMDb Profile</label>
            <input type="url" value={imdb} onChange={(e) => setImdb(e.target.value)} placeholder="https://imdb.com/name/..." className={inputClass} />
          </div>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications" icon={Bell} action={
        <Button onClick={handleSavePreferences} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg">
          <Save className="w-3.5 h-3.5 mr-1.5" /> Save
        </Button>
      }>
        <ModernToggle title="Email Notifications" description="Receive email updates about activity" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
        <ModernToggle title="Job Alerts" description="Get notified about new job opportunities" checked={jobAlerts} onChange={() => setJobAlerts(!jobAlerts)} />
        <ModernToggle title="Message Notifications" description="Get notified when you receive messages" checked={messageNotifications} onChange={() => setMessageNotifications(!messageNotifications)} isLast />
      </SectionCard>

      {/* Privacy */}
      <SectionCard title="Privacy" icon={Shield} action={
        <Button onClick={handleSavePreferences} size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg">
          <Save className="w-3.5 h-3.5 mr-1.5" /> Save
        </Button>
      }>
        <ModernToggle title="Public Profile" description="Allow others to view your profile" checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} />
        <ModernToggle title="Show Email Address" description="Display email on your public profile" checked={showEmail} onChange={() => setShowEmail(!showEmail)} />
        <ModernToggle title="Show Phone Number" description="Display phone on your public profile" checked={showPhone} onChange={() => setShowPhone(!showPhone)} isLast />
      </SectionCard>
    </div>
  );
}