import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Artist, Team, Client, Backer, Connection, Notification, Subscription } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast'
import { Search, MapPin, ChevronDown, Building2, TrendingUp, Briefcase, X, UserCheck, UserX, MessageCircle, Clock, User as UserIcon, Building, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import notificationService from '@/shared/services/notificationService'

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
  const [activeTab, setActiveTab] = useState('discover') // 'discover', 'connections', 'pending'

  const [allPeople, setAllPeople] = useState([])
  const [myConnections, setMyConnections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])

  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [connectionMessage, setConnectionMessage] = useState('')

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      console.log('NetworkPage: Loading data for user', user.id, 'role:', user.role)

      // Fetch all users from respective tables
      const [artists, teams, clients, backers] = await Promise.all([
        Artist.list().catch(() => []),
        Team.list().catch(() => []),
        Client.list().catch(() => []),
        Backer.list().catch(() => []),
      ])

      // Transform to unified format
      const people = [
        ...artists.filter(a => a.id !== user.id).map(a => ({
          id: a.id,
          type: 'artist',
          name: a.full_name || a.email,
          role: 'Artist',
          location: a.based_in_city || a.based_in_country || 'Kenya',
          image: a.profile_photo_url,
          skills: a.skills || [],
          profession: a.profession,
          isOnline: isOnline(a.last_active),
          email: a.email,
        })),
        ...teams.map(t => ({
          id: t.id,
          type: 'team',
          name: t.team_name,
          role: 'Team',
          location: t.city || t.country || 'Kenya',
          image: t.logo_url,
          skills: t.specialties || [],
          profession: t.industry,
          isOnline: isOnline(t.last_active),
          email: t.contact_email,
        })),
        ...clients.filter(c => c.id !== user.id).map(c => ({
          id: c.id,
          type: 'client',
          name: c.company_name || c.display_name,
          role: 'Client',
          location: c.city || c.country || 'Kenya',
          image: c.logo_url,
          skills: [],
          profession: c.company_type,
          isOnline: isOnline(c.last_active),
          email: c.contact_email,
        })),
        ...backers.map(b => ({
          id: b.id,
          type: 'backer',
          name: b.organization_name || b.display_name,
          role: 'Backer',
          location: b.city || b.country || 'Kenya',
          image: b.logo_url,
          skills: b.investment_interests || [],
          profession: 'Investor',
          isOnline: isOnline(b.last_active),
          email: b.contact_email,
        })),
      ]

      console.log('NetworkPage: All people loaded:', people.length)
      setAllPeople(people)

      // Fetch connections
      const connectionsData = await Connection.filter({ user_id: user.id }).catch(() => [])
      console.log('NetworkPage: Connections loaded:', connectionsData.length)

      // Filter into accepted and pending
      const accepted = connectionsData.filter(c => c.status === 'accepted')
      const pending = connectionsData.filter(c => c.status === 'pending')

      setMyConnections(accepted)
      setPendingRequests(pending)

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
        message: connectionMessage,
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

  // Get connected user IDs
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
    <div className="p-6 max-w-7xl mx-auto">
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
          onClick={() => setActiveTab('discover')}
          className={`px-4 py-2 font-medium ${activeTab === 'discover' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
        >
          Discover ({availablePeople.length})
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-4 py-2 font-medium ${activeTab === 'connections' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
        >
          My Connections ({myConnections.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium ${activeTab === 'pending' ? 'border-b-2 border-black text-black' : 'text-gray-600'}`}
        >
          Pending ({pendingRequests.length})
        </button>
      </div>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePeople.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No people available to connect with
            </div>
          ) : (
            availablePeople.map(person => (
              <div key={person.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {person.image ? (
                      <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                        {person.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
                    <p className="text-sm text-gray-600">{person.role}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {person.location}
                    </p>
                    {person.isOnline && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full" /> Online
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => { setSelectedPerson(person); setShowConnectionModal(true); }}
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                  >
                    Connect
                  </Button>
                  <Button
                    onClick={() => startChat(person)}
                    variant="outline"
                    className="flex-1"
                  >
                    Message
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myConnections.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No connections yet
            </div>
          ) : (
            myConnections.map(conn => {
              const person = allPeople.find(p => p.id === conn.connected_user_id)
              if (!person) return null
              return (
                <div key={conn.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {person.image ? (
                        <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                          {person.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
                      <p className="text-sm text-gray-600">{person.role}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {person.location}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => startChat(person)}
                      className="flex-1 bg-black text-white hover:bg-gray-800"
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

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingRequests.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No pending requests
            </div>
          ) : (
            pendingRequests.map(conn => {
              const person = allPeople.find(p => p.id === conn.connected_user_id)
              if (!person) return null
              return (
                <div key={conn.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {person.image ? (
                        <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                          {person.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
                      <p className="text-sm text-gray-600">{person.role}</p>
                      {conn.message && (
                        <p className="text-xs text-gray-500 mt-1 italic">"{conn.message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      onClick={() => acceptConnection(conn)}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => rejectConnection(conn)}
                      variant="outline"
                      className="flex-1"
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
    </div>
  )
}
