import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FILM_ROLES_BY_CATEGORY, ALL_FILM_ROLES } from '@/lib/filmRoles';
import { SKILLS_DATABASE } from '../SkillsDatabase';
import MultiSelectAutocomplete from '@/components/MultiSelectAutocomplete';
import filmIndustryRoles from '@/data/filmIndustryRoles.json';
import filmIndustrySkills from '@/data/filmIndustrySkills.json';

export default function ArtistStepRole({ data, updateData }) {
  const [roleSearch, setRoleSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const selectedRoles = data.roles || data.secondary_roles || [];
  
  // Flatten all roles from JSON for autocomplete
  const allRolesList = Object.values(filmIndustryRoles).flat();
  
  // Flatten all skills from JSON for autocomplete
  const allSkillsList = Object.values(filmIndustrySkills).flat();

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

      {/* Multi-select autocomplete for roles */}
      <MultiSelectAutocomplete
        options={allRolesList}
        selected={selectedRoles}
        onChange={(newRoles) => {
          updateData('roles', newRoles);
          updateData('secondary_roles', newRoles);
          if (!data.role || !newRoles.includes(data.role)) {
            updateData('role', newRoles[0] || '');
          }
        }}
        label="Your Roles"
        placeholder="Search and select roles..."
        maxDisplay={10}
        className="mb-6"
      />

      {/* Primary role selector */}
      {selectedRoles.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Primary Role</Label>
          <select
            value={data.role || ''}
            onChange={(e) => updateData('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Select primary role...</option>
            {selectedRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          {data.role && (
            <p className="text-xs text-amber-700 mt-2">★ Primary role: {data.role}</p>
          )}
        </div>
      )}

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
            
            {/* Multi-select autocomplete for skills */}
            <MultiSelectAutocomplete
              options={allSkillsList}
              selected={(data.skills_experience || []).filter(s => !selectedRoles.includes(s.skill)).map(s => s.skill)}
              onChange={(newSkills) => {
                // Keep existing skills from roles, add/remove additional skills
                const roleSkills = selectedRoles.map(role => ({
                  skill: role,
                  years: getSkillExperience(role)
                }));
                const additionalSkills = newSkills.map(skill => ({
                  skill,
                  years: getSkillExperience(skill) || 0
                }));
                updateData('skills_experience', [...roleSkills, ...additionalSkills]);
              }}
              label="Additional Skills"
              placeholder="Search and select skills..."
              maxDisplay={8}
              className="mb-4"
            />

            {(data.skills_experience || []).filter(s => !selectedRoles.includes(s.skill)).length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium text-gray-700">Additional Skills Experience:</p>
                {(data.skills_experience || []).filter(s => !selectedRoles.includes(s.skill)).map(s => (
                  <div key={s.skill} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 flex-1">{s.skill}</span>
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