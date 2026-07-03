import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Artist, Team, Backer, ProjectOwner, Connection, Notification, Subscription } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast';
import { Search, MapPin, ChevronDown, Users, Building2, TrendingUp, Briefcase, X, UserCheck, UserX, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Maps the app's user.role values to the Connection entity's requester/recipient type enum
const ROLE_TO_TYPE = {
  artist: 'artist', artist_admin: 'artist',
  team: 'team', team_admin: 'team',
  backer: 'backer',
  client: 'client', project_owner: 'client',
};

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
  if (person.type === 'client') {
    return {
      id: person.id, type: 'client', name: person.full_name,
      role: person.company || 'Project Owner',
      location: '',
      image: person.profile_photo_url,
      email: person.email,
      skills: person.company ? [person.company] : [],
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
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [showSubFilter, setShowSubFilter] = useState(false);
  const [subscribedEmails, setSubscribedEmails] = useState(new Set());

  const [myProfile, setMyProfile] = useState(null);
  const [people, setPeople] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState('');

  const myType = ROLE_TO_TYPE[user?.role] || 'artist';

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [artists, teams, backers, clients, connectionsData] = await Promise.all([
          Artist.list(),
          Team.list(),
          Backer.list(),
          ProjectOwner.list(),
          Connection.list(),
        ]);

        console.log('Fetched connections from Supabase:', connectionsData);
        console.log('Current user email:', user.email);

        const allPeople = [
          ...artists.map(a => ({ ...a, type: 'artist' })),
          ...teams.map(t => ({ ...t, type: 'team' })),
          ...backers.map(b => ({ ...b, type: 'backer' })),
          ...clients.map(c => ({ ...c, type: 'client' })),
        ].map(toDisplay).filter(p => p.email !== user.email);

        setPeople(allPeople);

        // My own profile (used to score suggestions by skill/career niche overlap)
        if (myType === 'artist') {
          const mine = await Artist.filter({ email: user.email });
          setMyProfile(mine?.[0] || null);
        } else if (myType === 'team') {
          const mine = await Team.filter({ contact_email: user.email });
          setMyProfile(mine?.[0] || null);
        } else if (myType === 'backer') {
          const mine = await Backer.filter({ contact_email: user.email });
          setMyProfile(mine?.[0] || null);
        } else {
          const mine = await ProjectOwner.filter({ email: user.email });
          setMyProfile(mine?.[0] || null);
        }

        const myConnections = connectionsData.filter(c =>
          c.requester_email === user.email || c.recipient_email === user.email
        );
        console.log('My connections after filtering:', myConnections);
        console.log('Accepted connections:', myConnections.filter(c => c.status === 'accepted'));
        console.log('Pending connections:', myConnections.filter(c => c.status === 'pending'));
        
        setConnections(myConnections);
        setPendingRequests(myConnections.filter(c => c.recipient_email === user.email && c.status === 'pending'));

        // For backers/clients: track which creators have an active paid subscription
        if (myType === 'backer' || myType === 'client') {
          try {
            const activeSubs = await Subscription.filter({ status: 'active' });
            setSubscribedEmails(new Set(activeSubs.map(s => s.user_email)));
          } catch (subErr) {
            console.error('Error fetching subscriptions:', subErr);
          }
        }
      } catch (err) {
        console.error('Error fetching network data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, myType]);

  const getConnectionStatus = (person) => {
    const connection = connections.find(c =>
      (c.requester_email === user.email && c.recipient_email === person.email) ||
      (c.recipient_email === user.email && c.requester_email === person.email)
    );
    return connection ? connection.status : 'not_connected';
  };

  const refreshConnections = async () => {
    const connectionsData = await Connection.list();
    const mine = connectionsData.filter(c => c.requester_email === user.email || c.recipient_email === user.email);
    setConnections(mine);
    setPendingRequests(mine.filter(c => c.recipient_email === user.email && c.status === 'pending'));
    console.log('Refreshed connections:', mine.length, 'Pending:', mine.filter(c => c.status === 'pending').length, 'Accepted:', mine.filter(c => c.status === 'accepted').length);
  };

  const handleConnect = async () => {
    if (!selectedPerson) return;
    try {
      await Connection.create({
        requester_email: user.email,
        requester_type: myType,
        recipient_email: selectedPerson.email,
        recipient_type: selectedPerson.type,
        status: 'pending',
        message: connectionMessage,
      });
      await Notification.create({
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
      await refreshConnections();
    } catch (err) {
      console.error('Error sending connection:', err);
      error('Failed', 'Failed to send connection request');
    }
  };

  const handleAcceptConnection = async (connectionId) => {
    try {
      await Connection.update(connectionId, { status: 'accepted' });
      success('Accepted', 'You are now connected');
      await refreshConnections();
      // Also create a notification to the requester
      const connection = connections.find(c => c.id === connectionId);
      if (connection) {
        await Notification.create({
          recipient_email: connection.requester_email,
          sender_email: user.email,
          sender_name: user.full_name,
          type: 'connection_accepted',
          title: 'Connection Accepted',
          message: `${user.full_name} accepted your connection request`,
          action_required: false,
          read: false,
        });
      }
    } catch (err) {
      console.error('Error accepting connection:', err);
      error('Error', 'Failed to accept connection');
    }
  };

  const handleDeclineConnection = async (connectionId) => {
    try {
      await Connection.update(connectionId, { status: 'declined' });
      success('Declined', 'Connection request declined');
      await refreshConnections();
    } catch (err) {
      console.error('Error declining connection:', err);
      error('Error', 'Failed to decline connection');
    }
  };

  const handleCancelRequest = async (connectionId) => {
    try {
      await Connection.delete(connectionId);
      success('Cancelled', 'Connection request withdrawn');
      await refreshConnections();
    } catch (err) {
      console.error('Error cancelling connection:', err);
      error('Error', 'Failed to withdraw request');
    }
  };

  const handleMessage = (person) => {
    // Navigate to MessagesPage with the recipient's email as a query parameter
    navigate(createPageUrl('Messages') + `?with=${encodeURIComponent(person.email)}`);
  };

  const filterPerson = (person) => {
    if (selectedType !== 'all' && person.type !== selectedType) return false;
    if ((myType === 'backer' || myType === 'client') && subscriptionFilter !== 'all' && person.type === 'artist') {
      const isSubscribed = subscribedEmails.has(person.email);
      if (subscriptionFilter === 'subscribed' && !isSubscribed) return false;
      if (subscriptionFilter === 'free' && isSubscribed) return false;
    }
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return person.name?.toLowerCase().includes(q) ||
      person.role?.toLowerCase().includes(q) ||
      person.location?.toLowerCase().includes(q) ||
      person.skills?.some(s => s.toLowerCase().includes(q));
  };

  const myConnections = people.filter(p => getConnectionStatus(p) === 'accepted' && filterPerson(p));
  const notConnected = people.filter(p => getConnectionStatus(p) === 'not_connected' && filterPerson(p));
  const sentRequests = connections.filter(c => c.requester_email === user.email && c.status === 'pending');

  // Score suggestions by skill/role overlap with my profile — "career/niche" matching
  const myskillSet = new Set([
    myProfile?.role,
    ...(myProfile?.secondary_roles || []),
    ...((myProfile?.skills_experience || []).map(s => s.skill)),
    ...(myProfile?.specialties || []),
    ...(myProfile?.interests || []),
  ].filter(Boolean).map(s => s.toLowerCase()));

  const scorePerson = (person) => {
    if (myskillSet.size === 0) return 0;
    return (person.skills || []).filter(s => myskillSet.has((s || '').toLowerCase())).length;
  };

  const suggestions = notConnected
    .map(p => ({ ...p, matchScore: scorePerson(p) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const typeIcon = (type) => {
    if (type === 'team') return Building2;
    if (type === 'backer') return TrendingUp;
    if (type === 'client') return Briefcase;
    return Users;
  };

  if (!user || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-8">
      {/* Connection requests header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Connection requests ({pendingRequests.length})</h2>
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            {pendingRequests.map((request) => {
              const requester = people.find(p => p.email === request.requester_email);
              const TypeIcon = typeIcon(requester?.type);
              return (
                <div key={request.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-sm font-bold text-gray-600">
                      {requester?.image ? <img src={requester.image} alt={requester.name} className="w-full h-full object-cover" /> : (requester?.name?.[0] || request.requester_email[0]).toUpperCase()}
                    </div>
                    <TypeIcon className="w-4 h-4 absolute -bottom-1 -right-1 bg-black text-white rounded-full p-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-base">{requester?.name || request.requester_email}</div>
                    <div className="text-sm text-gray-600 mb-1">{requester?.role || 'User'}</div>
                    {request.message && <div className="text-xs text-gray-500 italic line-clamp-1">"{request.message}"</div>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleAcceptConnection(request.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">
                      Accept
                    </button>
                    <button onClick={() => handleDeclineConnection(request.id)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Requests you've sent — LinkedIn-style outgoing pending requests */}
      {sentRequests.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" /> Requests sent ({sentRequests.length})
          </h2>
          <div className="space-y-2">
            {sentRequests.map((request) => {
              const recipient = people.find(p => p.email === request.recipient_email);
              const TypeIcon = typeIcon(recipient?.type);
              return (
                <div key={request.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-sm font-bold text-gray-600">
                      {recipient?.image ? <img src={recipient.image} alt={recipient.name} className="w-full h-full object-cover" /> : (recipient?.name?.[0] || request.recipient_email[0]).toUpperCase()}
                    </div>
                    <TypeIcon className="w-4 h-4 absolute -bottom-1 -right-1 bg-black text-white rounded-full p-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-base">{recipient?.name || request.recipient_email}</div>
                    <div className="text-sm text-gray-600 mb-1">{recipient?.role || 'User'}</div>
                    {request.message && <div className="text-xs text-gray-500 italic line-clamp-1">"{request.message}"</div>}
                  </div>
                  <button onClick={() => handleCancelRequest(request.id)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors flex-shrink-0">
                    Cancel
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              {['all', 'artist', 'team', 'backer', 'client'].map(type => (
                <button key={type} onClick={() => { setSelectedType(type); setShowTypeFilter(false); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm capitalize">
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          )}
        </div>
        {(myType === 'backer' || myType === 'client') && (
          <div className="relative">
            <button
              onClick={() => setShowSubFilter(!showSubFilter)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              {subscriptionFilter === 'all' ? 'All Creators' : subscriptionFilter === 'subscribed' ? 'Subscribed' : 'No Subscription'}
              <ChevronDown className="w-4 h-4" />
            </button>
            {showSubFilter && (
              <div className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                {[
                  { value: 'all', label: 'All Creators' },
                  { value: 'subscribed', label: 'Subscribed (Paid)' },
                  { value: 'free', label: 'No Subscription' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => { setSubscriptionFilter(opt.value); setShowSubFilter(false); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm">
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Two column layout */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
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
            {suggestions.map((person) => {
              const TypeIcon = typeIcon(person.type);
              return (
                <div key={`${person.type}-${person.id}`} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-sm font-bold text-gray-600">
                        {person.image ? <img src={person.image} alt={person.name} className="w-full h-full object-cover" /> : person.name?.[0]?.toUpperCase()}
                      </div>
                      <TypeIcon className="w-3 h-3 absolute -bottom-1 -right-1 bg-black text-white rounded-full p-0.5" />
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
              );
            })}
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