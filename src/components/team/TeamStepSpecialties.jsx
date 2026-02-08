import React, { useState, useRef, useEffect } from 'react';
import { Video, Scissors, Wand2, Box, Music, Camera, Zap, Package, Plus, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SKILLS_DATABASE } from '../SkillsDatabase';

const SPECIALTIES = [
  { value: 'production', label: 'Production', icon: Video },
  { value: 'post_production', label: 'Post Production', icon: Scissors },
  { value: 'vfx', label: 'VFX', icon: Wand2 },
  { value: '3d', label: '3D', icon: Box },
  { value: 'sound', label: 'Sound', icon: Music },
  { value: 'camera', label: 'Camera', icon: Camera },
  { value: 'lighting', label: 'Lighting', icon: Zap },
  { value: 'full_service', label: 'Full Service', icon: Package },
];

export default function TeamStepSpecialties({ data, updateData }) {
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const toggleSpecialty = (value) => {
    const current = data.specialties || [];
    if (current.includes(value)) {
      updateData('specialties', current.filter(s => s !== value));
    } else {
      updateData('specialties', [...current, value]);
    }
  };

  const addSkillFromDatabase = (skill) => {
    const skillValue = skill.toLowerCase().replace(/\s+/g, '_');
    if (!(data.specialties || []).includes(skillValue)) {
      updateData('specialties', [...(data.specialties || []), skillValue]);
      updateData('custom_specialties', [...(data.custom_specialties || []), { value: skillValue, label: skill }]);
    }
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const removeCustomSpecialty = (value) => {
    updateData('specialties', (data.specialties || []).filter(s => s !== value));
    updateData('custom_specialties', (data.custom_specialties || []).filter(s => s.value !== value));
  };

  const isCustomSpecialty = (value) => {
    return (data.custom_specialties || []).some(s => s.value === value);
  };

  const getSpecialtyLabel = (value) => {
    const predefined = SPECIALTIES.find(s => s.value === value);
    if (predefined) return predefined.label;
    const custom = (data.custom_specialties || []).find(s => s.value === value);
    return custom ? custom.label : value;
  };

  const filteredSkills = SKILLS_DATABASE.filter(skill =>
    skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !(data.specialties || []).includes(skill.toLowerCase().replace(/\s+/g, '_'))
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
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">What are your specialties?</h2>
      <p className="text-gray-600 mb-8">Select all services your team provides</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {SPECIALTIES.map((specialty) => {
          const Icon = specialty.icon;
          const isSelected = (data.specialties || []).includes(specialty.value);
          return (
            <button
              key={specialty.value}
              onClick={() => toggleSpecialty(specialty.value)}
              className={`p-5 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-amber-600 bg-amber-600/10 text-black'
                  : 'border-gray-300 hover:border-gray-400 bg-white text-black'
              }`}
            >
              <Icon className={`w-8 h-8 mb-3 mx-auto ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
              <p className="text-sm font-medium text-center">{specialty.label}</p>
            </button>
          );
        })}
      </div>

      {/* Additional Specialties from Database */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-black">Add Additional Specialties</h3>
        <p className="text-sm text-gray-600 mb-4">Search and select from our database of professional specialties</p>
        
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
              placeholder="Search: Camera, Lighting, VFX, Editing, Sound..."
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
                  No specialties found
                </div>
              )}
            </div>
          )}
        </div>

        {(data.specialties || []).some(isCustomSpecialty) && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Custom Specialties:</p>
            <div className="flex flex-wrap gap-2">
              {(data.specialties || []).filter(isCustomSpecialty).map(specialty => (
                <div
                  key={specialty}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-600/10 border border-amber-600/50 rounded-lg text-sm"
                >
                  <span className="text-black">{getSpecialtyLabel(specialty)}</span>
                  <button
                    onClick={() => removeCustomSpecialty(specialty)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}