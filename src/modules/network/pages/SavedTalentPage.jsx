import React, { useState, useEffect } from 'react';
import { Artist, Connection } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Search, Heart, MapPin, Mail, User, MessageCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

export default function SavedTalentPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [savedTalent, setSavedTalent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSavedTalent();
  }, [user]);

  const fetchSavedTalent = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      // Fetch connections where the current user has saved artists
      const connections = await Connection.filter({
        user_email: user.email,
        connection_type: 'saved',
        status: 'active'
      });

      if (connections && connections.length > 0) {
        // Fetch artist details for each saved connection
        const artistIds = connections.map(c => c.connected_artist_id).filter(Boolean);
        const artists = await Promise.all(
          artistIds.map(id => Artist.get(id))
        );
        setSavedTalent(artists.filter(Boolean));
      } else {
        setSavedTalent([]);
      }
    } catch (err) {
      console.error('Error fetching saved talent:', err);
      error('Error', 'Failed to fetch saved talent');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (artistId) => {
    if (!user?.email) return;
    try {
      // Find and delete the connection
      const connections = await Connection.filter({
        user_email: user.email,
        connected_artist_id: artistId,
        connection_type: 'saved'
      });

      if (connections.length > 0) {
        await Connection.delete(connections[0].id);
        setSavedTalent(prev => prev.filter(a => a.id !== artistId));
        success('Removed', 'Talent removed from saved list');
      }
    } catch (err) {
      console.error('Error removing saved talent:', err);
      error('Failed', 'Failed to remove saved talent');
    }
  };

  const handleMessage = (artistEmail) => {
    navigate('/Messages', { state: { recipientEmail: artistEmail } });
  };

  const handleViewProfile = (artistId) => {
    navigate(`/ArtistPublicProfile/${artistId}`);
  };

  const filteredTalent = savedTalent.filter(a =>
    a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Saved Talent</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your saved talent profiles</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search saved talent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4F46E5]" />
          </div>
        ) : filteredTalent.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No saved talent found</p>
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
                    onClick={() => handleUnsave(artist.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{artist.email}</span>
                  </div>
                  {artist.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{artist.city}, {artist.country || 'Kenya'}</span>
                    </div>
                  )}
                </div>
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
