import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Artist, Team, Client, Backer, Connection, Notification, Subscription, User } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast'
import { Search, MapPin, ChevronDown, Building2, TrendingUp, Briefcase, X, UserCheck, UserX, MessageCircle, Clock, User as UserIcon, Building, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import notificationService from '@/shared/services/notificationService'
import ArtistProfileDrawer from '@/components/artist/ArtistProfileDrawer'

const ONLINE_THRESHOLD_MS = 90 * 1000 // consider online if active within last 90s

const isOnline = (lastActive) => lastActive && (Date.now() - new Date(lastActive).getTime()) < ONLINE_THRESHOLD_MS

const typeIcon = (type) => {
  if (type === 'team' || type === 'team_admin') return Building2
  if (type === 'backer') return TrendingUp
  if (type === 'client' || type === 'project_owner') return Briefcase
  return UserIcon
}

export default function NetworkPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [activeTab, setActiveTab] = useState('connections') // 'connections', 'sent', 'pending'

  const [allPeople, setAllPeople] = useState([])
  const [myConnections, setMyConnections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])

  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [connectionMessage, setConnectionMessage] = useState('')
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)
  const [selectedArtistId, setSelectedArtistId] = useState(null)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('NetworkPage: Loading data for user', user.id, 'role:', user.role)

      // Fetch ALL users from public.users table
      const allUsers = await User.list().catch((err) => {
        console.error('Error fetching users:', err)
        return []
      })
      console.log('All users loaded:', allUsers.length)

      // Filter out current user
      const otherUsers = allUsers.filter(u => u.id !== user.id && u.email !== user.email)
      console.log('Other users after filtering:', otherUsers.length)

      // Transform to unified format
      const people = otherUsers.map(u => ({
        id: u.id,
        type: u.role || 'user',
        name: u.full_name || u.email,
        role: u.role || 'User',
        location: u.location || 'Kenya',
        image: u.avatar_url,
        skills: u.skills || [],
        profession: u.profession,
        isOnline: isOnline(u.last_active),
        email: u.email,
      }))

      console.log('Transformed people:', people.length)
      setAllPeople(people)

      // Fetch connections - get all connections where user is involved
      const connectionsData = await Connection.filter({ user_id: user.id }).catch(() => [])
      console.log('NetworkPage: Connections loaded:', connectionsData.length)

      // Filter correctly:
      // - My accepted connections: status = accepted (I'm either sender or receiver)
      // - Requests I sent: user_id = me AND status = pending
      // - Requests I received: connected_user_id = me AND status = pending
      const accepted = connectionsData.filter(c => c.status === 'accepted')
      const sentRequests = connectionsData.filter(c => c.user_id === user.id && c.status === 'pending')
      const receivedRequests = connectionsData.filter(c => c.connected_user_id === user.id && c.status === 'pending')

      setMyConnections(accepted)
      setPendingRequests(receivedRequests) // Only show requests I received to accept

    } catch (err) {
      console.error('NetworkPage: Error loading data:', err)
      error('Error', 'Failed to load network data')
    } finally {
      setLoading(false)
    }
  }

  const sendConnectionRequest = async (person) => {
    try {
      await Connection.create({
        user_id: user.id,
        connected_user_id: person.id,
        connection_type: 'network',
        status: 'pending',
        metadata: { message: connectionMessage },
      })

      // Send notification
      await Notification.create({
        user_id: person.id,
        type: 'connection_request',
        title: 'New Connection Request',
        content: `${user.full_name || user.email} wants to connect with you.`,
        link_url: '/Network',
        is_read: false,
      })

      success('Request Sent', 'Connection request sent successfully')
      setShowConnectionModal(false)
      setConnectionMessage('')
      setSelectedPerson(null)
      loadData()
    } catch (err) {
      console.error('Error sending connection request:', err)
      error('Error', 'Failed to send connection request')
    }
  }

  const acceptConnection = async (connection) => {
    try {
      await Connection.update(connection.id, { status: 'accepted' })

      await Notification.create({
        user_id: connection.user_id,
        type: 'connection_request',
        title: 'Connection Accepted',
        content: `${user.full_name || user.email} accepted your connection request.`,
        link_url: '/Network',
        is_read: false,
      })

      success('Accepted', 'Connection accepted')
      loadData()
    } catch (err) {
      console.error('Error accepting connection:', err)
      error('Error', 'Failed to accept connection')
    }
  }

  const rejectConnection = async (connection) => {
    try {
      await Connection.update(connection.id, { status: 'declined' })
      success('Declined', 'Connection request declined')
      loadData()
    } catch (err) {
      console.error('Error rejecting connection:', err)
      error('Error', 'Failed to decline connection')
    }
  }

  const startChat = (person) => {
    navigate(`/Messages?with=${person.id}`)
  }

  // Filter people based on search and type
  const filteredPeople = allPeople.filter(p => {
    const matchesSearch = (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profession?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === 'all' || p.type === selectedType
    return matchesSearch && matchesType
  })

  // Get connected user IDs - use connected_user_id
  const connectedUserIds = new Set(myConnections.map(c => c.connected_user_id))
  const pendingUserIds = new Set(pendingRequests.map(c => c.connected_user_id))

  // People available to connect (not already connected or pending)
  const availablePeople = filteredPeople.filter(p => !connectedUserIds.has(p.id) && !pendingUserIds.has(p.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Network</h1>
        <p className="text-gray-600">Connect with artists, clients, teams, and backers</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or profession..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
        >
          <option value="all">All Types</option>
          <option value="artist">Artists</option>
          <option value="client">Clients</option>
          <option value="team">Teams</option>
          <option value="backer">Backers</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-4 py-2 font-medium ${activeTab === 'connections' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
        >
          Connections ({myConnections.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium ${activeTab === 'sent' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
        >
          Sent Requests ({0})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
        >
          Pending Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 font-medium ${activeTab === 'discover' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
        >
          Discover ({availablePeople.length})
        </button>
      </div>

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myConnections.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 text-sm">
              No connections yet
            </div>
          ) : (
            myConnections.map(conn => {
              const person = allPeople.find(p => p.id === conn.connected_user_id)
              if (!person) return null
              return (
                <div key={conn.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                  if (person.type === 'artist') {
                    setSelectedArtistId(person.id)
                    setProfileDrawerOpen(true)
                  }
                }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {person.image ? (
                        <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          {person.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{person.name}</h3>
                      <p className="text-xs text-gray-600">{person.profession || person.role}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {person.location}
                      </p>
                      {person.skills && person.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {person.skills.slice(0, 2).map((skill, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      onClick={(e) => { e.stopPropagation(); startChat(person); }}
                      variant="outline"
                      className="w-full text-sm"
                    >
                      Message
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Sent Requests Tab */}
      {activeTab === 'sent' && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No sent requests
        </div>
      )}

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRequests.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 text-sm">
              No pending requests
            </div>
          ) : (
            pendingRequests.map(conn => {
              const person = allPeople.find(p => p.id === conn.connected_user_id)
              if (!person) return null
              return (
                <div key={conn.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                  if (person.type === 'artist') {
                    setSelectedArtistId(person.id)
                    setProfileDrawerOpen(true)
                  }
                }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {person.image ? (
                        <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          {person.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{person.name}</h3>
                      <p className="text-xs text-gray-600">{person.profession || person.role}</p>
                      {conn.metadata?.message && (
                        <p className="text-xs text-gray-500 mt-1 italic">"{conn.metadata.message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={(e) => { e.stopPropagation(); acceptConnection(conn); }}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700 text-sm"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={(e) => { e.stopPropagation(); rejectConnection(conn); }}
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Discover Tab - for finding new people */}
      {activeTab === 'discover' && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Suggested for you ({availablePeople.length})</h2>
          <p className="text-sm text-gray-500 mb-4">Matched by skill and career niche</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePeople.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                No suggestions available
              </div>
            ) : (
              availablePeople.map(person => (
                <div key={person.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                  if (person.type === 'artist') {
                    setSelectedArtistId(person.id)
                    setProfileDrawerOpen(true)
                  }
                }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {person.image ? (
                        <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          {person.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm truncate">{person.name}</h3>
                      <p className="text-xs text-gray-600">{person.profession || person.role}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {person.location}
                      </p>
                      {person.skills && person.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {person.skills.slice(0, 2).map((skill, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      onClick={(e) => { e.stopPropagation(); setSelectedPerson(person); setShowConnectionModal(true); }}
                      className="w-full text-sm bg-black text-white hover:bg-gray-800"
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Connection Request Modal */}
      {showConnectionModal && selectedPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Connect with {selectedPerson.name}</h2>
              <button onClick={() => setShowConnectionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={connectionMessage}
              onChange={(e) => setConnectionMessage(e.target.value)}
              placeholder="Add a personal message (optional)"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-400 resize-none"
              rows={3}
            />
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => sendConnectionRequest(selectedPerson)}
                className="flex-1 bg-black text-white hover:bg-gray-800"
              >
                Send Request
              </Button>
              <Button
                onClick={() => setShowConnectionModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Artist Profile Drawer */}
      <ArtistProfileDrawer
        artistId={selectedArtistId}
        isOpen={profileDrawerOpen}
        onClose={() => {
          setProfileDrawerOpen(false)
          setSelectedArtistId(null)
        }}
      />
    </div>
  )
}
