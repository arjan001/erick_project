import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Play, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Work() {
  const [filterType, setFilterType] = useState('all');
  const [filterStyle, setFilterStyle] = useState('all');

  const { data: clips, isLoading } = useQuery({
    queryKey: ['approved-clips'],
    queryFn: () => base44.entities.PortfolioClip.filter({ 
      status: 'approved',
      approved_for_visual_direction: true 
    }),
  });

  const filteredClips = clips?.filter(clip => {
    const typeMatch = filterType === 'all' || clip.project_type === filterType;
    const styleMatch = filterStyle === 'all' || clip.visual_style_tags?.includes(filterStyle);
    return typeMatch && styleMatch;
  }) || [];

  const allStyles = [...new Set(clips?.flatMap(c => c.visual_style_tags || []))];

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Our Work</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Curated productions from our network of artists and teams across Europe
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="short_film">Short Film</SelectItem>
                <SelectItem value="film">Film</SelectItem>
                <SelectItem value="music_video">Music Video</SelectItem>
                <SelectItem value="documentary">Documentary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {allStyles.length > 0 && (
            <Select value={filterStyle} onValueChange={setFilterStyle}>
              <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All Styles</SelectItem>
                {allStyles.map(style => (
                  <SelectItem key={style} value={style}>{style}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Work Grid */}
        {!isLoading && filteredClips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClips.map((clip) => (
              <div
                key={clip.id}
                className="group relative aspect-video bg-zinc-900 rounded-xl overflow-hidden cursor-pointer hover-lift"
              >
                <img
                  src={clip.thumbnail_url || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800'}
                  alt={clip.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {clip.title && <h3 className="font-semibold mb-2">{clip.title}</h3>}
                  <div className="flex flex-wrap gap-2">
                    {clip.project_type && (
                      <Badge variant="outline" className="text-xs">
                        {clip.project_type.replace('_', ' ')}
                      </Badge>
                    )}
                    {clip.visual_style_tags?.slice(0, 2).map(tag => (
                      <Badge key={tag} className="bg-amber-600/20 text-amber-600 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredClips.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No work matches your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}