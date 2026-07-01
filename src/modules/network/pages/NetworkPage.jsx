import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast';
import { Search, MapPin, ChevronDown, Users, Building2, TrendingUp, X, UserCheck, UserX, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const toDisplay = (person) => {
  if (person.type === 'artist') {
    return {
      id: person.id, type: 'artist', name: person.full_name,
      role: [person.role, ...(person.secondary_roles || [])].filter(Boolean).join(', '),
      location: [person.based_in_city, person.based_in_country].filter(Boolean).join(', '),
      image: person.profile_photo_url,
      email: person.email,
      skills: (person.skills_experience || []).map(s => s.skill).concat(person.secondary_roles || [], person.role ? [person.role] : []),
    };
  }
  if (person.type === 'team') {
    return {
      id: person.id, type: 'team', name: person.team_name,
      role: (person.specialties || []).join(', '),
      location: [person.city, person.country].filter(Boolean).join(', '),
      image: person.team_logo_url,
      email: person.contact_email,
      skills: person.specialties || [],
    };
  }
  return {
    id: person.id, type: 'backer', name: person.organization_name,
    role: (person.interests || []).join(', '),
    location: (person.locations || []).join(', '),
    image: person.logo_url,
    email: person.contact_email,
    skills: person.interests || [],
  };
};

export default function NetworkPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const [myProfile, setMyProfile] = useState(null);
  const [people, setPeople] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [artists, teams, backers, connectionsData, myArtist] = await Promise.all([
          base44.entities.Artist.list(),
          base44.entities.Team.list(),
          base44.entities.Backer.list(),
          base44.entities.Connection.list(),
          base44.entities.Artist.filter({ email: user.email }),
        ]);

        const allPeople = [
          ...artists.filter(a => a.email !== user.email).map(a => ({ ...a, type: 'artist' })),
          ...teams.map(t => ({ ...t, type: 'team' })),
          ...backers.map(b => ({ ...b, type: 'backer' })),
        ].map(toDisplay);

        setPeople(allPeople);
        setMyProfile(myArtist?.[0] || null);

        const myConnections = connectionsData.filter(c =>
          c.requester_email === user.email || c.recipient_email === user.email
        );
        setConnections(myConnections);
        setPendingRequests(myConnections.filter(c => c.recipient_email === user.email && c.status === 'pending'));
      } catch (err) {
        console.error('Error fetching network data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getConnectionStatus = (person) => {
    const connection = connections.find(c =>
      (c.requester_email === user.email && c.recipient_email === person.email) ||
      (c.recipient_email === user.email && c.requester_email === person.email)
    );
    return connection ? connection.status : 'not_connected';
  };

  const handleConnect = async () => {
    if (!selectedPerson) return;
    try {
      await base44.entities.Connection.create({
        requester_email: user.email,
        requester_type: 'artist',
        recipient_email: selectedPerson.email,
        recipient_type: selectedPerson.type,
        status: 'pending',
        message: connectionMessage,
      });
      await base44.entities.Notification.create({
        recipient_email: selectedPerson.email,
        sender_email: user.email,
        sender_name: user.full_name,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${user.full_name} wants to connect with you`,
        action_required: true,
      });
      setShowConnectionModal(false);
      setConnectionMessage('');
      success('Sent', `Connection request sent to ${selectedPerson.name}`);
      const connectionsData = await base44.entities.Connection.list();
      setConnections(connectionsData.filter(c => c.requester_email === user.email || c.recipient_email === user.email));
    } catch (err) {
      console.error('Error sending connection:', err);
      error('Failed', 'Failed to send connection request');
    }
  };

  const handleAcceptConnection = async (connectionId) => {
    try {
      await base44.entities.Connection.update(connectionId, { status: 'accepted' });
      success('Accepted', 'You are now connected');
      const connectionsData = await base44.entities.Connection.list();
      const mine = connectionsData.filter(c => c.requester_email === user.email || c.recipient_email === user.email);
      setConnections(mine);
      setPendingRequests(mine.filter(c => c.recipient_email === user.email && c.status === 'pending'));
    } catch (err) {
      console.error('Error accepting connection:', err);
      error('Error', 'Failed to accept connection');
    }
  };

  const handleDeclineConnection = async (connectionId) => {
    try {
      await base44.entities.Connection.update(connectionId, { status: 'declined' });
      success('Declined', 'Connection request declined');
      const connectionsData = await base44.entities.Connection.list();
      const mine = connectionsData.filter(c => c.requester_email === user.email || c.recipient_email === user.email);
      setConnections(mine);
      setPendingRequests(mine.filter(c => c.recipient_email === user.email && c.status === 'pending'));
    } catch (err) {
      console.error('Error declining connection:', err);
      error('Error', 'Failed to decline connection');
    }
  };

  const handleMessage = (person) => {
    navigate(createPageUrl('Messages') + `?with=${encodeURIComponent(person.email)}`);
  };

  const filterPerson = (person) => {
    if (selectedType !== 'all' && person.type !== selectedType) return false;
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return person.name?.toLowerCase().includes(q) ||
      person.role?.toLowerCase().includes(q) ||
      person.location?.toLowerCase().includes(q) ||
      person.skills?.some(s => s.toLowerCase().includes(q));
  };

  const myConnections = people.filter(p => getConnectionStatus(p) === 'accepted' && filterPerson(p));
  const notConnected = people.filter(p => getConnectionStatus(p) === 'not_connected' && filterPerson(p));

  // Score suggestions by skill/role overlap with my profile — "career/niche" matching
  const myskillSet = new Set([
    myProfile?.role,
    ...(myProfile?.secondary_roles || []),
    ...((myProfile?.skills_experience || []).map(s => s.skill)),
  ].filter(Boolean).map(s => s.toLowerCase()));

  const scorePerson = (person) => {
    if (myskillSetSize() === 0) return 0;
    return (person.skills || []).filter(s => mySkillSetHas(s)).length;
  };
  function myskillSetSize() { return myskillSet.size; }
  function mySkillSetHas(skill) { return myskillSet.has((skill || '').toLowerCase()); }

  const suggestions = notConnected
    .map(p => ({ ...p, matchScore: scorePerson(p) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  if (!user || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Connection requests header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Connection requests ({pendingRequests.length})</h2>
        {pendingRequests.length > 0 && (
          <div className="space-y-2">
            {pendingRequests.map((request) => {
              const requester = people.find(p => p.email === request.requester_email);
              return (
                <div key={request.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 overflow-hidden">
                    {requester?.image ? <img src={requester.image} alt={requester.name} className="w-full h-full object-cover" /> : (requester?.name?.[0] || request.requester_email[0]).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{requester?.name || request.requester_email}</div>
                    <div className="text-xs text-gray-600 truncate">{request.message || 'Wants to connect with you'}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleAcceptConnection(request.id)} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Accept">
                      <UserCheck className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeclineConnection(request.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Decline">
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search + filter */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, skill, or location..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowTypeFilter(!showTypeFilter)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            {selectedType === 'all' ? 'All Types' : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showTypeFilter && (
            <div className="absolute z-50 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
              {['all', 'artist', 'team', 'backer'].map(type => (
                <button key={type} onClick={() => { setSelectedType(type); setShowTypeFilter(false); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm capitalize">
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two column layout */}
      <div className="flex-1 overflow-hidden grid grid-cols-2">
        <div className="overflow-y-auto border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-sm font-semibold text-gray-900">Connections ({myConnections.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {myConnections.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No connections yet</div>
            )}
            {myConnections.map((person) => (
              <div key={`${person.type}-${person.id}`} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden text-sm font-bold text-gray-600">
                    {person.image ? <img src={person.image} alt={person.name} className="w-full h-full object-cover" /> : person.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{person.name}</h3>
                        <p className="text-xs text-gray-600 line-clamp-1 mb-1">{person.role}</p>
                        {person.location && <div className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />{person.location}</div>}
                      </div>
                      <Button onClick={() => handleMessage(person)} size="sm" variant="outline" className="text-xs px-3 flex-shrink-0">
                        <MessageCircle className="w-3 h-3 mr-1" /> Message
                      </Button>
                    </div>
                    {person.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {person.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-sm font-semibold text-gray-900">Suggested for you</h2>
            <p className="text-xs text-gray-600 mt-1">Matched by skill and career niche</p>
          </div>
          <div className="divide-y divide-gray-100">
            {suggestions.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No suggestions available</div>
            )}
            {suggestions.map((person) => (
              <div key={`${person.type}-${person.id}`} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-sm font-bold text-gray-600">
                      {person.image ? <img src={person.image} alt={person.name} className="w-full h-full object-cover" /> : person.name?.[0]?.toUpperCase()}
                    </div>
                    {person.type === 'team' ? <Building2 className="w-3 h-3 absolute -bottom-1 -right-1 bg-black text-white rounded-full p-0.5" /> :
                      person.type === 'backer' ? <TrendingUp className="w-3 h-3 absolute -bottom-1 -right-1 bg-black text-white rounded-full p-0.5" /> :
                      <Users className="w-3 h-3 absolute -bottom-1 -right-1 bg-black text-white rounded-full p-0.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{person.name}</h3>
                        <p className="text-xs text-gray-600 line-clamp-1">{person.role}</p>
                      </div>
                      {getConnectionStatus(person) === 'pending' ? (
                        <Button size="sm" variant="outline" className="text-xs px-3 flex-shrink-0" disabled>Pending</Button>
                      ) : (
                        <Button onClick={() => { setSelectedPerson(person); setShowConnectionModal(true); }} size="sm" className="bg-black text-white hover:bg-gray-800 text-xs px-3 flex-shrink-0">Connect</Button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                      {person.matchScore > 0 && <span className="font-medium text-indigo-600">{person.matchScore} skill match{person.matchScore > 1 ? 'es' : ''}</span>}
                      {person.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{person.location}</span>}
                    </div>
                    {person.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {person.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">{skill}</span>
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

      {showConnectionModal && selectedPerson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Connect with {selectedPerson.name}</h3>
              <button onClick={() => setShowConnectionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={connectionMessage}
              onChange={(e) => setConnectionMessage(e.target.value)}
              placeholder="Hi! I'd love to connect and explore potential collaboration opportunities..."
              className="w-full h-28 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-400 resize-none mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={() => setShowConnectionModal(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleConnect} className="flex-1 bg-black text-white hover:bg-gray-800">Send Request</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}