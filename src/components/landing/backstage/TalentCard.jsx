import React, { useState } from 'react';
import { Star, Flame, MessageCircle, Play, Home, Heart } from 'lucide-react';

const badgeConfig = {
  star: { icon: Star, color: '#6366f1' },
  flame: { icon: Flame, color: '#6366f1' },
  chat: { icon: MessageCircle, color: '#6366f1' },
};

export default function TalentCard({ profile }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [favorited, setFavorited] = useState(false);

  const next = (e) => {
    e.stopPropagation();
    setImgIdx((i) => (i + 1) % profile.images.length);
  };

  return (
    <div className="group rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src={profile.images[imgIdx]}
          alt={profile.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay text (e.g. "BOLD & BEYOND") */}
        {profile.overlayText && (
          <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
              {profile.overlayText}
            </span>
          </div>
        )}

        {/* Play / reel indicator */}
        {profile.hasReel && (
          <button
            onClick={next}
            className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-colors hover:bg-black/80"
            aria-label="Play reel"
          >
            <Play className="h-3.5 w-3.5 fill-white text-white" />
          </button>
        )}

        {/* Carousel dots */}
        {profile.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {profile.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                className={`h-1.5 rounded-full transition-all ${
                  i === imgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="px-1 pt-3 pb-1">
        <h3 className="text-sm font-bold leading-tight text-black">{profile.name}</h3>
        <p className="mt-0.5 text-xs font-normal leading-tight text-black">{profile.location}</p>

        {/* Badges */}
        <div className="mt-2 flex items-center gap-1.5">
          {profile.badges.map((b) => {
            const cfg = badgeConfig[b];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <span
                key={b}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6366f1]/10"
              >
                <Icon className="h-3 w-3" style={{ color: cfg.color }} />
              </span>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-2 flex items-center gap-1.5 px-1 pb-1">
        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white px-2 py-2 text-xs font-semibold text-black transition-colors hover:bg-black/[0.03]">
          <Home className="h-3.5 w-3.5" />
          Invite
        </button>
        <button className="flex items-center justify-center rounded-lg border border-black/10 bg-white px-2.5 py-2 transition-colors hover:bg-black/[0.03]" aria-label="Message">
          <MessageCircle className="h-3.5 w-3.5 text-black" />
        </button>
        <button
          onClick={() => setFavorited(!favorited)}
          className="flex items-center justify-center rounded-lg border border-black/10 bg-white px-2.5 py-2 transition-colors hover:bg-black/[0.03]"
          aria-label="Favorite"
        >
          <Heart className={`h-3.5 w-3.5 ${favorited ? 'fill-red-500 text-red-500' : 'text-black'}`} />
        </button>
      </div>
    </div>
  );
}
