import React from 'react';
import { Video, Scissors, Wand2, Box, Music, Camera, Zap, Package } from 'lucide-react';

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
  const toggleSpecialty = (value) => {
    const current = data.specialties || [];
    if (current.includes(value)) {
      updateData('specialties', current.filter(s => s !== value));
    } else {
      updateData('specialties', [...current, value]);
    }
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
    </div>
  );
}