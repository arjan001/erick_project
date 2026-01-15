import React from 'react';
import { Film, Video, Tv, Music, FileText, Sparkles } from 'lucide-react';

const PROJECT_TYPES = [
  { value: 'commercial', label: 'Commercial', icon: Tv, description: 'Brand campaigns and advertising' },
  { value: 'short_film', label: 'Short Film', icon: Film, description: 'Narrative short form content' },
  { value: 'film', label: 'Feature Film', icon: Video, description: 'Long-form cinema production' },
  { value: 'music_video', label: 'Music Video', icon: Music, description: 'Music and performance videos' },
  { value: 'documentary', label: 'Documentary', icon: FileText, description: 'Non-fiction storytelling' },
  { value: 'other', label: 'Other', icon: Sparkles, description: 'Other creative projects' },
];

export default function StepProjectType({ data, updateData }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">What type of project?</h2>
      <p className="text-gray-400 mb-8">Select the format that best describes your production</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROJECT_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = data.project_type === type.value;
          return (
            <button
              key={type.value}
              onClick={() => updateData('project_type', type.value)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-amber-600 bg-amber-600/10'
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-800/50'
              }`}
            >
              <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-amber-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-semibold mb-1">{type.label}</h3>
              <p className="text-sm text-gray-400">{type.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}