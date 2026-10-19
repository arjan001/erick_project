import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Flame, MessageCircle, ChevronLeft, ChevronRight, ZoomIn, Home, Heart } from 'lucide-react'

const badgeConfig = {
  star: { icon: Star, color: '#6366f1' },
  flame: { icon: Flame, color: '#6366f1' },
  chat: { icon: MessageCircle, color: '#6366f1' },
}

export default function TalentCard({ profile, showActions = true, onOpenProfile, showControls = true }) {
  const [imgIdx, setImgIdx] = useState(0)
  const [favorited, setFavorited] = useState(false)

  const next = (e) => {
    e?.stopPropagation()
    setImgIdx((i) => (i + 1) % profile.images.length)
  }

  const prev = (e) => {
    e?.stopPropagation()
    setImgIdx((i) => (i - 1 + profile.images.length) % profile.images.length)
  }

  return (
    <Link to={`/artist/${profile.id}`} className="group rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md block">
      {/* Image area */}
      <div
        className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
      >
        <img
          src={profile.images[imgIdx]}
          alt={profile.name}
          className="h-full w-full object-cover transition-transform duration-300"
          loading="lazy"
        />

        {/* Hover overlay arrows */}
        {showControls && profile.images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/80 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/80 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Zoom button */}
        {showControls && (
          <button
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5] text-white opacity-0 transition-opacity hover:bg-[#4338CA] group-hover:opacity-100"
            aria-label="View profile"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        )}

        {/* Overlay text (e.g. "BOLD & BEYOND") */}
        {profile.overlayText && (
          <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
              {profile.overlayText}
            </span>
          </div>
        )}

        {/* Pagination dots */}
        {showControls && profile.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {profile.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                className={`h-1.5 rounded-full transition-all ${i === imgIdx ? 'w-4 bg-[#4F46E5]' : 'w-1.5 border border-[#4F46E5]/50 bg-transparent'
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
      </div>

      {/* Action buttons — hidden on landing carousel, shown on talent directory */}
      {showActions && (
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
      )}
    </Link>
  )
}
