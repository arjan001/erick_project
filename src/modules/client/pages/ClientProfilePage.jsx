import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ProjectOwner, Project, TeamMember, BillingInfo, Invoice, SecuritySettings, ActiveSession } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CountrySelector from '@/components/CountrySelector';
import { formatSocialMediaUrl } from '@/lib/socialMediaUtils';
import { Building2, Globe, Phone, Mail, Upload, Bell, Shield, Edit2, Save, X, Linkedin, Instagram, Twitter, Youtube, Trash2, FolderOpen, Users, CreditCard, Lock, Settings as SettingsIcon, Plus, Eye, MoreVertical, UserPlus, FileText, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

function ToggleRow({ title, description, checked, onChange, isLast }) {
  return (
    <div className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-black' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

export default function ClientProfilePage() {
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [billingInfo, setBillingInfo] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [securitySettings, setSecuritySettings] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  const [formData, setFormData] = useState({
    company: '', phone: '', website: '', bio: '', linkedin: '', instagram: '', twitter: '', youtube: '',
    city: '', country: ''
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        const owners = await ProjectOwner.filter({ email: parsedUser.email });
        if (owners.length > 0) {
          const o = owners[0];
          setOwner(o);
          setFormData({
            company: o.company || '', phone: o.phone || '', website: o.website || '', bio: o.bio || '',
            linkedin: o.linkedin || '', instagram: o.instagram || '', twitter: o.twitter || '', youtube: o.youtube || '',
            city: o.city || '', country: o.country || ''
          });
          setEmailNotifications(o.email_notifications ?? true);
          setProjectUpdates(o.project_updates ?? true);
          setProfilePublic(o.profile_public ?? true);
        }
      } catch (err) {
        console.error('Error fetching client profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Load projects for the Projects tab
  useEffect(() => {
    const loadProjects = async () => {
      if (user?.email && activeTab === 'projects') {
        setLoadingProjects(true);
        try {
          const userProjects = await Project.filter({ project_owner_email: user.email });
          setProjects(userProjects);
        } catch (err) {
          console.error('Error fetching projects:', err);
        } finally {
          setLoadingProjects(false);
        }
      }
    };
    loadProjects();
  }, [user, activeTab]);

  // Load team members for the Team tab
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (owner?.id && activeTab === 'team') {
        setLoadingTeam(true);
        try {
          const members = await TeamMember.filter({ client_id: owner.id });
          setTeamMembers(members);
        } catch (err) {
          console.error('Error fetching team members:', err);
        } finally {
          setLoadingTeam(false);
        }
      }
    };
    loadTeamMembers();
  }, [owner, activeTab]);

  // Load billing info for the Billing tab
  useEffect(() => {
    const loadBillingInfo = async () => {
      if (owner?.id && activeTab === 'billing') {
        setLoadingBilling(true);
        try {
          const billing = await BillingInfo.filter({ client_id: owner.id });
          const invoiceData = await Invoice.filter({ client_id: owner.id });
          setBillingInfo(billing);
          setInvoices(invoiceData);
        } catch (err) {
          console.error('Error fetching billing info:', err);
        } finally {
          setLoadingBilling(false);
        }
      }
    };
    loadBillingInfo();
  }, [owner, activeTab]);

  // Load security settings for the Security tab
  useEffect(() => {
    const loadSecuritySettings = async () => {
      if (owner?.id && activeTab === 'security') {
        setLoadingSecurity(true);
        try {
          const settings = await SecuritySettings.filter({ client_id: owner.id });
          const sessions = await ActiveSession.filter({ client_id: owner.id });
          setSecuritySettings(settings[0] || null);
          setActiveSessions(sessions);
        } catch (err) {
          console.error('Error fetching security settings:', err);
        } finally {
          setLoadingSecurity(false);
        }
      }
    };
    loadSecuritySettings();
  }, [owner, activeTab]);

  const handleSaveProfile = async () => {
    if (!owner) return;
    setSaving(true);
    try {
      const updated = await ProjectOwner.update(owner.id, { 
        company: formData.company, 
        phone: formData.phone, 
        website: formData.website, 
        bio: formData.bio,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        twitter: formData.twitter,
        youtube: formData.youtube,
        city: formData.city,
        country: formData.country
      });
      setOwner(updated);
      success('Profile Updated', 'Your profile has been saved');
      setEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      toastError('Save Failed', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBio = async () => {
    if (!owner) return;
    try {
      const updated = await ProjectOwner.update(owner.id, { bio: formData.bio });
      setOwner(updated);
      success('Bio Updated', 'Your bio has been updated');
      setShowBioModal(false);
    } catch (err) {
      console.error('Error saving bio:', err);
      toastError('Save Failed', 'Failed to save bio');
    }
  };

  const handleSavePreferences = async () => {
    if (!owner) return;
    try {
      const updated = await ProjectOwner.update(owner.id, {
        email_notifications: emailNotifications,
        project_updates: projectUpdates,
        profile_public: profilePublic
      });
      setOwner(updated);
      success('Preferences Updated', 'Your settings have been saved');
    } catch (err) {
      console.error('Error saving preferences:', err);
      toastError('Save Failed', 'Failed to update preferences');
    }
  };

  const handleDeleteAccount = async () => {
    if (!owner) return;
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including projects, jobs, and applications.')) {
      return;
    }
    
    try {
      await ProjectOwner.delete(owner.id);
      localStorage.removeItem('studio22_user');
      success('Account Deleted', 'Your account has been permanently deleted');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('Error deleting account:', err);
      toastError('Delete Failed', 'Failed to delete account. Please try again.');
    }
  };

  // Project CRUD operations
  const handleEditProject = (project) => {
    window.location.href = `/ClientPostProject?edit=${project.id}`;
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await Project.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      success('Project Deleted', 'Project has been deleted successfully');
    } catch (err) {
      toastError('Delete Failed', err.message || 'Failed to delete project');
    }
  };

  // Team CRUD operations
  const handleInviteTeamMember = async () => {
    if (!inviteEmail || !owner) return;
    try {
      await TeamMember.create({
        client_id: owner.id,
        email: inviteEmail,
        role: inviteRole,
        status: 'pending'
      });
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteModal(false);
      success('Invitation Sent', `Invitation sent to ${inviteEmail}`);
      // Reload team members
      const members = await TeamMember.filter({ client_id: owner.id });
      setTeamMembers(members);
    } catch (err) {
      toastError('Invite Failed', err.message || 'Failed to send invitation');
    }
  };

  const handleRemoveTeamMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await TeamMember.delete(memberId);
      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
      success('Member Removed', 'Team member has been removed');
    } catch (err) {
      toastError('Remove Failed', err.message || 'Failed to remove team member');
    }
  };

  // Billing CRUD operations
  const handleAddPaymentMethod = async (paymentData) => {
    if (!owner) return;
    try {
      await BillingInfo.create({
        client_id: owner.id,
        ...paymentData,
        is_default: billingInfo.length === 0
      });
      setShowAddPaymentModal(false);
      success('Payment Method Added', 'Payment method has been added successfully');
      // Reload billing info
      const billing = await BillingInfo.filter({ client_id: owner.id });
      setBillingInfo(billing);
    } catch (err) {
      toastError('Add Failed', err.message || 'Failed to add payment method');
    }
  };

  const handleDeletePaymentMethod = async (paymentId) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    try {
      await BillingInfo.delete(paymentId);
      setBillingInfo(billingInfo.filter(b => b.id !== paymentId));
      success('Payment Method Removed', 'Payment method has been removed');
    } catch (err) {
      toastError('Delete Failed', err.message || 'Failed to remove payment method');
    }
  };

  // Security CRUD operations
  const handleToggle2FA = async () => {
    if (!owner) return;
    try {
      if (securitySettings) {
        await SecuritySettings.update(securitySettings.id, {
          two_factor_enabled: !securitySettings.two_factor_enabled
        });
        setSecuritySettings({
          ...securitySettings,
          two_factor_enabled: !securitySettings.two_factor_enabled
        });
      } else {
        const newSettings = await SecuritySettings.create({
          client_id: owner.id,
          two_factor_enabled: true
        });
        setSecuritySettings(newSettings);
      }
      success('2FA Updated', 'Two-factor authentication has been updated');
    } catch (err) {
      toastError('Update Failed', err.message || 'Failed to update 2FA settings');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!confirm('Are you sure you want to revoke this session?')) return;
    try {
      await ActiveSession.delete(sessionId);
      setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
      success('Session Revoked', 'Session has been revoked successfully');
    } catch (err) {
      toastError('Revoke Failed', err.message || 'Failed to revoke session');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !owner) return;
    
    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    setUploadingLogo(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url || response.data?.url;
      if (!fileUrl) {
        throw new Error('No file URL returned from upload service');
      }
      const updated = await ProjectOwner.update(owner.id, { profile_photo_url: fileUrl });
      setOwner(updated);
      setPreviewUrl(null); // Clear preview after successful upload
      success('Photo Updated', 'Your profile photo has been updated');
    } catch (err) {
      console.error('Error uploading photo:', err);
      toastError('Upload Failed', `Failed to upload photo: ${err.message || 'Unknown error'}`);
      setPreviewUrl(null); // Clear preview on error
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Client Profile</h1>
            <p className="text-gray-500 text-sm sm:text-base">Manage your company profile, contact info and preferences</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-4 sm:gap-8 overflow-x-auto">
              <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Profile</button>
              <button onClick={() => setActiveTab('projects')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'projects' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Projects</button>
              <button onClick={() => setActiveTab('team')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Team</button>
              <button onClick={() => setActiveTab('billing')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'billing' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Billing</button>
              <button onClick={() => setActiveTab('settings')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Account Settings</button>
              <button onClick={() => setActiveTab('security')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'security' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Security</button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="flex items-start gap-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : owner?.profile_photo_url ? (
                      <img src={owner.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800">
                    {uploadingLogo ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-white" />
                    )}
                    <input type="file" accept="image/*,.gif,.jpg,.jpeg,.png,.jfif,.webp,.bmp,.tiff" onChange={handleLogoUpload} disabled={uploadingLogo} className="hidden" />
                  </label>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{formData.company || user.full_name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>
                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => setEditing(!editing)} variant={editing ? 'outline' : 'default'} className={editing ? '' : 'bg-black text-white hover:bg-gray-800'}>
                      {editing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                      {editing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                    <Button onClick={() => setShowBioModal(true)} variant="outline">
                      Edit Bio
                    </Button>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              {editing ? (
                <div className="bg-gray-50 rounded-2xl p-8 space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Company Name</label>
                      <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Your company name" className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />Phone</label>
                      <Input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" />Website</label>
                      <Input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://yourcompany.com" className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                      <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                      <CountrySelector value={formData.country} onChange={(val) => setFormData({ ...formData, country: val })} />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={saving} className="bg-black text-white hover:bg-gray-800 rounded-lg">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600"><Mail className="w-4 h-4" />{user.email}</div>
                      {formData.phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4" />{formData.phone}</div>}
                      {formData.website && <div className="flex items-center gap-2 text-gray-600"><Globe className="w-4 h-4" /><a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">{formData.website}</a></div>}
                      {formData.city && formData.country && <p className="text-gray-600">{formData.city}, {formData.country}</p>}
                    </div>
                  </div>
                  {formData.bio && (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">About</h3>
                      <p className="text-gray-600">{formData.bio}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Social Links */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: formatSocialMediaUrl('linkedin', e.target.value) })} placeholder="username" />
                    ) : (
                      <p className="text-gray-900 flex-1">{owner?.linkedin || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: formatSocialMediaUrl('instagram', e.target.value) })} placeholder="username" />
                    ) : (
                      <p className="text-gray-900 flex-1">{owner?.instagram || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.twitter} onChange={(e) => setFormData({ ...formData, twitter: formatSocialMediaUrl('twitter', e.target.value) })} placeholder="username" />
                    ) : (
                      <p className="text-gray-900 flex-1">{owner?.twitter || 'Not set'}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Youtube className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    {editing ? (
                      <Input className="rounded-lg flex-1" value={formData.youtube} onChange={(e) => setFormData({ ...formData, youtube: formatSocialMediaUrl('youtube', e.target.value) })} placeholder="channel" />
                    ) : (
                      <p className="text-gray-900 flex-1">{owner?.youtube || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="max-w-6xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><FolderOpen className="w-5 h-5 text-gray-400" /> My Projects</h3>
                  <p className="text-gray-500 text-sm mt-1">View and manage all your posted projects</p>
                </div>
                <Button onClick={() => window.location.href = '/ClientPostProject'} className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>

              {loadingProjects ? (
                <div className="text-center py-8 text-gray-500">Loading projects...</div>
              ) : projects.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-4">Start by posting your first project to connect with talented creators</p>
                  <Button onClick={() => window.location.href = '/ClientPostProject'} className="bg-black text-white hover:bg-gray-800">
                    Post Your First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 text-lg">{project.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              project.status === 'verified' ? 'bg-green-100 text-green-700' :
                              project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              project.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {project.status || 'Draft'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Project Type: {project.project_type}</span>
                            {project.budget_range && <span>Budget: {project.budget_range}</span>}
                            {project.location_country && <span>Location: {project.location_country}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProject(project)}
                            className="text-gray-700 hover:text-gray-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="max-w-6xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Users className="w-5 h-5 text-gray-400" /> Team Members</h3>
                  <p className="text-gray-500 text-sm mt-1">Manage team members who can access your account</p>
                </div>
                <Button onClick={() => setShowInviteModal(true)} className="bg-black text-white hover:bg-gray-800">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </div>

              {loadingTeam ? (
                <div className="text-center py-8 text-gray-500">Loading team members...</div>
              ) : teamMembers.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
                  <p className="text-gray-500 mb-4">Invite team members to collaborate on your projects</p>
                  <Button onClick={() => setShowInviteModal(true)} className="bg-black text-white hover:bg-gray-800">
                    Invite Your First Team Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{member.full_name || member.email}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                member.status === 'active' ? 'bg-green-100 text-green-700' :
                                member.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {member.status}
                              </span>
                            </div>
                            <p className="text-gray-500 text-sm">{member.email}</p>
                            <p className="text-gray-400 text-xs mt-1 capitalize">Role: {member.role}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="max-w-6xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><CreditCard className="w-5 h-5 text-gray-400" /> Billing Information</h3>
                  <p className="text-gray-500 text-sm mt-1">Manage payment methods and billing history</p>
                </div>
                <Button onClick={() => setShowAddPaymentModal(true)} className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>

              {loadingBilling ? (
                <div className="text-center py-8 text-gray-500">Loading billing information...</div>
              ) : (
                <div className="space-y-6">
                  {/* Payment Methods */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Payment Methods</h4>
                    {billingInfo.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No payment methods added</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {billingInfo.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <CreditCard className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900 capitalize">{payment.payment_method_type}</p>
                                {payment.is_default && <span className="text-xs text-gray-500">Default</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePaymentMethod(payment.id)}
                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Billing History */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Billing History</h4>
                    {invoices.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No billing history</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {invoices.map((invoice) => (
                          <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                                <p className="text-sm text-gray-500">{new Date(invoice.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-gray-900">${invoice.amount}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                invoice.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {invoice.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-6xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-gray-400" /> Security Settings</h3>
                  <p className="text-gray-500 text-sm mt-1">Manage your account security and active sessions</p>
                </div>
              </div>

              {loadingSecurity ? (
                <div className="text-center py-8 text-gray-500">Loading security settings...</div>
              ) : (
                <div className="space-y-6">
                  {/* Password */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Password</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-500">
                          Last changed: {securitySettings?.password_last_changed 
                            ? new Date(securitySettings.password_last_changed).toLocaleDateString()
                            : 'Never'}
                        </p>
                      </div>
                      <Button variant="outline" className="text-sm">Change Password</Button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">2FA Status</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleToggle2FA}
                        className={`text-sm ${
                          securitySettings?.two_factor_enabled
                            ? 'text-red-600 hover:text-red-700 hover:border-red-300'
                            : ''
                        }`}
                      >
                        {securitySettings?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </Button>
                    </div>
                    {securitySettings?.two_factor_enabled && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          <span className="font-medium">2FA is enabled</span> - Your account is protected with two-factor authentication.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Active Sessions</h4>
                    <p className="text-sm text-gray-500 mb-4">Manage your active login sessions</p>
                    {activeSessions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No active sessions</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeSessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <Monitor className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{session.device_type || 'Unknown Device'}</p>
                                <p className="text-sm text-gray-500">
                                  {session.browser} • {session.location_country || 'Unknown Location'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Last active: {new Date(session.last_activity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeSession(session.id)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              Revoke
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-3xl space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-gray-400" /> Notifications</h3>
                <ToggleRow title="Email Notifications" description="Get emailed about applications and messages" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                <ToggleRow title="Project Updates" description="Get notified about your project's progress" checked={projectUpdates} onChange={() => setProjectUpdates(!projectUpdates)} isLast />
                <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 rounded-lg py-2.5 mt-4">Save Notification Preferences</Button>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-gray-400" /> Privacy</h3>
                <ToggleRow title="Public Profile" description="Allow creators to view your company profile" checked={profilePublic} onChange={() => setProfilePublic(!profilePublic)} isLast />
                <Button onClick={handleSavePreferences} className="w-full bg-black text-white hover:bg-gray-800 rounded-lg py-2.5 mt-4">Save Privacy Settings</Button>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-bold text-red-900 text-base mb-4 flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-600" /> Danger Zone</h3>
                <p className="text-sm text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <Button onClick={handleDeleteAccount} variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-lg py-2.5">Delete Account</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bio Modal */}
      {showBioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Bio</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowBioModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="Tell creators about your company..."
            />
          <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setShowBioModal(false)}>Cancel</Button>
              <Button onClick={handleSaveBio} className="bg-black text-white hover:bg-gray-800">Save Bio</Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Team Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Invite Team Member</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowInviteModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="team@company.com"
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="member">Team Member</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                <Button onClick={handleInviteTeamMember} className="bg-black text-white hover:bg-gray-800">Send Invitation</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}