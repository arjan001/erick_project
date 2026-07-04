import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { ALL_FILM_ROLES, FILM_ROLES_BY_CATEGORY } from '@/lib/filmRoles';

// Compact multi-select tag input for film industry roles.
// Used in the portfolio modal so artists can tag multiple roles per clip.
export default function RolesTagInput({ selected = [], onChange }) {
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

  const toggleRole = (role) => {
    if (selected.includes(role)) {
      onChange(selected.filter(r => r !== role));
    } else {
      onChange([...selected, role]);
    }
    setQuery('');
    setShowDropdown(false);
  };

  // Flat filtered suggestions
  const flatMatches = query
    ? ALL_FILM_ROLES.filter(r => r.toLowerCase().includes(query.toLowerCase())).slice(0, 15)
    : [];

  // Grouped suggestions when no query (show top roles per category)
  const groupedPreview = !query
    ? Object.entries(FILM_ROLES_BY_CATEGORY).map(([cat, roles]) => ({ cat, roles: roles.slice(0, 6) }))
    : [];

  return (
    <div className="relative" ref={containerRef}>
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(role => (
            <span key={role} className="px-2.5 py-1 bg-black text-white text-xs rounded-full flex items-center gap-1.5">
              {role}
              <button type="button" onClick={() => toggleRole(role)} className="hover:text-gray-300">
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
          placeholder="Search film roles... (e.g. Director, Colorist, VFX Artist)"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {query ? (
            flatMatches.length > 0 ? (
              flatMatches.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 text-sm transition-colors ${selected.includes(role) ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                >
                  {role}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">No roles found. Try another term.</div>
            )
          ) : (
            groupedPreview.map(({ cat, roles }) => (
              <div key={cat} className="px-3 py-2 border-b border-gray-50 last:border-b-0">
                <div className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">{cat}</div>
                <div className="flex flex-wrap gap-1">
                  {roles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`px-2 py-1 text-xs rounded-full transition-all ${selected.includes(role) ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}