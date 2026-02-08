import React, { useState } from 'react';
import { Video, Scissors, Wand2, Box, Music, Camera, Zap, Package, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [customSpecialty, setCustomSpecialty] = useState('');

  const toggleSpecialty = (value) => {
    const current = data.specialties || [];
    if (current.includes(value)) {
      updateData('specialties', current.filter(s => s !== value));
    } else {
      updateData('specialties', [...current, value]);
    }
  };

  const addCustomSpecialty = () => {
    if (customSpecialty.trim()) {
      const customValue = customSpecialty.toLowerCase().replace(/\s+/g, '_');
      if (!(data.specialties || []).includes(customValue)) {
        updateData('specialties', [...(data.specialties || []), customValue]);
        updateData('custom_specialties', [...(data.custom_specialties || []), { value: customValue, label: customSpecialty.trim() }]);
      }
      setCustomSpecialty('');
    }
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

      {/* Custom Specialties Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-black">Add Custom Specialty</h3>
        <p className="text-sm text-gray-600 mb-4">Don't see your specialty? Add it here</p>
        
        <div className="flex gap-2 mb-4">
          <Input
            value={customSpecialty}
            onChange={(e) => setCustomSpecialty(e.target.value)}
            placeholder="e.g., Drone Cinematography, Color Grading..."
            className="bg-white border-gray-300 text-black h-12"
            onKeyPress={(e) => e.key === 'Enter' && addCustomSpecialty()}
          />
          <button
            onClick={addCustomSpecialty}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
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