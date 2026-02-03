import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Star, Award, Globe, CheckCircle } from 'lucide-react';

export default function Creators() {
  const [filters, setFilters] = useState({
    role: 'all',
    country: 'all',
    tier: 'all',
    verified: false
  });

  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.Artist.filter({ status: 'approved' })
  });

  const filteredArtists = artists.filter(artist => {
    if (filters.role !== 'all' && artist.role !== filters.role) return false;
    if (filters.country !== 'all' && artist.based_in_country !== filters.country) return false;
    if (filters.tier !== 'all' && artist.account_tier !== filters.tier) return false;
    if (filters.verified && !artist.verified) return false;
    return true;
  }).sort((a, b) => {
    // Verified creators appear first
    if (a.verified && !b.verified) return -1;
    if (!a.verified && b.verified) return 1;
    // Then sort by tier
    const tierOrder = { elite: 0, studio: 1, pro: 2, free: 3 };
    return (tierOrder[a.account_tier] || 3) - (tierOrder[b.account_tier] || 3);
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1800px] mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">Discover Creators</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Browse our curated network of verified independent creators from around the world.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-12 items-center">
          <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="cinematographer">Cinematographer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="producer">Producer</SelectItem>
              <SelectItem value="3d_artist">3D Artist</SelectItem>
              <SelectItem value="vfx_artist">VFX Artist</SelectItem>
              <SelectItem value="motion_designer">Motion Designer</SelectItem>
              <SelectItem value="sound_designer">Sound Designer</SelectItem>
              <SelectItem value="music_composer">Music Composer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.country} onValueChange={(value) => setFilters({...filters, country: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {Array.from(new Set(artists.map(a => a.based_in_country).filter(Boolean))).map(country => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.tier} onValueChange={(value) => setFilters({...filters, tier: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Account Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="elite">Elite</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant={filters.verified ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({...filters, verified: !filters.verified})}
              className={filters.verified ? "bg-black text-white" : ""}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verified Only
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="text-gray-400">Loading creators...</div>
          </div>
        ) : filteredArtists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map(artist => (
              <CreatorCard key={artist.id} creator={artist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No creators match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreatorCard({ creator }) {
  const tierColors = {
    elite: 'bg-purple-600 text-white',
    studio: 'bg-blue-600 text-white',
    pro: 'bg-green-600 text-white',
    free: 'bg-gray-400 text-white'
  };

  return (
    <div className="group bg-white rounded-xl border-2 border-gray-200 hover:border-black hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xl font-bold">{creator.full_name}</h3>
              {creator.verified && (
                <CheckCircle className="w-5 h-5 text-blue-600 fill-blue-600" />
              )}
            </div>
            <Badge className="bg-black text-white mb-2">
              {creator.role?.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <MapPin className="w-4 h-4" />
              <span>{creator.based_in_city}, {creator.based_in_country}</span>
            </div>
          </div>
          <Badge className={tierColors[creator.account_tier] || tierColors.free}>
            {creator.account_tier?.toUpperCase() || 'FREE'}
          </Badge>
        </div>

        {creator.secondary_roles && creator.secondary_roles.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Also skilled in:</p>
            <div className="flex flex-wrap gap-2">
              {creator.secondary_roles.slice(0, 3).map((role, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-4 text-xs text-gray-500">
          {creator.website && (
            <a href={creator.website} target="_blank" rel="noopener noreferrer" className="hover:text-black">
              <Globe className="w-4 h-4" />
            </a>
          )}
        </div>

        <Button 
          size="sm" 
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          View Profile
        </Button>
      </div>
    </div>
  );
}