import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check } from 'lucide-react';

export default function StepVisualDirection({ data, updateData }) {
  const [clips, setClips] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClips();
  }, []);

  const loadClips = async () => {
    try {
      const result = await base44.entities.PortfolioClip.filter({
        approved_for_visual_direction: true,
        status: 'approved'
      });
      setClips(result || []);
    } catch (error) {
      console.error('Error loading clips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleClip = (clipId) => {
    const current = data.visual_direction_clips || [];
    if (current.includes(clipId)) {
      updateData('visual_direction_clips', current.filter(id => id !== clipId));
    } else if (current.length < 3) {
      updateData('visual_direction_clips', [...current, clipId]);
    }
  };

  const isSelected = (clipId) => (data.visual_direction_clips || []).includes(clipId);
  const selectedCount = (data.visual_direction_clips || []).length;

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Visual Direction</h2>
        <p className="text-gray-600 mb-8">Loading examples...</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Visual Direction</h2>
        <p className="text-gray-600 mb-8">No approved clips available yet. You can skip this step.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-black">Visual Direction</h2>
      <p className="text-gray-600 mb-2">Select 1-3 examples that match your vision</p>
      <p className="text-sm text-amber-600 mb-8">{selectedCount}/3 selected</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {clips.map((clip) => {
          const selected = isSelected(clip.id);
          const selectionIndex = (data.visual_direction_clips || []).indexOf(clip.id);

          return (
            <button
              key={clip.id}
              onClick={() => toggleClip(clip.id)}
              disabled={!selected && selectedCount >= 3}
              className={`relative aspect-video rounded-lg overflow-hidden group ${
                !selected && selectedCount >= 3 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
              onMouseEnter={() => setHoveredId(clip.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Thumbnail */}
              <img
                src={clip.thumbnail_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=400'}
                alt={clip.title || 'Visual reference'}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  hoveredId === clip.id ? 'scale-110' : 'scale-100'
                }`}
              />

              {/* Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent ${
                selected ? 'opacity-60' : 'opacity-40 group-hover:opacity-60'
              } transition-opacity`} />

              {/* Selected indicator */}
              {selected && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{selectionIndex + 1}</span>
                </div>
              )}

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs text-white font-medium line-clamp-2">{clip.title || 'Reference clip'}</p>
              </div>

              {/* Hover play indicator */}
              {hoveredId === clip.id && !selected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-0 h-0 border-t-6 border-t-transparent border-l-10 border-l-white border-b-6 border-b-transparent ml-1"></div>
                  </div>
                </div>
              )}

              {/* Border */}
              <div className={`absolute inset-0 border-2 rounded-lg transition-all ${
                selected ? 'border-amber-600' : 'border-transparent group-hover:border-zinc-600'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}