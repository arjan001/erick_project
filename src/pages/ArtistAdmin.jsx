import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { User, MapPin, Briefcase, Award, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ArtistAdmin() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: artist, isLoading } = useQuery({
    queryKey: ['myArtist'],
    queryFn: async () => {
      if (!user?.linked_entity_id) return null;
      return await base44.entities.Artist.get(user.linked_entity_id);
    },
    enabled: !!user,
  });

  const { data: portfolioClips } = useQuery({
    queryKey: ['myPortfolio'],
    queryFn: async () => {
      if (!artist?.id) return [];
      return await base44.entities.PortfolioClip.filter({ 
        uploaded_by_type: 'artist',
        uploaded_by_id: artist.id 
      });
    },
    enabled: !!artist,
  });

  if (!user || user.role !== 'artist_admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black mb-4">Access Denied</h1>
          <p className="text-gray-600">Artist Admin access required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Artist Dashboard</h1>
          <p className="text-gray-600">Manage your profile and portfolio</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading artist data...</p>
          </div>
        ) : !artist ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No artist profile linked to your account</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Artist Profile Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl text-black">{artist.full_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-semibold text-black">{artist.role?.replace('_', ' ')}</span>
                </div>
                
                {artist.based_in_city && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{artist.based_in_city}, {artist.based_in_country}</span>
                  </div>
                )}

                {artist.years_experience && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>{artist.years_experience} years of experience</span>
                  </div>
                )}

                {artist.secondary_roles?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Additional Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {artist.secondary_roles.map((role) => (
                        <Badge key={role} className="bg-gray-100 text-gray-800">
                          {role.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {artist.languages_spoken?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Languages:</p>
                    <p className="text-black">{artist.languages_spoken.join(', ')}</p>
                  </div>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  {artist.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-black">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                  {artist.vimeo && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={artist.vimeo} target="_blank" rel="noopener noreferrer" className="text-black">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Vimeo
                      </a>
                    </Button>
                  )}
                  {artist.instagram && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={artist.instagram} target="_blank" rel="noopener noreferrer" className="text-black">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}
                </div>

                <div className="pt-4">
                  <Badge className={
                    artist.status === 'approved' ? 'bg-green-100 text-green-800' :
                    artist.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    Status: {artist.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Card */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-black">My Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioClips?.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {portfolioClips.map((clip) => (
                      <div key={clip.id} className="bg-gray-50 rounded-lg overflow-hidden">
                        <img 
                          src={clip.thumbnail_url} 
                          alt={clip.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-black mb-1">{clip.title}</h3>
                          <Badge className={
                            clip.status === 'approved' ? 'bg-green-100 text-green-800' :
                            clip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {clip.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No portfolio clips uploaded yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}