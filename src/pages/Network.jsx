import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Search, MapPin, Euro, ChevronDown, Users, Building2, TrendingUp, X, MessageCircle, Briefcase, Network as NetworkIcon } from 'lucide-react';
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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

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
        const [artistsData, teamsData, backersData, connectionsData, jobsData] = await Promise.all([
          base44.entities.Artist.filter({ status: 'approved' }),
          base44.entities.Team.filter({ status: 'approved' }),
          base44.entities.Backer.filter({ status: 'approved' }),
          base44.entities.Connection.list(),
          base44.entities.Job.filter({ status: 'open', client_email: user.email })
        ]);
        
        setArtists(artistsData);
        setTeams(teamsData);
        setBackers(backersData);
        
        // Get both sent and received connections
        const myConnections = connectionsData.filter(c => 
          c.requester_email === user.email || c.recipient_email === user.email
        );
        setConnections(myConnections);
        setJobs(jobsData);
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
      
      // Refresh connections
      const connectionsData = await base44.entities.Connection.list();
      const myConnections = connectionsData.filter(c => 
        c.requester_email === user.email || c.recipient_email === user.email
      );
      setConnections(myConnections);
    } catch (err) {
      console.error('Error sending connection:', err);
    }
  };

  const handleInviteToJob = async () => {
    if (!selectedPerson || !selectedJob) return;

    try {
      await base44.entities.Notification.create({
        recipient_email: selectedPerson.email || selectedPerson.contact_email,
        sender_email: user.email,
        sender_name: user.full_name,
        type: 'job_invitation',
        title: 'Job Invitation',
        message: `${user.full_name} invited you to apply for: ${selectedJob.title}`,
        link: '/jobs',
        action_required: true,
        action_data: { job_id: selectedJob.id }
      });

      setShowInviteModal(false);
      setSelectedJob(null);
    } catch (err) {
      console.error('Error sending invitation:', err);
    }
  };

  const handleMessage = (person) => {
    navigate('/messages');
  };

  const handleViewProfile = (person) => {
    if (person.type === 'artist') {
      navigate(`/artist-profile/${person.id}`);
    } else if (person.type === 'team') {
      navigate(`/team-profile/${person.id}`);
    }
  };

  // Combine all people into one list with type indicator
  const allPeople = [
    ...artists.map(a => ({ ...a, type: 'artist', displayName: a.full_name })),
    ...teams.map(t => ({ ...t, type: 'team', displayName: t.team_name })),
    ...backers.map(b => ({ ...b, type: 'backer', displayName: b.organization_name }))
  ];

  // Get connection status for each person
  const getConnectionStatus = (person) => {
    const personEmail = person.email || person.contact_email;
    const connection = connections.find(c =>
      (c.requester_email === user.email && c.recipient_email === personEmail) ||
      (c.recipient_email === user.email && c.requester_email === personEmail)
    );
    
    if (!connection) return 'not_connected';
    return connection.status; // pending, accepted, declined
  };

  // Separate into connections and suggestions
  const myConnections = allPeople.filter(person => getConnectionStatus(person) === 'accepted');
  const suggestions = allPeople.filter(person => getConnectionStatus(person) !== 'accepted');

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
    <div className="fixed inset-0 bg-white overflow-hidden">
      <ArtistSidebar />
      
      <main className="fixed inset-0 flex flex-col bg-white pl-20">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Network</h1>
            <p className="text-sm text-gray-600">Manage connections and discover creatives</p>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{myConnections.length}</span> connections
          </div>
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

        {/* Network List - Split View */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Connections */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Connections ({myConnections.filter(p => {
                  if (selectedType !== 'all' && p.type !== selectedType) return false;
                  if (searchQuery.length >= 3 && !p.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                }).length})
              </h2>
              <div className="space-y-3">
                {myConnections.filter(p => {
                  if (selectedType !== 'all' && p.type !== selectedType) return false;
                  if (searchQuery.length >= 3 && !p.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                }).map((person) => (
                  <div key={person.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div 
                        onClick={() => handleViewProfile(person)}
                        className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold text-gray-600 cursor-pointer hover:opacity-80"
                      >
                        {person.displayName?.charAt(0) || '?'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 
                              onClick={() => handleViewProfile(person)}
                              className="font-semibold text-gray-900 text-sm hover:underline cursor-pointer"
                            >
                              {person.displayName}
                            </h3>
                            {person.type === 'artist' && (
                              <p className="text-xs text-gray-600 capitalize">{person.role?.replace(/_/g, ' ')}</p>
                            )}
                            {person.type === 'team' && person.specialties && (
                              <p className="text-xs text-gray-600">{person.specialties.slice(0, 2).join(', ')}</p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              {person.based_in_city || person.city}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleMessage(person)}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              Message
                            </Button>
                            {jobs.length > 0 && (
                              <Button
                                onClick={() => {
                                  setSelectedPerson(person);
                                  setShowInviteModal(true);
                                }}
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                              >
                                <Briefcase className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {myConnections.filter(p => {
                  if (selectedType !== 'all' && p.type !== selectedType) return false;
                  if (searchQuery.length >= 3 && !p.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No connections yet
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: People You May Know */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                People you may know ({suggestions.filter(p => {
                  if (selectedType !== 'all' && p.type !== selectedType) return false;
                  if (searchQuery.length >= 3 && !p.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                }).length})
              </h2>
              <div className="space-y-3">
                {suggestions.filter(p => {
                  if (selectedType !== 'all' && p.type !== selectedType) return false;
                  if (searchQuery.length >= 3 && !p.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                }).map((person) => {
                  const status = getConnectionStatus(person);
                  return (
                    <div key={person.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div 
                          onClick={() => handleViewProfile(person)}
                          className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold text-gray-600 cursor-pointer hover:opacity-80"
                        >
                          {person.displayName?.charAt(0) || '?'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 
                                onClick={() => handleViewProfile(person)}
                                className="font-semibold text-gray-900 text-sm hover:underline cursor-pointer"
                              >
                                {person.displayName}
                              </h3>
                              {person.type === 'artist' && (
                                <p className="text-xs text-gray-600 capitalize">{person.role?.replace(/_/g, ' ')}</p>
                              )}
                              {person.type === 'team' && person.specialties && (
                                <p className="text-xs text-gray-600">{person.specialties.slice(0, 2).join(', ')}</p>
                              )}
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <MapPin className="w-3 h-3" />
                                {person.based_in_city || person.city}
                              </div>
                            </div>
                            {status === 'pending' ? (
                              <Button size="sm" variant="outline" className="text-xs" disabled>
                                Pending
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
                  );
                })}
                
                {suggestions.filter(p => {
                  if (selectedType !== 'all' && p.type !== selectedType) return false;
                  if (searchQuery.length >= 3 && !p.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                }).length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No suggestions available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Connection Request Modal */}
      {showConnectionModal && selectedPerson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Connect with {selectedPerson.displayName}</h3>
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

      {/* Invite to Job Modal */}
      {showInviteModal && selectedPerson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Invite to Job</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Invite {selectedPerson.displayName} to apply for one of your open positions.
            </p>

            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    selectedJob?.id === job.id
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{job.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{job.location}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => setShowInviteModal(false)}
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleInviteToJob}
                disabled={!selectedJob}
                className="flex-1 bg-black text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}