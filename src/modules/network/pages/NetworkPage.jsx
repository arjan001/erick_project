import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Artist, Team, Backer, ProjectOwner, Connection, Notification, Subscription, User } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast'
import { Search, MapPin, ChevronDown, Users, Building2, TrendingUp, Briefcase, X, UserCheck, UserX, MessageCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ROLE_TO_TYPE = {
  artist: 'artist', artist_admin: 'artist',
  team: 'team', team_admin: 'team',
  backer: 'backer',
  client: 'client', project_owner: 'client',
}

const typeIcon = (type) => {
  if (type === 'team') return Building2
  if (type === 'backer') return TrendingUp
  if (type === 'client') return Briefcase
  return Users
}

export default function NetworkPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showTypeFilter, setShowTypeFilter] = useState(false)
  const [subscriptionFilter, setSubscriptionFilter] = useState('all')
  const [showSubFilter, setShowSubFilter] = useState(false)
  const [subscribedEmails, setSubscribedEmails] = useState(new Set())

  const [myProfile, setMyProfile] = useState(null)
  const [people, setPeople] = useState([])
  const [connections, setConnections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])

  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [connectionMessage, setConnectionMessage] = useState('')

  const myType = ROLE_TO_TYPE[user?.role] || 'artist'

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch connections using production schema (user_id, connected_artist_id)
        const connectionsData = await Connection.filter({ user_id: user.id }).catch(() => [])

        // Fetch all users from public.users
        const allUsers = await User.list().catch(() => [])
        const otherUsers = allUsers.filter(u => u.id !== user.id && u.email !== user.email)

        // Transform users to people array
        const allPeople = otherUsers.map(u => ({
          id: u.id,
          type: u.role || 'user',
          name: u.full_name || u.email,
          role: u.role || 'User',
          location: u.location || 'Kenya',
          image: u.avatar_url,
          email: u.email,
          skills: u.skills || [],
          profession: u.profession,
        }))

        setPeople(allPeople)

        // My own profile
        if (myType === 'artist') {
          const mine = await Artist.filter({ email: user.email }).catch(() => [])
          setMyProfile(mine?.[0] || null)
        } else if (myType === 'team') {
          const mine = await Team.filter({ user_id: user.id }).catch(() => [])
          setMyProfile(mine?.[0] || null)
        } else if (myType === 'backer') {
          const mine = await Backer.filter({ user_id: user.id }).catch(() => [])
          setMyProfile(mine?.[0] || null)
        } else {
          const mine = await ProjectOwner.filter({ user_id: user.id }).catch(() => [])
          setMyProfile(mine?.[0] || null)
        }

        setConnections(connectionsData)
        setPendingRequests(connectionsData.filter(c => c.connected_artist_id === user.id && c.status === 'pending'))

        // For backers/clients: track which creators have an active paid subscription
        if (myType === 'backer' || myType === 'client') {
          try {
            const activeSubs = await Subscription.filter({ status: 'active' }).catch(() => [])
            setSubscribedEmails(new Set(activeSubs.map(s => s.user_email)))
          } catch (subErr) {
            console.error('Error fetching subscriptions:', subErr)
          }
        }
      } catch (err) {
        console.error('Error fetching network data:', err)
        error('Error', 'Failed to load network data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, myType])

  const getConnectionStatus = (person) => {
    const connection = connections.find(c =>
      (c.user_id === user.id && c.connected_artist_id === person.id) ||
      (c.connected_artist_id === user.id && c.user_id === person.id)
    )
    return connection ? connection.status : 'not_connected'
  }

  const refreshConnections = async () => {
    try {
      const connectionsData = await Connection.filter({ user_id: user.id }).catch(() => [])
      setConnections(connectionsData)
      setPendingRequests(connectionsData.filter(c => c.connected_artist_id === user.id && c.status === 'pending'))
    } catch (err) {
      console.error('Error refreshing connections:', err)
    }
  }

  const handleConnect = async () => {
    if (!selectedPerson) return

    // Check if already connected or request sent
    const existingStatus = getConnectionStatus(selectedPerson)
    if (existingStatus !== 'not_connected') {
      error('Error', existingStatus === 'pending' ? 'Request already sent' : 'Already connected')
      return
    }

    try {
      await Connection.create({
        user_id: user.id,
        connected_artist_id: selectedPerson.id,
        connection_type: 'network',
        status: 'pending',
        metadata: { message: connectionMessage },
      })
      await Notification.create({
        user_id: selectedPerson.id,
        type: 'connection_request',
        title: 'New Connection Request',
        content: `${user.full_name || user.email} wants to connect with you`,
        link_url: '/Network',
        is_read: false,
      })
      setShowConnectionModal(false)
      setConnectionMessage('')
      success('Sent', `Connection request sent to ${selectedPerson.name}`)
      await refreshConnections()
    } catch (err) {
      console.error('Error sending connection:', err)
      error('Failed', 'Failed to send connection request')
    }
  }

  const handleAcceptConnection = async (connectionId) => {
    try {
      await Connection.update(connectionId, { status: 'accepted' })
      success('Accepted', 'You are now connected')
      await refreshConnections()
      const connection = connections.find(c => c.id === connectionId)
      if (connection) {
        await Notification.create({
          user_id: connection.user_id,
          type: 'connection_accepted',
          title: 'Connection Accepted',
          content: `${user.full_name || user.email} accepted your connection request`,
          link_url: '/Network',
          is_read: false,
        })
      }
    } catch (err) {
      console.error('Error accepting connection:', err)
      error('Error', 'Failed to accept connection')
    }
  }

  const handleDeclineConnection = async (connectionId) => {
    try {
      await Connection.update(connectionId, { status: 'declined' })
      success('Declined', 'Connection request declined')
      await refreshConnections()
    } catch (err) {
      console.error('Error declining connection:', err)
      error('Error', 'Failed to decline connection')
    }
  }

  const handleCancelRequest = async (connectionId) => {
    try {
      await Connection.delete(connectionId)
      success('Cancelled', 'Connection request withdrawn')
      await refreshConnections()
    } catch (err) {
      console.error('Error cancelling connection:', err)
      error('Error', 'Failed to withdraw request')
    }
  }

  const handleMessage = (person) => {
    navigate(createPageUrl('Messages') + `?with=${encodeURIComponent(person.id)}`)
  }

  const filterPerson = (person) => {
    if (selectedType !== 'all' && person.type !== selectedType) return false
    if ((myType === 'backer' || myType === 'client') && subscriptionFilter !== 'all' && person.type === 'artist') {
      const isSubscribed = subscribedEmails.has(person.email)
      if (subscriptionFilter === 'subscribed' && !isSubscribed) return false
      if (subscriptionFilter === 'free' && isSubscribed) return false
    }
    const q = searchQuery.toLowerCase()
    if (!q) return true
    return person.name?.toLowerCase().includes(q) ||
      person.role?.toLowerCase().includes(q) ||
      person.location?.toLowerCase().includes(q) ||
      person.skills?.some(s => s.toLowerCase().includes(q))
  }

  const myConnections = people.filter(p => getConnectionStatus(p) === 'accepted' && filterPerson(p))
  const notConnected = people.filter(p => getConnectionStatus(p) === 'not_connected' && filterPerson(p))
  const sentRequests = connections.filter(c => c.user_id === user.id && c.status === 'pending')

  const myskillSet = new Set([
    myProfile?.role,
    ...(myProfile?.skills || []),
  ].filter(Boolean).map(s => s.toLowerCase()))

  const scorePerson = (person) => {
    if (myskillSet.size === 0) return 0
    return (person.skills || []).filter(s => myskillSet.has((s || '').toLowerCase())).length
  }

  const suggestions = notConnected
    .map(p => ({ ...p, matchScore: scorePerson(p) }))
    .sort((a, b) => b.matchScore - a.matchScore)

  if (!user || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Connection requests header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">Connection requests ({pendingRequests.length})</h2>
        {pendingRequests.length > 0 && (
          <div className="space-y-2">
            {pendingRequests.map((request) => {
              const requester = people.find(p => p.id === request.user_id)
              const TypeIcon = typeIcon(requester?.type)
              return (
                <div key={request.id} className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded hover:border-gray-300 transition-colors">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-xs font-bold text-gray-600">
                      {requester?.image ? <img src={requester.image} alt={requester.name} className="w-full h-full object-cover" /> : (requester?.name?.[0] || request.user_id[0]).toUpperCase()}
                    </div>
                    <TypeIcon className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 bg-black text-white rounded-full p-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{requester?.name || request.user_id}</div>
                    <div className="text-xs text-gray-600">{requester?.role || 'User'}</div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => handleAcceptConnection(request.id)} className="px-2.5 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium transition-colors">
                      Accept
                    </button>
                    <button onClick={() => handleDeclineConnection(request.id)} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Requests you've sent - datatable style */}
      {sentRequests.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200 bg-white flex-shrink-0">
          <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" /> Requests sent ({sentRequests.length})
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">User</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Role</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sentRequests.map((request) => {
                  const recipient = people.find(p => p.id === request.connected_artist_id)
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-xs font-bold text-gray-600">
                            {recipient?.image ? <img src={recipient.image} alt={recipient.name} className="w-full h-full object-cover" /> : (recipient?.name?.[0] || request.connected_artist_id[0]).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{recipient?.name || request.connected_artist_id}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600">{recipient?.role || 'User'}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => handleCancelRequest(request.id)} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-medium transition-colors">
                          Cancel
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
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
            className="px-3 py-2 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            {selectedType === 'all' ? 'All Types' : selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {showTypeFilter && (
            <div className="absolute z-50 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg">
              {['all', 'artist', 'team', 'backer', 'client'].map(type => (
                <button key={type} onClick={() => { setSelectedType(type); setShowTypeFilter(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs capitalize">
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
              className="px-3 py-2 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              {subscriptionFilter === 'all' ? 'All Creators' : subscriptionFilter === 'subscribed' ? 'Subscribed' : 'No Subscription'}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showSubFilter && (
              <div className="absolute z-50 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                {[
                  { value: 'all', label: 'All Creators' },
                  { value: 'subscribed', label: 'Subscribed (Paid)' },
                  { value: 'free', label: 'No Subscription' },
                ].map(opt => (
                  <button key={opt.value} onClick={() => { setSubscriptionFilter(opt.value); setShowSubFilter(false); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-xs">
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
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-xs font-semibold text-gray-900">Connections ({myConnections.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {myConnections.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-500">No connections yet</div>
            )}
            {myConnections.map((person) => (
              <div key={`${person.type}-${person.id}`} className="p-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden text-xs font-bold text-gray-600">
                    {person.image ? <img src={person.image} alt={person.name} className="w-full h-full object-cover" /> : person.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{person.name}</h3>
                        <p className="text-xs text-gray-600 line-clamp-1">{person.role}</p>
                      </div>
                      <Button onClick={() => handleMessage(person)} size="sm" variant="outline" className="text-xs px-2 py-1 flex-shrink-0">
                        <MessageCircle className="w-3 h-3 mr-1" /> Message
                      </Button>
                    </div>
                    {person.location && <div className="flex items-center gap-1 text-xs text-gray-500"><MapPin className="w-3 h-3" />{person.location}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto">
          <div className="p-3 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-xs font-semibold text-gray-900">Suggested for you</h2>
            <p className="text-xs text-gray-600 mt-0.5">Matched by skill and career niche</p>
          </div>
          <div className="divide-y divide-gray-100">
            {suggestions.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-500">No suggestions available</div>
            )}
            {suggestions.map((person) => {
              const TypeIcon = typeIcon(person.type)
              return (
                <div key={`${person.type}-${person.id}`} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-xs font-bold text-gray-600">
                        {person.image ? <img src={person.image} alt={person.name} className="w-full h-full object-cover" /> : person.name?.[0]?.toUpperCase()}
                      </div>
                      <TypeIcon className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 bg-black text-white rounded-full p-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{person.name}</h3>
                          <p className="text-xs text-gray-600 line-clamp-1">{person.role}</p>
                        </div>
                        {getConnectionStatus(person) === 'pending' ? (
                          <Button size="sm" variant="outline" className="text-xs px-2 py-1 flex-shrink-0" disabled>Pending</Button>
                        ) : (
                          <Button onClick={() => { setSelectedPerson(person); setShowConnectionModal(true); }} size="sm" className="bg-black text-white hover:bg-gray-800 text-xs px-2 py-1 flex-shrink-0">Connect</Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        {person.matchScore > 0 && <span className="font-medium text-indigo-600">{person.matchScore} skill match{person.matchScore > 1 ? 'es' : ''}</span>}
                        {person.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{person.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
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
  )
}
