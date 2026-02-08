import React, { useState } from 'react';
import { Video, Camera, Scissors, Briefcase, Box, Wand2, Palette, Music, Mic, User, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [customSkill, setCustomSkill] = useState('');

  const toggleSecondaryRole = (role) => {
    const current = data.secondary_roles || [];
    if (current.includes(role)) {
      updateData('secondary_roles', current.filter(r => r !== role));
    } else {
      updateData('secondary_roles', [...current, role]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim()) {
      const customValue = customSkill.toLowerCase().replace(/\s+/g, '_');
      if (!(data.secondary_roles || []).includes(customValue)) {
        updateData('secondary_roles', [...(data.secondary_roles || []), customValue]);
        updateData('custom_skills', [...(data.custom_skills || []), { value: customValue, label: customSkill.trim() }]);
      }
      setCustomSkill('');
    }
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

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">What's your primary role?</h2>
      <p className="text-gray-600 mb-8">Select your main specialty</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
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
        <div>
          <h3 className="text-xl font-semibold mb-3 text-black">Additional skills (optional)</h3>
          <p className="text-sm text-gray-600 mb-4">Select any secondary roles you can perform</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ROLES.filter(r => r.value !== data.role).map((role) => {
              const Icon = role.icon;
              const isSelected = (data.secondary_roles || []).includes(role.value);
              return (
                <button
                  key={role.value}
                  onClick={() => toggleSecondaryRole(role.value)}
                  className={`p-3 rounded-lg border transition-all text-left flex items-center gap-2 ${
                    isSelected
                      ? 'border-amber-600/50 bg-amber-600/5 text-black'
                      : 'border-gray-300 hover:border-gray-400 bg-white text-black'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
                  <span className="text-sm">{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Skills Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-base font-semibold mb-3 text-black">Add Custom Skill</h4>
            <p className="text-sm text-gray-600 mb-4">Don't see your skill? Add it here</p>
            
            <div className="flex gap-2 mb-4">
              <Input
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="e.g., Drone Operator, Color Grading..."
                className="bg-white border-gray-300 text-black h-12"
                onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
              />
              <button
                onClick={addCustomSkill}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {(data.secondary_roles || []).some(isCustomSkill) && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Custom Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {(data.secondary_roles || []).filter(isCustomSkill).map(skill => (
                    <div
                      key={skill}
                      className="flex items-center gap-2 px-3 py-2 bg-amber-600/10 border border-amber-600/50 rounded-lg text-sm"
                    >
                      <span className="text-black">{getSkillLabel(skill)}</span>
                      <button
                        onClick={() => removeCustomSkill(skill)}
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
      )}
    </div>
  );
}