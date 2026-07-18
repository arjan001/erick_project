import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Globe } from 'lucide-react';
import LANGUAGES from '@/data/languages.json';

export default function LanguageMultiSelect({ value = [], onChange, placeholder = "Select languages..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter languages based on search term
  const filteredLanguages = LANGUAGES.filter(lang =>
    lang.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !value.includes(lang)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddLanguage = (language) => {
    onChange([...value, language]);
    setSearchTerm('');
  };

  const handleRemoveLanguage = (language) => {
    onChange(value.filter(l => l !== language));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Languages Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((lang) => (
            <div
              key={lang}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm border border-gray-200"
            >
              <span>{lang}</span>
              <button
                type="button"
                onClick={() => handleRemoveLanguage(lang)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-black focus-within:border-transparent bg-white">
          <Globe className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="flex-1 outline-none text-sm bg-transparent"
          />
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown */}
        {isOpen && filteredLanguages.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredLanguages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleAddLanguage(lang)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Globe className="w-3 h-3 text-gray-400" />
                <span>{lang}</span>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {isOpen && searchTerm && filteredLanguages.length === 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-500">
            No languages found
          </div>
        )}
      </div>
    </div>
  );
}
