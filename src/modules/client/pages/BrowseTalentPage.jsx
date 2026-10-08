import React, { useState, useEffect } from 'react';
import { Artist, Connection } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, Heart, MapPin, Mail, User, MessageCircle, ExternalLink, Star, Filter, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

export default function BrowseTalentPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [talent, setTalent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [savedArtistIds, setSavedArtistIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTalent();
    fetchSavedTalent();
  }, [user]);

  const fetchTalent = async () => {
    try {
      setLoading(true);
      const artists = await Artist.list('created_at', 100);
      setTalent(artists || []);
    } catch (err) {
      console.error('Error fetching talent:', err);
      error('Error', 'Failed to fetch talent');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedTalent = async () => {
    if (!user?.email) return;
    try {
      const connections = await Connection.filter({ 
        user_email: user.email, 
        connection_type: 'saved',
        status: 'active'
      });
      const savedIds = new Set(connections.map(c => c.connected_artist_id).filter(Boolean));
      setSavedArtistIds(savedIds);
    } catch (err) {
      console.error('Error fetching saved talent:', err);
    }
  };

  const handleSave = async (artistId) => {
    if (!user?.email) {
      error('Authentication Required', 'Please sign in to save talent');
      return;
    }
    try {
      if (savedArtistIds.has(artistId)) {
        // Unsave
        const connections = await Connection.filter({ 
          user_email: user.email, 
          connected_artist_id: artistId,
          connection_type: 'saved'
        });
        if (connections.length > 0) {
          await Connection.delete(connections[0].id);
          setSavedArtistIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(artistId);
            return newSet;
          });
          success('Removed', 'Talent removed from saved list');
        }
      } else {
        // Save
        await Connection.create({
          user_email: user.email,
          connected_artist_id: artistId,
          connection_type: 'saved',
          status: 'active',
          created_at: new Date().toISOString()
        });
        setSavedArtistIds(prev => new Set(prev).add(artistId));
        success('Saved', 'Talent added to saved list');
      }
    } catch (err) {
      console.error('Error saving talent:', err);
      error('Failed', 'Failed to save talent');
    }
  };

  const handleMessage = (artistEmail) => {
    navigate('/Messages', { state: { recipientEmail: artistEmail } });
  };

  const handleViewProfile = (artistId) => {
    navigate(`/ArtistPublicProfile/${artistId}`);
  };

  const filteredTalent = talent.filter(artist => {
    const matchesSearch = 
      artist.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (artist.skills_experience || []).some(s => s.skill?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = filterRole === 'all' || artist.role === filterRole;
    const matchesLocation = filterLocation === 'all' || 
      artist.based_in_city?.toLowerCase().includes(filterLocation.toLowerCase()) ||
      artist.based_in_country?.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesRole && matchesLocation;
  });

  const uniqueRoles = [...new Set(talent.map(a => a.role).filter(Boolean))];
  const uniqueLocations = [...new Set([
    ...talent.map(a => a.based_in_city).filter(Boolean),
    ...talent.map(a => a.based_in_country).filter(Boolean)
  ])];

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Browse Talent</h1>
          <p className="text-sm text-gray-500 mt-1">Discover and connect with creative professionals</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, skill, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {showFilters && (
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Roles</option>
                  {uniqueRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-sm text-gray-500 ml-auto">
              {filteredTalent.length} talent found
            </p>
          </div>
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4F46E5]" />
          </div>
        ) : filteredTalent.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No talent found matching your criteria</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTalent.map((artist) => (
              <div key={artist.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start gap-4 mb-3">
                  <div 
                    className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-500 font-semibold flex-shrink-0 cursor-pointer"
                    onClick={() => handleViewProfile(artist.id)}
                  >
                    {artist.profile_photo_url ? (
                      <img src={artist.profile_photo_url} alt={artist.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{artist.full_name?.[0] || 'U'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold text-gray-900 truncate cursor-pointer hover:text-[#4F46E5]"
                      onClick={() => handleViewProfile(artist.id)}
                    >{artist.full_name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{artist.role || 'Artist'}</p>
                    {artist.based_in_city && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {artist.based_in_city}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSave(artist.id)}
                    className={`flex-shrink-0 ${savedArtistIds.has(artist.id) ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                  >
                    <Heart className={`w-4 h-4 ${savedArtistIds.has(artist.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Skills preview */}
                {artist.skills_experience && artist.skills_experience.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {artist.skills_experience.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {skill.skill}
                      </span>
                    ))}
                    {artist.skills_experience.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-xs">
                        +{artist.skills_experience.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewProfile(artist.id)}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Profile
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA]"
                    onClick={() => handleMessage(artist.email)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
