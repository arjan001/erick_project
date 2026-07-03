import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FILM_ROLES_BY_CATEGORY, ALL_FILM_ROLES } from '@/lib/filmRoles';
import { SKILLS_DATABASE } from '../SkillsDatabase';

export default function ArtistStepRole({ data, updateData }) {
  const [roleSearch, setRoleSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const selectedRoles = data.roles || data.secondary_roles || [];

  const toggleRole = (role) => {
    const current = selectedRoles;
    if (current.includes(role)) {
      const newRoles = current.filter(r => r !== role);
      updateData('roles', newRoles);
      updateData('secondary_roles', newRoles);
      if (data.role === role) {
        updateData('role', newRoles[0] || '');
      }
    } else {
      const newRoles = [...current, role];
      updateData('roles', newRoles);
      updateData('secondary_roles', newRoles);
      if (!data.role) {
        updateData('role', role);
      }
    }
  };

  const setPrimaryRole = (role) => {
    updateData('role', role);
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
    const current = data.skills_experience || [];
    if (!current.find(s => s.skill === skill)) {
      updateData('skills_experience', [...current, { skill, years: 0 }]);
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const removeSkill = (skill) => {
    updateData('skills_experience', (data.skills_experience || []).filter(s => s.skill !== skill));
  };

  const filteredRoles = roleSearch
    ? ALL_FILM_ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase()))
    : ALL_FILM_ROLES;

  const filteredSkills = SKILLS_DATABASE.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !(data.skills_experience || []).find(s => s.skill === skill)
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
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">What are your roles?</h2>
      <p className="text-gray-600 mb-6">Select all roles that apply to you — you can choose multiple. Your first selection becomes your primary role.</p>

      {/* Role search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={roleSearch}
          onChange={(e) => setRoleSearch(e.target.value)}
          placeholder="Search roles... (e.g., Director, Colorist, Drone Pilot)"
          className="bg-white border-gray-300 text-black h-12 pl-11"
        />
      </div>

      {/* Selected roles as tags */}
      {selectedRoles.length > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-gray-700">Selected Roles ({selectedRoles.length})</Label>
            <span className="text-xs text-gray-500">Click a role to set as primary</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map(role => (
              <button
                key={role}
                onClick={() => setPrimaryRole(role)}
                className={`px-3 py-1.5 text-xs rounded-full flex items-center gap-1.5 transition-colors ${
                  data.role === role
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-white border border-amber-300 text-gray-700 hover:bg-amber-100'
                }`}
              >
                {data.role === role && <Check className="w-3 h-3" />}
                {role}
                <X
                  className="w-3 h-3 ml-1 opacity-60 hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); toggleRole(role); }}
                />
              </button>
            ))}
          </div>
          {data.role && (
            <p className="text-xs text-amber-700 mt-2">★ Primary role: {data.role}</p>
          )}
        </div>
      )}

      {/* Role categories */}
      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50">
        {Object.entries(FILM_ROLES_BY_CATEGORY).map(([category, roles]) => {
          const visible = roles.filter(r => !roleSearch || r.toLowerCase().includes(roleSearch.toLowerCase()));
          if (visible.length === 0) return null;
          return (
            <div key={category}>
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-2 tracking-wider">{category}</h4>
              <div className="flex flex-wrap gap-1.5">
                {visible.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-2.5 py-1.5 text-xs rounded-full transition-all ${
                      selectedRoles.includes(role)
                        ? 'bg-black text-white font-medium'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills & Experience */}
      {selectedRoles.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-3 text-black">Skills & Experience</h3>
          <p className="text-sm text-gray-600 mb-4">Add your years of experience for each role or skill</p>

          <div className="space-y-2 mb-4">
            {selectedRoles.map(role => (
              <div key={role} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 flex-1">{role}</span>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={getSkillExperience(role)}
                  onChange={(e) => updateSkillExperience(role, e.target.value)}
                  placeholder="Years"
                  className="w-28 h-10 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-base font-semibold mb-3 text-black">Add Additional Skills</h4>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={skillSearch}
                  onChange={(e) => { setSkillSearch(e.target.value); setShowSkillDropdown(true); }}
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
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">No skills found</div>
                  )}
                </div>
              )}
            </div>

            {(data.skills_experience || []).filter(s => !selectedRoles.includes(s.skill)).length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium text-gray-700">Additional Skills:</p>
                {(data.skills_experience || []).filter(s => !selectedRoles.includes(s.skill)).map(s => (
                  <div key={s.skill} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm flex-1">
                      <span className="text-black">{s.skill}</span>
                      <button onClick={() => removeSkill(s.skill)} className="text-gray-500 hover:text-red-500 transition-colors ml-auto">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={s.years || ''}
                      onChange={(e) => updateSkillExperience(s.skill, e.target.value)}
                      placeholder="Years"
                      className="w-24 h-10 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}