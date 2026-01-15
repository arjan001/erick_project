import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
    } else {
      setIsDark(true);
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const newTheme = newIsDark ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    
    if (newIsDark) {
      document.documentElement.classList.remove('light');
      document.body.style.backgroundColor = '#000000';
    } else {
      document.documentElement.classList.add('light');
      document.body.style.backgroundColor = '#FFFFFF';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 px-4 py-4 w-full text-sm font-medium transition-all text-gray-400 hover:text-white hover:bg-white/5 relative group/item"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 flex-shrink-0" />
      ) : (
        <Moon className="w-5 h-5 flex-shrink-0" />
      )}
      <span className="absolute left-full ml-4 px-3 py-2 bg-white text-black text-sm font-medium rounded shadow-lg opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
}