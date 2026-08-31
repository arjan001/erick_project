import React, { useState, useEffect } from 'react';
import { TickerEntry } from '@/lib/supabaseEntities';

const defaultItems = [
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
  const [items, setItems] = useState(defaultItems);

  useEffect(() => {
    let cancelled = false;
    TickerEntry.list('-created_at', 20)
      .then((data) => {
        if (cancelled) return;
        if (data && data.length > 0) {
          setItems(data.map((e) => e.text || e.title || e.content).filter(Boolean));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

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
