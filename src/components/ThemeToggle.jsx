import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    applyTheme(saved !== 'light');
  }, []);

  const applyTheme = (dark) => {
    setIsDark(dark);
    const root = document.documentElement;
    const body = document.body;
    
    if (dark) {
      root.classList.remove('light');
      root.style.backgroundColor = '#000000';
      body.style.backgroundColor = '#000000';
      body.style.color = '#ffffff';
    } else {
      root.classList.add('light');
      root.style.backgroundColor = '#ffffff';
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#000000';
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    applyTheme(newIsDark);
    window.location.reload(); // Force reload to apply all styles
  };

  return (
    <div className="relative group/theme">
      <button
        onClick={toggleTheme}
        className="flex items-center gap-3 px-4 py-4 w-full text-sm font-medium transition-all text-gray-400 hover:text-white hover:bg-white/5"
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="w-5 h-5 flex-shrink-0" />
        ) : (
          <Moon className="w-5 h-5 flex-shrink-0" />
        )}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      </button>
      {/* Tooltip - only shows when sidebar is NOT hovered (collapsed) */}
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-white text-black text-sm font-medium rounded-lg shadow-xl opacity-0 group-hover/theme:opacity-100 group-hover:group-hover/theme:opacity-0 pointer-events-none transition-opacity whitespace-nowrap z-[100]">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </div>
    </div>
  );
}