import React from 'react';

const items = [
  '🎬 New: Feature Film Casting in Atlanta',
  '🎤 Voiceover Jobs — Remote',
  '🎭 Theater Auditions Open Now',
  '📺 Netflix Series Seeking Lead',
  '📸 Commercial Casting — Nationwide',
  '✨ UGC Creator Gigs — $500+/day',
  '🎬 HBO Documentary Casting',
  '🎭 Broadway Musical Open Call',
];

export default function Marquee() {
  return (
    <div className="relative z-[60] overflow-hidden bg-black py-2">
      <div className="flex w-max animate-[marquee_25s_linear_infinite] gap-12 whitespace-nowrap">
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="text-xs font-medium text-white/80">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
