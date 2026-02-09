import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ArtistSidebar from '../components/ArtistSidebar';
import { Search, MapPin, Euro, ChevronDown, Users, Building2, TrendingUp, X, MessageCircle, Briefcase, Network as NetworkIcon, Clock, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Network() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTags, setSearchTags] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [selectedType, setSelectedType] = useState('all'); // all, artist, team, backer
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [referralsLeft, setReferralsLeft] = useState(3);
  const [showReferralModal, setShowReferralModal] = useState(false);
  
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

  // Generate random profile images
  const getProfileImage = (id) => `https://i.pravatar.cc/150?img=${id}`;

  // Mock data with images, locations, skills and mutual connections
  const mockConnections = [
    { id: 1, type: 'artist', name: 'Saint', role: 'Editor, Graphic Designer, Art Director', location: 'Paris, France', image: getProfileImage(1), mutualConnections: 12, email: 'saint@example.com', skills: ['Adobe Premiere', 'Photoshop', 'Illustrator', 'After Effects'] },
    { id: 2, type: 'artist', name: 'Moritz Giesl', role: 'Director, Creative Director', location: 'Berlin, DE', image: getProfileImage(2), mutualConnections: 8, email: 'moritz@example.com', skills: ['Creative Direction', 'Filmmaking', 'Concept Development'] },
    { id: 3, type: 'artist', name: 'Michaela Ceci', role: 'Stylist, Costume Designer', location: 'Milan, IT', image: getProfileImage(3), mutualConnections: 15, email: 'michaela@example.com', skills: ['Fashion Styling', 'Costume Design', 'Wardrobe'] },
    { id: 4, type: 'artist', name: 'Aidan Cullen', role: 'Director, Photographer', location: 'Dublin, IE', image: getProfileImage(4), mutualConnections: 6, email: 'aidan@example.com', skills: ['Photography', 'Directing', 'Lighting'] },
    { id: 5, type: 'artist', name: 'onda', role: 'Director, Photographer, Creative Director', location: 'Barcelona, ES', image: getProfileImage(5), mutualConnections: 22, email: 'onda@example.com', skills: ['Direction', 'Photography', 'Art Direction'] },
    { id: 6, type: 'artist', name: 'Holdenmedia', role: 'Photographer, Editor, Graphic Designer', location: 'London, UK', image: getProfileImage(6), mutualConnections: 9, email: 'holden@example.com', skills: ['Photography', 'Editing', 'Design'] },
    { id: 7, type: 'artist', name: 'Antonio Molina', role: 'Editor, VFX Artist, Motion Designer', location: 'Madrid, ES', image: getProfileImage(7), mutualConnections: 11, email: 'antonio@example.com', skills: ['VFX', 'Motion Graphics', 'Compositing'] },
    { id: 8, type: 'artist', name: 'Neema Sadeghi', role: 'Director, Photographer, Director of Photography', location: 'Amsterdam, NL', image: getProfileImage(8), mutualConnections: 18, email: 'neema@example.com', skills: ['Cinematography', 'Lighting', 'Camera Operation'] },
    { id: 9, type: 'artist', name: 'Mitchell Francis', role: 'Editor, Producer, Animator', location: 'Toronto, CA', image: getProfileImage(9), mutualConnections: 5, email: 'mitchell@example.com', skills: ['Editing', 'Animation', 'Production'] },
    { id: 10, type: 'artist', name: 'Josh Farias', role: 'Director, Photographer, Creative Director', location: 'Los Angeles, US', image: getProfileImage(10), mutualConnections: 13, email: 'josh@example.com', skills: ['Directing', 'Creative Strategy', 'Photography'] },
  ];

  const mockSuggestions = [
    { id: 20, type: 'artist', name: 'Simon Floris', role: 'Director, Editor, 3D Artist', location: 'Brussels, BE', image: getProfileImage(20), mutualConnections: 17, status: 'pending', email: 'simon@example.com', skills: ['3D Animation', 'Video Editing', 'Direction'] },
    { id: 21, type: 'artist', name: 'Luka Demol', role: 'Photographer', location: 'Brussels, BE', image: getProfileImage(21), mutualConnections: 2, email: 'luka@example.com', skills: ['Photography', 'Retouching'] },
    { id: 22, type: 'artist', name: 'Ulrich Carlos', role: 'Photographer, Videographer, Photo Assistant', location: 'Brussels, BE', image: getProfileImage(22), mutualConnections: 2, email: 'ulrich@example.com', skills: ['Photography', 'Videography', 'Lighting'] },
    { id: 23, type: 'artist', name: 'Emma Laurent', role: 'Cinematographer, DOP', location: 'Lyon, FR', image: getProfileImage(23), mutualConnections: 14, email: 'emma@example.com', skills: ['Cinematography', 'Camera', 'Lighting Design'] },
    { id: 24, type: 'artist', name: 'Marcus Chen', role: 'Motion Designer, 3D Artist', location: 'Vienna, AT', image: getProfileImage(24), mutualConnections: 7, email: 'marcus@example.com', skills: ['Motion Design', '3D Modeling', 'Animation'] },
    { id: 25, type: 'artist', name: 'Sofia Martinez', role: 'Producer, Line Producer', location: 'Barcelona, ES', image: getProfileImage(25), mutualConnections: 19, email: 'sofia@example.com', skills: ['Production', 'Budgeting', 'Scheduling'] },
    { id: 26, type: 'artist', name: 'kaum', role: '3D Artist, Web Designer', location: 'Prague, CZ', image: getProfileImage(26), mutualConnections: 4, email: 'kaum@example.com', skills: ['3D Design', 'Web Development', 'UI/UX'] },
  ];

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

  const [activeChatWindows, setActiveChatWindows] = useState([]);

  const handleMessage = (person) => {
    // Check if chat window already open
    if (activeChatWindows.find(w => w.id === person.id)) return;
    
    // Add new chat window (max 3 windows)
    if (activeChatWindows.length >= 3) {
      setActiveChatWindows([...activeChatWindows.slice(1), person]);
    } else {
      setActiveChatWindows([...activeChatWindows, person]);
    }
  };

  const closeChatWindow = (personId) => {
    setActiveChatWindows(activeChatWindows.filter(w => w.id !== personId));
  };

  const handleViewProfile = (person) => {
    // Navigate to public profile pages
    if (person.type === 'artist') {
      navigate(`/ArtistPublicProfile?id=${person.id}`);
    } else if (person.type === 'team') {
      navigate(`/TeamPublicProfile?id=${person.id}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setSearchTags([...searchTags, searchQuery.trim()]);
      setSearchQuery('');
      setSearchSuggestions([]);
    }
  };

  const removeSearchTag = (tagToRemove) => {
    setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
  };

  // Generate search suggestions as user types
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const suggestions = [];
      mockConnections.concat(mockSuggestions).forEach(person => {
        if (person.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          suggestions.push({ type: 'name', value: person.name, icon: '👤' });
        }
        if (person.location.toLowerCase().includes(searchQuery.toLowerCase())) {
          const loc = person.location.split(',')[0];
          if (!suggestions.find(s => s.value === loc)) {
            suggestions.push({ type: 'location', value: loc, icon: '📍' });
          }
        }
        person.skills?.forEach(skill => {
          if (skill.toLowerCase().includes(searchQuery.toLowerCase())) {
            if (!suggestions.find(s => s.value === skill)) {
              suggestions.push({ type: 'skill', value: skill, icon: '🔧' });
            }
          }
        });
      });
      setSearchSuggestions(suggestions.slice(0, 5));
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

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

  // Filter mock connections and suggestions based on search tags and filters
  const filterPerson = (person) => {
    // Search tags filter
    if (searchTags.length > 0) {
      const matchesTags = searchTags.every(tag => {
        const tagLower = tag.toLowerCase();
        const nameMatch = person.name?.toLowerCase().includes(tagLower);
        const roleMatch = person.role?.toLowerCase().includes(tagLower);
        const locationMatch = person.location?.toLowerCase().includes(tagLower);
        const skillsMatch = person.skills?.some(s => s.toLowerCase().includes(tagLower));
        return nameMatch || roleMatch || locationMatch || skillsMatch;
      });
      if (!matchesTags) return false;
    }

    return true;
  };

  const filteredConnections = mockConnections.filter(filterPerson);
  const filteredSuggestions = mockSuggestions.filter(filterPerson);

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
        {/* Header - Connection Requests & Referrals */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">Connection requests (0)</h2>
              <button className="text-sm text-gray-600 hover:underline">View all</button>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Gift className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-gray-900">{referralsLeft} Referrals left this month</span>
              </div>
              <button 
                onClick={() => setShowReferralModal(true)}
                className="text-sm text-gray-600 hover:underline flex items-center gap-1"
              >
                Referral requests (0) <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex gap-3 items-start">
            {/* Search with Tags - 30% */}
            <div className="w-[30%] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white flex flex-wrap items-center gap-2 min-h-[42px]">
                {searchTags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeSearchTag(tag)} className="hover:bg-gray-300 rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={searchTags.length === 0 ? "Search and press Enter..." : "Add tag..."}
                  className="flex-1 min-w-[100px] outline-none text-sm"
                />
              </div>
              
              {/* Search Suggestions Dropdown */}
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTags([...searchTags, suggestion.value]);
                        setSearchQuery('');
                        setSearchSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0 flex items-center gap-2"
                    >
                      <span>{suggestion.icon}</span>
                      <span>{suggestion.value}</span>
                      <span className="text-xs text-gray-500 ml-auto">{suggestion.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

          {/* Filter Buttons - 70% */}
          <div className="flex-1 flex gap-2">
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
                <div className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
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
                <div className="absolute z-50 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
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
                <div className="absolute z-50 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
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
        </div>
      </div>

        {/* Network List - Two Column Layout */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-2 gap-0 h-full">
            {/* LEFT COLUMN: Connections */}
            <div className="overflow-y-auto border-r border-gray-200" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-20">
                <h2 className="text-base font-semibold text-gray-900">Connections ({filteredConnections.length})</h2>
              </div>
              <div className="space-y-0 divide-y divide-gray-100">
                {filteredConnections.map((person) => (
                  <div key={person.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <img 
                        src={person.image}
                        alt={person.name}
                        onClick={() => handleViewProfile(person)}
                        className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1">
                            <h3 
                              onClick={() => handleViewProfile(person)}
                              className="font-semibold text-gray-900 hover:underline cursor-pointer text-sm"
                            >
                              {person.name}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-1 mb-1">{person.role}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {person.location}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleMessage(person)}
                            size="sm"
                            variant="outline"
                            className="text-xs px-3 flex-shrink-0"
                          >
                            Message
                          </Button>
                        </div>
                        {person.skills && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {person.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Suggestions & People you may know */}
            <div className="overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}>
              {/* Suggestions Section */}
              <div className="border-b-4 border-gray-200">
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-20">
                  <h2 className="text-base font-semibold text-gray-900">Suggestions for you</h2>
                  <p className="text-xs text-gray-600 mt-1">Based on your profile and activity</p>
                </div>
                <div className="space-y-0 divide-y divide-gray-100 bg-gray-50">
                  {filteredSuggestions.slice(0, 3).map((person) => (
                    <div key={person.id} className="p-4 hover:bg-white transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={person.image}
                            alt={person.name}
                            onClick={() => handleViewProfile(person)}
                            className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center">
                            <TrendingUp className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h3 
                                onClick={() => handleViewProfile(person)}
                                className="font-semibold text-gray-900 hover:underline cursor-pointer text-sm"
                              >
                                {person.name}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-1">{person.role}</p>
                            </div>
                            {person.status === 'pending' ? (
                              <Button size="sm" variant="outline" className="text-xs px-3 flex-shrink-0 bg-white" disabled>
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Button>
                            ) : (
                              <Button
                                onClick={() => {
                                  setSelectedPerson(person);
                                  setShowConnectionModal(true);
                                }}
                                size="sm"
                                className="bg-black text-white hover:bg-gray-800 text-xs px-3 flex-shrink-0"
                              >
                                Connect
                              </Button>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <div className="flex -space-x-1">
                                <div className="w-4 h-4 rounded-full bg-gray-300 border border-white" />
                                <div className="w-4 h-4 rounded-full bg-gray-400 border border-white" />
                              </div>
                              <span className="font-medium">{person.mutualConnections} Mutuals</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {person.location}
                            </div>
                          </div>
                          {person.skills && (
                            <div className="flex flex-wrap gap-1">
                              {person.skills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-white text-gray-700 text-[10px] rounded border border-gray-200">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* People you may know Section */}
              <div>
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-20">
                  <h2 className="text-base font-semibold text-gray-900">People you may know</h2>
                </div>
                <div className="space-y-0 divide-y divide-gray-100">
                  {filteredSuggestions.slice(3).map((person) => (
                    <div key={person.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <img 
                          src={person.image}
                          alt={person.name}
                          onClick={() => handleViewProfile(person)}
                          className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h3 
                                onClick={() => handleViewProfile(person)}
                                className="font-semibold text-gray-900 hover:underline cursor-pointer text-sm"
                              >
                                {person.name}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-1">{person.role}</p>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedPerson(person);
                                setShowConnectionModal(true);
                              }}
                              size="sm"
                              variant="outline"
                              className="text-xs px-3 flex-shrink-0"
                            >
                              Connect
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <div className="flex -space-x-1">
                                <div className="w-4 h-4 rounded-full bg-gray-300 border border-white" />
                                <div className="w-4 h-4 rounded-full bg-gray-400 border border-white" />
                              </div>
                              <span>{person.mutualConnections} Mutuals</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {person.location}
                            </div>
                          </div>
                          {person.skills && (
                            <div className="flex flex-wrap gap-1">
                              {person.skills.slice(0, 3).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

      {/* Popup Chat Windows */}
      <div className="fixed bottom-0 right-6 flex gap-3 z-40">
        {activeChatWindows.map((person, index) => (
          <div key={person.id} className="w-80 bg-white rounded-t-lg shadow-2xl border border-gray-200 flex flex-col" style={{ height: '400px' }}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <img src={person.image} alt={person.name} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-semibold text-sm text-gray-900">{person.name}</div>
                  <div className="text-xs text-gray-500">Online</div>
                </div>
              </div>
              <button onClick={() => closeChatWindow(person.id)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="text-center text-xs text-gray-500 mb-4">
                Start a conversation with {person.name}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    // Here you would save to the Message entity
                    console.log('Send message to:', person.email, e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Referrals</h3>
              <button onClick={() => setShowReferralModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-amber-600" />
                <p className="text-sm font-semibold text-gray-900">You have {referralsLeft} referrals left this month</p>
              </div>
              <p className="text-sm text-gray-600">
                Refer fellow creatives you believe are a good fit for our community. Your decisions on referrals are fast-tracked for review.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Referral requests (0)</h4>
              </div>
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No pending referral requests</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">Past referrals</h4>
              </div>
              <div className="text-center py-4 text-gray-500">
                <p className="text-xs">Your referral history will appear here</p>
              </div>
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