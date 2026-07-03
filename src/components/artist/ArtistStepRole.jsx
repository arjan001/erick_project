import React, { useState, useRef, useEffect } from 'react';
import { Video, Camera, Scissors, Briefcase, Box, Wand2, Palette, Music, Mic, User, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SKILLS_DATABASE } from '../SkillsDatabase';

const ROLES = [
  { value: 'director', label: 'Director', icon: Video },
  { value: 'cinematographer', label: 'Cinematographer', icon: Camera },
  { value: 'editor', label: 'Editor', icon: Scissors },
  { value: 'producer', label: 'Producer', icon: Briefcase },
  { value: '3d_artist', label: '3D Artist', icon: Box },
  { value: 'vfx_artist', label: 'VFX Artist', icon: Wand2 },
  { value: 'motion_designer', label: 'Motion Designer', icon: Palette },
  { value: 'sound_designer', label: 'Sound Designer', icon: Music },
  { value: 'music_composer', label: 'Music Composer', icon: Music },
  { value: 'voice_artist', label: 'Voice Artist', icon: Mic },
  { value: 'actor', label: 'Actor', icon: User },
];

export default function ArtistStepRole({ data, updateData }) {
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleSecondaryRole = (role) => {
    const current = data.secondary_roles || [];
    if (current.includes(role)) {
      updateData('secondary_roles', current.filter(r => r !== role));
      // Remove from skills_experience as well
      updateData('skills_experience', (data.skills_experience || []).filter(s => s.skill !== role));
    } else {
      updateData('secondary_roles', [...current, role]);
    }
  };

  const updateSkillExperience = (skill, years) => {
    const current = data.skills_experience || [];
    const existing = current.find(s => s.skill === skill);
    if (existing) {
      updateData('skills_experience', current.map(s => s.skill === skill ? { skill, years: Number(years) } : s));
    } else {
      updateData('skills_experience', [...current, { skill, years: Number(years) }]);
    }
  };

  const getSkillExperience = (skill) => {
    const exp = (data.skills_experience || []).find(s => s.skill === skill);
    return exp?.years || '';
  };

  const addSkillFromDatabase = (skill) => {
    const skillValue = skill.toLowerCase().replace(/\s+/g, '_');
    if (!(data.secondary_roles || []).includes(skillValue)) {
      updateData('secondary_roles', [...(data.secondary_roles || []), skillValue]);
      updateData('custom_skills', [...(data.custom_skills || []), { value: skillValue, label: skill }]);
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const updateCustomSkillExperience = (skillValue, years) => {
    const current = data.skills_experience || [];
    const existing = current.find(s => s.skill === skillValue);
    if (existing) {
      updateData('skills_experience', current.map(s => s.skill === skillValue ? { skill: skillValue, years: Number(years) } : s));
    } else {
      updateData('skills_experience', [...current, { skill: skillValue, years: Number(years) }]);
    }
  };

  const getCustomSkillExperience = (skillValue) => {
    const exp = (data.skills_experience || []).find(s => s.skill === skillValue);
    return exp?.years || '';
  };

  const removeCustomSkill = (value) => {
    updateData('secondary_roles', (data.secondary_roles || []).filter(r => r !== value));
    updateData('custom_skills', (data.custom_skills || []).filter(s => s.value !== value));
  };

  const isCustomSkill = (value) => {
    return (data.custom_skills || []).some(s => s.value === value);
  };

  const getSkillLabel = (value) => {
    const predefined = ROLES.find(r => r.value === value);
    if (predefined) return predefined.label;
    const custom = (data.custom_skills || []).find(s => s.value === value);
    return custom ? custom.label : value;
  };

  const filteredSkills = SKILLS_DATABASE.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !(data.secondary_roles || []).includes(skill.toLowerCase().replace(/\s+/g, '_'))
  ).slice(0, 20);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSkillDropdown(false);
      }
    };

    if (showSkillDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSkillDropdown]);

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">What's your primary role?</h2>
      <p className="text-gray-600 mb-8">Select your main specialty and years of experience</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = data.role === role.value;
          return (
            <button
              key={role.value}
              onClick={() => updateData('role', role.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-amber-600 bg-amber-600/10 text-black'
                  : 'border-gray-300 hover:border-gray-400 bg-white text-black'
              }`}
            >
              <Icon className={`w-6 h-6 mb-2 mx-auto ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
              <p className="text-sm font-medium text-center">{role.label}</p>
            </button>
          );
        })}
      </div>

      {data.role && (
        <div className="mb-8">
          <Label className="text-sm mb-2 block">Years of experience as {ROLES.find(r => r.value === data.role)?.label}</Label>
          <Input
            type="number"
            min="0"
            max="50"
            value={getSkillExperience(data.role)}
            onChange={(e) => updateSkillExperience(data.role, e.target.value)}
            placeholder="e.g., 5"
            className="bg-white border-gray-300 text-black h-10 max-w-xs"
          />
        </div>
      )}

      {data.role && (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-black">Additional skills (optional)</h3>
          <p className="text-sm text-gray-600 mb-4">Select any secondary roles you can perform</p>
          
          <div className="space-y-3">
            {ROLES.filter(r => r.value !== data.role).map((role) => {
              const Icon = role.icon;
              const isSelected = (data.secondary_roles || []).includes(role.value);
              return (
                <div key={role.value} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSecondaryRole(role.value)}
                    className={`flex-1 p-3 rounded-lg border transition-all text-left flex items-center gap-2 ${
                      isSelected
                        ? 'border-amber-600/50 bg-amber-600/5 text-black'
                        : 'border-gray-300 hover:border-gray-400 bg-white text-black'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                    <span className="text-sm">{role.label}</span>
                  </button>
                  {isSelected && (
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={getSkillExperience(role.value)}
                      onChange={(e) => updateSkillExperience(role.value, e.target.value)}
                      placeholder="Years"
                      className="w-24 h-12 text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Additional Skills from Database */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-base font-semibold mb-3 text-black">Add Additional Skills</h4>
            <p className="text-sm text-gray-600 mb-4">Search and select from our database of professional skills</p>
            
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                  onFocus={() => setShowSkillDropdown(true)}
                  placeholder="Search skills: Camera, Lighting, VFX, Editing..."
                  className="bg-white border-gray-300 text-black h-12 pl-11"
                />
              </div>

              {showSkillDropdown && skillSearch && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {filteredSkills.length > 0 ? (
                    filteredSkills.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkillFromDatabase(skill)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors"
                      >
                        {skill}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No skills found
                    </div>
                  )}
                </div>
              )}
            </div>

            {(data.secondary_roles || []).some(isCustomSkill) && (
              <div className="space-y-3 mt-4">
                <p className="text-sm font-medium text-gray-700">Additional Skills:</p>
                <div className="space-y-2">
                  {(data.secondary_roles || []).filter(isCustomSkill).map(skill => (
                    <div key={skill} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-600/10 border border-amber-600/50 rounded-lg text-sm flex-1">
                        <span className="text-black">{getSkillLabel(skill)}</span>
                        <button
                          onClick={() => removeCustomSkill(skill)}
                          className="text-gray-500 hover:text-red-500 transition-colors ml-auto"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={getCustomSkillExperience(skill)}
                        onChange={(e) => updateCustomSkillExperience(skill, e.target.value)}
                        placeholder="Years"
                        className="w-24 h-10 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}