import React from 'react';

export default function Logo({ className = '', dark = false }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7c3aed] text-white">
        <span className="text-sm font-black">E</span>
      </div>
      <span className={`text-lg font-extrabold uppercase tracking-tight ${dark ? 'text-white' : 'text-black'}`}>
        Eric Rabar
      </span>
    </div>
  );
}
