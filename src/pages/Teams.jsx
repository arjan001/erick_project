import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, CheckCircle, Star } from 'lucide-react';

export default function Teams() {
  const [filters, setFilters] = useState({
    specialty: 'all',
    country: 'all',
    tier: 'all',
    verified: false
  });

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.filter({ status: 'approved' })
  });

  const filteredTeams = teams.filter(team => {
    if (filters.specialty !== 'all' && !team.specialties?.includes(filters.specialty)) return false;
    if (filters.country !== 'all' && team.country !== filters.country) return false;
    if (filters.tier !== 'all' && team.account_tier !== filters.tier) return false;
    if (filters.verified && !team.verified) return false;
    return true;
  }).sort((a, b) => {
    // Verified teams appear first
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
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">Discover Teams</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Browse our curated network of verified production teams, studios, and collectives.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-12 items-center">
          <Select value={filters.specialty} onValueChange={(value) => setFilters({...filters, specialty: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="post_production">Post Production</SelectItem>
              <SelectItem value="vfx">VFX</SelectItem>
              <SelectItem value="3d">3D</SelectItem>
              <SelectItem value="sound">Sound</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="camera">Camera</SelectItem>
              <SelectItem value="lighting">Lighting</SelectItem>
              <SelectItem value="full_service">Full Service</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.country} onValueChange={(value) => setFilters({...filters, country: value})}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {Array.from(new Set(teams.map(t => t.country).filter(Boolean))).map(country => (
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
            <div className="text-gray-400">Loading teams...</div>
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No teams match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TeamCard({ team }) {
  const tierColors = {
    elite: 'bg-purple-600 text-white',
    studio: 'bg-blue-600 text-white',
    pro: 'bg-green-600 text-white',
    free: 'bg-gray-400 text-white'
  };

  const sizeLabels = {
    solo: 'Solo',
    '2_5': '2-5 people',
    '6_10': '6-10 people',
    '11_20': '11-20 people',
    '20_plus': '20+ people'
  };

  return (
    <div className="group bg-white rounded-xl border-2 border-gray-200 hover:border-black hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xl font-bold">{team.team_code}</h3>
              {team.verified && (
                <CheckCircle className="w-5 h-5 text-blue-600 fill-blue-600" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4" />
              <span>{team.city}, {team.country}</span>
            </div>
            {team.team_size && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{sizeLabels[team.team_size]}</span>
              </div>
            )}
          </div>
          <Badge className={tierColors[team.account_tier] || tierColors.free}>
            {team.account_tier?.toUpperCase() || 'FREE'}
          </Badge>
        </div>

        {team.specialties && team.specialties.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Specialties:</p>
            <div className="flex flex-wrap gap-2">
              {team.specialties.map((spec, i) => (
                <Badge key={i} className="bg-black text-white text-xs">
                  {spec.replace('_', ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <span className={`px-2 py-1 rounded ${
            team.availability === 'available' ? 'bg-green-100 text-green-700' :
            team.availability === 'limited' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {team.availability?.toUpperCase() || 'UNKNOWN'}
          </span>
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