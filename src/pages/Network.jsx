import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Search, MapPin, Euro, ChevronDown, Users, Building2, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Network() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, artist, team, backer
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  
  const [artists, setArtists] = useState([]);
  const [teams, setTeams] = useState([]);
  const [backers, setBackers] = useState([]);
  const [connections, setConnections] = useState([]);
  
  const [showFilters, setShowFilters] = useState({
    type: false,
    role: false,
    location: false,
    budget: false
  });

  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      navigate('/signin');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [artistsData, teamsData, backersData, connectionsData] = await Promise.all([
          base44.entities.Artist.filter({ status: 'approved' }),
          base44.entities.Team.filter({ status: 'approved' }),
          base44.entities.Backer.filter({ status: 'approved' }),
          base44.entities.Connection.filter({ requester_email: user.email })
        ]);
        
        setArtists(artistsData);
        setTeams(teamsData);
        setBackers(backersData);
        setConnections(connectionsData);
      } catch (err) {
        console.error('Error fetching network data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleConnect = async () => {
    if (!selectedPerson) return;

    try {
      await base44.entities.Connection.create({
        requester_email: user.email,
        requester_type: 'artist',
        recipient_email: selectedPerson.email || selectedPerson.contact_email,
        recipient_type: selectedPerson.type,
        status: 'pending',
        message: connectionMessage
      });

      await base44.entities.Notification.create({
        recipient_email: selectedPerson.email || selectedPerson.contact_email,
        sender_email: user.email,
        sender_name: user.full_name,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${user.full_name} wants to connect with you`,
        action_required: true
      });

      setShowConnectionModal(false);
      setConnectionMessage('');
      alert('Connection request sent!');
    } catch (err) {
      console.error('Error sending connection:', err);
      alert('Failed to send connection request');
    }
  };

  // Combine all people into one list with type indicator
  const allPeople = [
    ...artists.map(a => ({ ...a, type: 'artist', displayName: a.full_name })),
    ...teams.map(t => ({ ...t, type: 'team', displayName: t.team_name })),
    ...backers.map(b => ({ ...b, type: 'backer', displayName: b.organization_name }))
  ];

  // Filter logic
  const filteredPeople = allPeople.filter(person => {
    // Type filter
    if (selectedType !== 'all' && person.type !== selectedType) return false;

    // Search query (searches name, role, location)
    if (searchQuery.length >= 3) {
      const query = searchQuery.toLowerCase();
      const nameMatch = person.displayName?.toLowerCase().includes(query);
      const roleMatch = person.role?.toLowerCase().includes(query) || 
                       person.specialties?.some(s => s.toLowerCase().includes(query)) ||
                       person.backing_types?.some(b => b.toLowerCase().includes(query));
      const locationMatch = person.based_in_city?.toLowerCase().includes(query) ||
                           person.city?.toLowerCase().includes(query) ||
                           person.based_in_country?.toLowerCase().includes(query) ||
                           person.country?.toLowerCase().includes(query) ||
                           person.locations?.some(l => l.toLowerCase().includes(query));
      
      if (!nameMatch && !roleMatch && !locationMatch) return false;
    }

    // Role filter
    if (selectedRole !== 'all') {
      if (person.type === 'artist' && person.role !== selectedRole) return false;
      if (person.type === 'team' && !person.specialties?.includes(selectedRole)) return false;
    }

    // Location filter
    if (selectedLocation !== 'all') {
      const personLocation = person.based_in_city || person.city;
      if (personLocation !== selectedLocation) return false;
    }

    // Budget filter (for teams and backers)
    if (selectedBudget !== 'all' && (person.type === 'team' || person.type === 'backer')) {
      if (person.type === 'team' && person.team_size !== selectedBudget) return false;
    }

    return true;
  });

  // Get unique locations and roles for filters
  const uniqueLocations = [...new Set(allPeople.map(p => p.based_in_city || p.city).filter(Boolean))];
  const uniqueRoles = [...new Set([
    ...artists.map(a => a.role),
    ...teams.flatMap(t => t.specialties || [])
  ])].filter(Boolean);

  const getTypeIcon = (type) => {
    if (type === 'artist') return <Users className="w-4 h-4" />;
    if (type === 'team') return <Building2 className="w-4 h-4" />;
    if (type === 'backer') return <TrendingUp className="w-4 h-4" />;
  };

  const getTypeLabel = (type) => {
    if (type === 'artist') return 'Artist';
    if (type === 'team') return 'Team';
    if (type === 'backer') return 'Investor';
  };

  if (!user || loading) return null;

  return (
    <div className="h-screen bg-white">
      <ArtistSidebar />
      
      <main className="w-full h-full flex flex-col overflow-hidden bg-white pl-20">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Network</h1>
          <p className="text-sm text-gray-600">Connect with creators, teams, and investors</p>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-3 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, or location (min 3 letters)..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {/* Type Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(prev => ({ type: !prev.type, role: false, location: false, budget: false }))}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                {selectedType === 'all' ? 'All Types' : getTypeLabel(selectedType)}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilters.type && (
                <div className="absolute z-10 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {['all', 'artist', 'team', 'backer'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setShowFilters(prev => ({ ...prev, type: false }));
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                    >
                      {type === 'all' ? 'All Types' : getTypeLabel(type)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Role Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(prev => ({ type: false, role: !prev.role, location: false, budget: false }))}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                {selectedRole === 'all' ? 'All Roles' : selectedRole}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilters.role && (
                <div className="absolute z-10 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedRole('all');
                      setShowFilters(prev => ({ ...prev, role: false }));
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100"
                  >
                    All Roles
                  </button>
                  {uniqueRoles.map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        setShowFilters(prev => ({ ...prev, role: false }));
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0 capitalize"
                    >
                      {role.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(prev => ({ type: false, role: false, location: !prev.location, budget: false }))}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                {selectedLocation === 'all' ? 'All Locations' : selectedLocation}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFilters.location && (
                <div className="absolute z-10 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedLocation('all');
                      setShowFilters(prev => ({ ...prev, location: false }));
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100"
                  >
                    All Locations
                  </button>
                  {uniqueLocations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setShowFilters(prev => ({ ...prev, location: false }));
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active filters display */}
          {(selectedType !== 'all' || selectedRole !== 'all' || selectedLocation !== 'all' || searchQuery.length >= 3) && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {searchQuery.length >= 3 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:bg-blue-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedType !== 'all' && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
                  {getTypeLabel(selectedType)}
                  <button onClick={() => setSelectedType('all')} className="hover:bg-purple-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedRole !== 'all' && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1 capitalize">
                  {selectedRole.replace(/_/g, ' ')}
                  <button onClick={() => setSelectedRole('all')} className="hover:bg-green-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedLocation !== 'all' && (
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center gap-1">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation('all')} className="hover:bg-orange-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Network List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 text-sm text-gray-600">
            {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'} found
          </div>

          <div className="space-y-3">
            {filteredPeople.map((person) => {
              const isConnected = connections.some(c => 
                (c.recipient_email === person.email || c.recipient_email === person.contact_email) && 
                c.status === 'accepted'
              );
              
              return (
                <div key={person.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl font-bold text-gray-600">
                      {person.displayName?.charAt(0) || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900">{person.displayName}</h3>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1">
                              {getTypeIcon(person.type)}
                              {getTypeLabel(person.type)}
                            </span>
                          </div>

                          {/* Role/Specialty */}
                          {person.type === 'artist' && (
                            <p className="text-sm text-gray-700 mb-1 capitalize">{person.role?.replace(/_/g, ' ')}</p>
                          )}
                          {person.type === 'team' && person.specialties && (
                            <p className="text-sm text-gray-700 mb-1">{person.specialties.slice(0, 3).join(', ')}</p>
                          )}
                          {person.type === 'backer' && person.backing_types && (
                            <p className="text-sm text-gray-700 mb-1 capitalize">{person.backing_types.join(', ').replace(/_/g, ' ')}</p>
                          )}

                          {/* Location */}
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {person.based_in_city || person.city}, {person.based_in_country || person.country}
                            </span>
                          </div>

                          {/* Bio preview for backers */}
                          {person.type === 'backer' && person.bio && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">{person.bio}</p>
                          )}
                        </div>

                        {/* Connect Button */}
                        <div className="flex-shrink-0">
                          {isConnected ? (
                            <Button variant="outline" size="sm" className="text-xs">
                              Connected
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => {
                                setSelectedPerson(person);
                                setShowConnectionModal(true);
                              }}
                              size="sm" 
                              className="bg-black text-white hover:bg-gray-800 text-xs"
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPeople.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No matches found</h2>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Connection Request Modal */}
      {showConnectionModal && selectedPerson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Connect with {selectedPerson.displayName}</h3>
              <button onClick={() => setShowConnectionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Send a connection request to {selectedPerson.displayName}. Add a personal message to introduce yourself.
            </p>

            <textarea
              value={connectionMessage}
              onChange={(e) => setConnectionMessage(e.target.value)}
              placeholder="Hi! I'd love to connect and explore potential collaboration opportunities..."
              className="w-full h-32 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none mb-4"
            />

            <div className="flex gap-2">
              <Button 
                onClick={() => setShowConnectionModal(false)}
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConnect}
                className="flex-1 bg-black text-white hover:bg-gray-800"
              >
                Send Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}