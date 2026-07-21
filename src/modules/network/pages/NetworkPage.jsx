import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Artist, Team, Backer, ProjectOwner, Connection, Notification, Subscription } from '@/lib/supabaseEntities';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast';
import { Search, MapPin, ChevronDown, Users, Building2, TrendingUp, Briefcase, X, UserCheck, UserX, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import notificationService from '@/shared/services/notificationService';

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
  const [activeTab, setActiveTab] = useState('connections'); // 'connections', 'sent', 'pending'
  const [showSubFilter, setShowSubFilter] = useState(false);
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
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
        // Fetch connections where I'm the requester OR the recipient (two queries
        // because Supabase RLS may restrict list-all, and .or() isn't supported
        // in the simple filter builder).
        const [sentConns, receivedConns] = await Promise.all([
          Connection.filter({ requester_email: user.email }),
          Connection.filter({ recipient_email: user.email }),
        ]);
        const connectionsData = [...(sentConns || []), ...(receivedConns || [])];
        // Deduplicate by id (in case both queries return the same row)
        const seenIds = new Set();
        const uniqueConns = connectionsData.filter(c => {
          if (seenIds.has(c.id)) return false;
          seenIds.add(c.id);
          return true;
        });

        const [artists, teams, backers, clients] = await Promise.all([
          Artist.list(),
          Team.list(),
          Backer.list(),
          ProjectOwner.list(),
        ]);

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

  const getMutualConnections = (personEmail) => {
    // Find all accepted connections for the current user
    const myAcceptedConnections = connections.filter(c =>
      (c.requester_email === user.email || c.recipient_email === user.email) && c.status === 'accepted'
    );

    // Find all accepted connections for the other person
    const theirAcceptedConnections = connections.filter(c =>
      (c.requester_email === personEmail || c.recipient_email === personEmail) && c.status === 'accepted'
    );

    // Extract email addresses from both sets
    const myConnectionsEmails = new Set();
    myAcceptedConnections.forEach(c => {
      if (c.requester_email === user.email) myConnectionsEmails.add(c.recipient_email);
      else myConnectionsEmails.add(c.requester_email);
    });

    const theirConnectionsEmails = new Set();
    theirAcceptedConnections.forEach(c => {
      if (c.requester_email === personEmail) theirConnectionsEmails.add(c.recipient_email);
      else theirConnectionsEmails.add(c.requester_email);
    });

    // Find mutual connections
    const mutualEmails = [...myConnectionsEmails].filter(email => theirConnectionsEmails.has(email));

    // Get the actual person objects for mutual connections
    const mutualPeople = people.filter(p => mutualEmails.includes(p.email));

    return mutualPeople;
  };

  const refreshConnections = async () => {
    const [sent, received] = await Promise.all([
      Connection.filter({ requester_email: user.email }),
      Connection.filter({ recipient_email: user.email }),
    ]);
    const all = [...(sent || []), ...(received || [])];
    const seen = new Set();
    const mine = all.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
    setConnections(mine);
    setPendingRequests(mine.filter(c => c.recipient_email === user.email && c.status === 'pending'));
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
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${user.full_name} wants to connect with you`,
        metadata: { sender_email: user.email, sender_name: user.full_name, connection_message: connectionMessage },
        read: false
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
          type: 'connection_request',
          title: 'Connection Accepted',
          message: `${user.full_name} accepted your connection request`,
          metadata: { sender_email: user.email, sender_name: user.full_name },
          read: false
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
  const receivedRequests = connections.filter(c => c.recipient_email === user.email && c.status === 'pending');

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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('connections')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'connections' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Connections ({myConnections.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'sent' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sent Requests ({sentRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'pending' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Requests ({receivedRequests.length})
          </button>
        </div>
      </div>

      {/* Search + filter - only show on connections tab */}
      {activeTab === 'connections' && (
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
      )}

      {/* Content based on active tab */}
      {activeTab === 'connections' && (
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
                const mutuals = getMutualConnections(person.email);
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
                            {mutuals.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="flex -space-x-2">
                                  {mutuals.slice(0, 3).map((mutual, idx) => (
                                    <div key={idx} className="w-4 h-4 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                                      {mutual.image ? (
                                        <img src={mutual.image} alt={mutual.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[7px] font-bold text-gray-600">
                                          {mutual.name?.[0]?.toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <span className="text-[10px] text-gray-500">{mutuals.length} mutual{mutuals.length > 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>
                          {getConnectionStatus(person) === 'pending' ? (
                            <Button size="sm" variant="outline" className="text-xs px-3 flex-shrink-0" disabled>Pending</Button>
                          ) : (
                            <Button onClick={() => { setSelectedPerson(person); setShowConnectionModal(true); }} size="sm" className="bg-black text-white hover:bg-gray-800 text-xs px-3 flex-shrink-0">Connect</Button>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                          {person.matchScore > 0 && <span className="font-medium text-gray-900">{person.matchScore} skill match{person.matchScore > 1 ? 'es' : ''}</span>}
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
      )}

      {activeTab === 'sent' && (
        <div className="flex-1 overflow-y-auto p-6">
          {sentRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sent requests</h3>
              <p className="text-gray-600">You haven't sent any connection requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sentRequests.map((request) => {
                const recipient = people.find(p => p.email === request.recipient_email);
                const TypeIcon = typeIcon(recipient?.type);
                return (
                  <div key={request.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-sm font-bold text-gray-600">
                        {recipient?.image ? <img src={recipient.image} alt={recipient.name} className="w-full h-full object-cover" /> : (recipient?.name?.[0] || request.recipient_email[0]).toUpperCase()}
                      </div>
                      <TypeIcon className="w-4 h-4 absolute -bottom-0.5 -right-0.5 bg-black text-white rounded-full p-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{recipient?.name || request.recipient_email}</div>
                      <div className="text-sm text-gray-600 mb-1">{recipient?.role || 'User'}</div>
                      {request.message && <div className="text-sm text-gray-500 italic line-clamp-2">"{request.message}"</div>}
                    </div>
                    <button onClick={() => handleCancelRequest(request.id)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors flex-shrink-0">
                      Cancel
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="flex-1 overflow-y-auto p-6">
          {receivedRequests.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-600">You don't have any pending connection requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedRequests.map((request) => {
                const requester = people.find(p => p.email === request.requester_email);
                const TypeIcon = typeIcon(requester?.type);
                return (
                  <div key={request.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-sm font-bold text-gray-600">
                        {requester?.image ? <img src={requester.image} alt={requester.name} className="w-full h-full object-cover" /> : (requester?.name?.[0] || request.requester_email[0]).toUpperCase()}
                      </div>
                      <TypeIcon className="w-4 h-4 absolute -bottom-0.5 -right-0.5 bg-black text-white rounded-full p-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900">{requester?.name || request.requester_email}</div>
                      <div className="text-sm text-gray-600 mb-1">{requester?.role || 'User'}</div>
                      {request.message && <div className="text-sm text-gray-500 italic line-clamp-2">"{request.message}"</div>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleAcceptConnection(request.id)} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 text-sm font-medium transition-colors">
                        Accept
                      </button>
                      <button onClick={() => handleDeclineConnection(request.id)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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