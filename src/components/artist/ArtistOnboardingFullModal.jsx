import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Artist } from '@/lib/supabaseEntities';
import { FILM_ROLES_BY_CATEGORY, ALL_FILM_ROLES } from '@/lib/filmRoles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, ArrowRight, ArrowLeft, Check, Plus, X as XIcon } from 'lucide-react';
import { useToast } from '@/hooks/useToast.jsx';

export default function ArtistOnboardingFullModal({ user, onClose }) {
  const { success, error: toastError } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleSearch, setRoleSearch] = useState('');

  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', role: '', roles: [],
    based_in_city: '', based_in_country: '', languages_spoken: [],
    website: '', instagram: '', vimeo: '', imdb: '', linkedin: '',
    skills_experience: [],
  });

  useEffect(() => {
    const fetchArtist = async () => {
      if (!user?.email) return;
      try {
        const artists = await Artist.filter({ email: user.email });
        if (artists?.[0]) {
          const a = artists[0];
          setArtist(a);
          setFormData({
            full_name: a.full_name || user.full_name || '',
            email: a.email || user.email || '',
            phone: a.phone || '',
            role: a.role || '',
            roles: a.roles || a.secondary_roles || [],
            based_in_city: a.based_in_city || '',
            based_in_country: a.based_in_country || '',
            languages_spoken: a.languages_spoken || [],
            website: a.website || '',
            instagram: a.instagram || '',
            vimeo: a.vimeo || '',
            imdb: a.imdb || '',
            linkedin: a.linkedin || '',
            skills_experience: a.skills_experience || [],
          });
        }
      } catch (err) {
        console.error('Error fetching artist:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [user]);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleRole = (role) => {
    update('roles', formData.roles.includes(role)
      ? formData.roles.filter(r => r !== role)
      : [...formData.roles, role]);
    if (!formData.role) update('role', role);
  };

  const addSkill = () => {
    update('skills_experience', [...formData.skills_experience, { skill: '', years: 0 }]);
  };

  const updateSkill = (idx, field, value) => {
    update('skills_experience', formData.skills_experience.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeSkill = (idx) => {
    update('skills_experience', formData.skills_experience.filter((_, i) => i !== idx));
  };

  const canProceed = () => {
    if (step === 1) return formData.full_name && formData.based_in_country;
    if (step === 2) return formData.roles.length > 0 || formData.role;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const primaryRole = formData.role || formData.roles[0] || 'director';
      await Artist.update(artist.id, {
        full_name: formData.full_name,
        phone: formData.phone,
        role: primaryRole,
        roles: formData.roles.length > 0 ? formData.roles : [primaryRole],
        secondary_roles: formData.roles,
        based_in_city: formData.based_in_city,
        based_in_country: formData.based_in_country,
        languages_spoken: formData.languages_spoken,
        website: formData.website,
        instagram: formData.instagram,
        vimeo: formData.vimeo,
        imdb: formData.imdb,
        linkedin: formData.linkedin,
        skills_experience: formData.skills_experience,
        onboarding_completed: true,
      });
      success('Profile Complete', 'Your artist profile has been updated');
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
      toastError('Save Failed', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const steps = ['Details', 'Roles', 'Skills & Links', 'Review'];

  const filteredRoles = roleSearch
    ? ALL_FILM_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase()))
    : ALL_FILM_ROLES;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto my-8 shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Complete Your Artist Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Step {step} of {steps.length} — {steps[step - 1]}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${i + 1 < step ? 'bg-gray-900 text-white' : i + 1 === step ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i + 1 < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${i + 1 < step ? 'bg-gray-900' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Full Name *</label><Input value={formData.full_name} onChange={e => update('full_name', e.target.value)} /></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><Input value={formData.email} disabled className="bg-gray-50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Phone (WhatsApp)</label><Input value={formData.phone} onChange={e => update('phone', e.target.value)} placeholder="+31..." /></div>
                <div><label className="block text-sm font-medium mb-1">Languages (comma separated)</label><Input value={formData.languages_spoken.join(', ')} onChange={e => update('languages_spoken', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="English, Dutch" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">City</label><Input value={formData.based_in_city} onChange={e => update('based_in_city', e.target.value)} /></div>
                <div><label className="block text-sm font-medium mb-1">Country *</label><Input value={formData.based_in_country} onChange={e => update('based_in_country', e.target.value)} placeholder="Netherlands" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select your roles (you can choose multiple)</label>
                <Input value={roleSearch} onChange={e => setRoleSearch(e.target.value)} placeholder="Search roles..." className="mb-3" />
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3">
                  {Object.entries(FILM_ROLES_BY_CATEGORY).map(([category, roles]) => {
                    const visible = roles.filter(r => !roleSearch || r.toLowerCase().includes(roleSearch.toLowerCase()));
                    if (visible.length === 0) return null;
                    return (
                      <div key={category}>
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">{category}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {visible.map(role => (
                            <button key={role} onClick={() => toggleRole(role)} className={`px-2.5 py-1 text-xs rounded-full transition-colors ${formData.roles.includes(role) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                              {role} {formData.roles.includes(role) && <XIcon className="inline w-3 h-3 ml-1" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {formData.roles.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Selected roles ({formData.roles.length}):</div>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.roles.map(r => (
                        <span key={r} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1">{r} <button onClick={() => toggleRole(r)}><XIcon className="w-3 h-3" /></button></span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Skills & Experience</label>
                  <button onClick={addSkill} className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"><Plus className="w-3 h-3" /> Add Skill</button>
                </div>
                {formData.skills_experience.length === 0 && <p className="text-sm text-gray-400">No skills added yet</p>}
                <div className="space-y-2">
                  {formData.skills_experience.map((s, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={s.skill} onChange={e => updateSkill(idx, 'skill', e.target.value)} placeholder="Skill (e.g., DaVinci Resolve)" className="flex-1" />
                      <Input type="number" value={s.years} onChange={e => updateSkill(idx, 'years', parseInt(e.target.value) || 0)} placeholder="Years" className="w-24" />
                      <button onClick={() => removeSkill(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><XIcon className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div><label className="block text-sm font-medium mb-1">Website</label><Input value={formData.website} onChange={e => update('website', e.target.value)} placeholder="https://..." /></div>
                <div><label className="block text-sm font-medium mb-1">Instagram</label><Input value={formData.instagram} onChange={e => update('instagram', e.target.value)} placeholder="@username" /></div>
                <div><label className="block text-sm font-medium mb-1">Vimeo</label><Input value={formData.vimeo} onChange={e => update('vimeo', e.target.value)} placeholder="vimeo.com/..." /></div>
                <div><label className="block text-sm font-medium mb-1">IMDb</label><Input value={formData.imdb} onChange={e => update('imdb', e.target.value)} placeholder="imdb.com/name/..." /></div>
                <div><label className="block text-sm font-medium mb-1">LinkedIn</label><Input value={formData.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="linkedin.com/in/..." /></div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Review your profile</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div><span className="text-gray-500">Name:</span> {formData.full_name}</div>
                <div><span className="text-gray-500">Location:</span> {formData.based_in_city}, {formData.based_in_country}</div>
                <div><span className="text-gray-500">Roles:</span> <div className="flex flex-wrap gap-1 mt-1">{formData.roles.map(r => <span key={r} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">{r}</span>)}</div></div>
                <div><span className="text-gray-500">Skills:</span> {formData.skills_experience.length} skills</div>
                {formData.website && <div><span className="text-gray-500">Website:</span> {formData.website}</div>}
                {formData.instagram && <div><span className="text-gray-500">Instagram:</span> {formData.instagram}</div>}
              </div>
              <p className="text-xs text-gray-400">You can edit your profile anytime from your dashboard settings.</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-100 p-6 flex justify-between bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : onClose()} disabled={saving} className="rounded-lg">
            {step > 1 ? <><ArrowLeft className="w-4 h-4 mr-2" /> Back</> : 'Skip for now'}
          </Button>
          {step < 4 ? (
            <Button onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed()} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">
              Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">
              {saving ? 'Saving...' : <><Check className="w-4 h-4 mr-2" /> Complete Profile</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}