import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Team, PortfolioClip } from '@/lib/supabaseEntities';
import { MapPin, Users, Award, Globe, Mail, Wrench, Calendar, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/shared/utils/routing';

export default function TeamPublicProfile() {
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get('id');
  const [team, setTeam] = useState(null);
  const [portfolioClips, setPortfolioClips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  const loadTeam = async () => {
    try {
      const teams = await Team.list();
      const foundTeam = teams.find(t => t.id === teamId);
      setTeam(foundTeam);

      if (foundTeam?.portfolio_clips?.length > 0) {
        const clips = await PortfolioClip.list();
        setPortfolioClips(clips.filter(c => foundTeam.portfolio_clips.includes(c.id)));
      }
    } catch (error) {
      console.error('Failed to load team:', error);
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

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Team Not Found</h2>
          <Link to={createPageUrl('Home')}>
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getTeamSizeLabel = (size) => {
    const labels = {
      solo: 'Solo',
      '2_5': '2-5 members',
      '6_10': '6-10 members',
      '11_20': '11-20 members',
      '20_plus': '20+ members'
    };
    return labels[size] || size;
  };

  const getAvailabilityColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      limited: 'bg-yellow-100 text-yellow-800',
      booked: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-mono">
              {team.team_code}
            </span>
          </div>
          <h1 className="text-5xl font-bold mb-3">{team.contact_name}</h1>
          <div className="flex items-center gap-6 text-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {team.city}, {team.country}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {getTeamSizeLabel(team.team_size)}
            </div>
            {team.availability && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(team.availability)}`}>
                {team.availability.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Specialties */}
        {team.specialties?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Specialties</h2>
            <div className="flex flex-wrap gap-3">
              {team.specialties.map((specialty, idx) => (
                <span key={idx} className="px-5 py-3 bg-gray-900 text-white rounded-lg font-medium">
                  {specialty.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Team Members */}
        {team.team_members?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Team Members</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {team.team_members.map((member, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.specialty}</p>
                  {member.email && (
                    <p className="text-sm text-gray-500 mt-2">{member.email}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {team.equipment_owned?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Wrench className="w-8 h-8" />
              Equipment
            </h2>
            <div className="grid md:grid-cols-3 gap-3">
              {team.equipment_owned.map((equipment, idx) => (
                <div key={idx} className="px-4 py-3 bg-gray-100 rounded-lg text-sm">
                  {equipment}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {team.languages_spoken?.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {team.languages_spoken.map((lang, idx) => (
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
          <h2 className="text-3xl font-bold mb-4">Ready to Collaborate?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Connect with {team.contact_name} ({team.team_code}) through Studio22 to bring your project to life.
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