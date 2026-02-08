import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MapPin, Briefcase, Award, Globe, Instagram, Play, ExternalLink, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';

export default function ArtistPublicProfile() {
  const [searchParams] = useSearchParams();
  const artistId = searchParams.get('id');
  const [artist, setArtist] = useState(null);
  const [portfolioClips, setPortfolioClips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtist();
  }, [artistId]);

  const loadArtist = async () => {
    try {
      const artists = await base44.entities.Artist.list();
      const foundArtist = artists.find(a => a.id === artistId);
      setArtist(foundArtist);

      if (foundArtist?.portfolio_clips?.length > 0) {
        const clips = await base44.entities.PortfolioClip.list();
        setPortfolioClips(clips.filter(c => foundArtist.portfolio_clips.includes(c.id)));
      }
    } catch (error) {
      console.error('Failed to load artist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artist Not Found</h2>
          <Link to={createPageUrl('Home')}>
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-8">
            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-5xl font-bold">
              {artist.full_name?.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-3">{artist.full_name}</h1>
              <div className="flex items-center gap-2 text-2xl text-gray-300 mb-4">
                <Briefcase className="w-6 h-6" />
                {artist.role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </div>
              <div className="flex items-center gap-6 text-gray-300 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {artist.based_in_city}, {artist.based_in_country}
                </div>
                {artist.years_experience && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    {artist.years_experience} years experience
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {artist.website && (
                  <a href={artist.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      <Globe className="w-4 h-4 mr-2" />
                      Website
                    </Button>
                  </a>
                )}
                {artist.instagram && (
                  <a href={artist.instagram} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                  </a>
                )}
                {artist.vimeo && (
                  <a href={artist.vimeo} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      <Play className="w-4 h-4 mr-2" />
                      Vimeo
                    </Button>
                  </a>
                )}
                {artist.imdb && (
                  <a href={artist.imdb} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      IMDb
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Skills & Roles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Skills & Expertise</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Primary Role</h3>
              <div className="px-4 py-3 bg-gray-100 rounded-lg font-medium">
                {artist.role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </div>
            </div>
            {artist.secondary_roles?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Additional Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {artist.secondary_roles.map((role, idx) => (
                    <span key={idx} className="px-3 py-2 bg-gray-100 rounded text-sm">
                      {role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Languages */}
        {artist.languages_spoken?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {artist.languages_spoken.map((lang, idx) => (
                <span key={idx} className="px-4 py-2 bg-gray-100 rounded-lg">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {portfolioClips.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Portfolio</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {portfolioClips.map((clip) => (
                <div key={clip.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    {clip.thumbnail_url ? (
                      <img src={clip.thumbnail_url} alt={clip.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Play className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{clip.title}</h3>
                    {clip.description && (
                      <p className="text-sm text-gray-600 mb-3">{clip.description}</p>
                    )}
                    {clip.project_type && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-xs font-medium rounded">
                        {clip.project_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Interested in Working Together?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Connect with {artist.full_name} through Studio22 to discuss your next project.
          </p>
          <Link to={createPageUrl('SubmitProject')}>
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">
              Post a Project
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}