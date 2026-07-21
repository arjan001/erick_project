import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';

const DEFAULT_SKILL_SUGGESTIONS = [
  'After Effects', 'Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'Concept Art', 'Creative Direction', 
  'Editing', 'Color Grading', 'Motion Graphics', 'VFX', '3D Animation', 'Maya', 'Cinema 4D', 'Blender',
  'Sound Design', 'Pro Tools', 'Cinematography', 'Lighting Design', 'Set Design', 'Art Direction',
  'Visual Effects', 'Compositing', 'Storyboarding', 'Photography', 'Directing', 'Production Management',
  'Scriptwriting', 'Animation', 'Character Animation', 'Visual Effects Supervisor', 'DP/Cinematography',
  'Gaffer', 'Grip', 'Production Design', 'Costume Design', 'Makeup', 'Hair Styling', 'Steadicam',
  'Drone Piloting', 'Underwater Cinematography', 'Rotoscoping', 'Tracking', 'Matte Painting',
  'Green Screen', 'Chroma Keying', 'Color Correction', 'Grading', 'Audio Mixing', 'Music Composition'
];

export default function SkillsExperienceTagInput({ selected = [], onChange, placeholder = "Search skills...", suggestions = DEFAULT_SKILL_SUGGESTIONS }) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleSkill = (skill) => {
    if (selected.includes(skill)) {
      onChange(selected.filter(s => s !== skill));
    } else {
      onChange([...selected, skill]);
    }
    setQuery('');
    setShowDropdown(false);
  };

  const addCustomSkill = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery && !selected.includes(trimmedQuery)) {
      onChange([...selected, trimmedQuery]);
      setQuery('');
      setShowDropdown(false);
    }
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s)
  ).slice(0, 15);

  return (
    <div className="relative" ref={containerRef}>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map(skill => (
            <span key={skill} className="px-3 py-1.5 bg-black text-white text-sm rounded-full flex items-center gap-2">
              {skill}
              <button type="button" onClick={() => toggleSkill(skill)} className="hover:text-gray-300">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-24 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        />
        <button
          type="button"
          onClick={addCustomSkill}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-black text-white text-xs rounded-md hover:bg-gray-800"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Dropdown */}
      {showDropdown && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {filteredSuggestions.map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors border-b border-gray-50 last:border-b-0 ${selected.includes(skill) ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
            >
              {skill}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
