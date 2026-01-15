import React from 'react';
import { Globe, Film, Tv, Trophy, Building } from 'lucide-react';

const USAGE_OPTIONS = [
  { value: 'online', label: 'Online', icon: Globe, description: 'Social media, websites, digital' },
  { value: 'cinema', label: 'Cinema', icon: Film, description: 'Theatrical release' },
  { value: 'broadcast', label: 'Broadcast', icon: Tv, description: 'TV and streaming platforms' },
  { value: 'festival', label: 'Festival', icon: Trophy, description: 'Film festival submissions' },
  { value: 'internal', label: 'Internal', icon: Building, description: 'Corporate and internal use' },
];

export default function StepUsage({ data, updateData }) {
  const toggleUsage = (value) => {
    const current = data.usage || [];
    if (current.includes(value)) {
      updateData('usage', current.filter(u => u !== value));
    } else {
      updateData('usage', [...current, value]);
    }
  };

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Where will this be used?</h2>
      <p className="text-gray-600 mb-8">Select all that apply</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {USAGE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = (data.usage || []).includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleUsage(option.value)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-amber-600 bg-amber-600/10'
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-600'}`} />
              <h3 className="text-lg font-semibold mb-1 text-black">{option.label}</h3>
              <p className="text-sm text-gray-600">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}