import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { Bell, CalendarClock, UserCheck, Clock, Users } from 'lucide-react'
import { Connection, User } from '@/lib/supabaseEntities'
import { useAuth } from '@/lib/AuthContext'

export default function RemindersCard({ invitations = [] }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('invitations')
  const [connections, setConnections] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [usersMap, setUsersMap] = useState({})

  const fetchConnections = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const connectionsData = await Connection.filter({ user_id: user.id }).catch(() => [])

      // Fetch users for display
      const allUsers = await User.list().catch(() => [])
      const usersMapData = {}
      allUsers.forEach(u => {
        usersMapData[u.id] = {
          name: u.full_name || u.email,
          avatar: u.avatar_url,
          role: u.role || 'User'
        }
      })
      setUsersMap(usersMapData)

      const accepted = connectionsData.filter(c => c.status === 'accepted')
      const sent = connectionsData.filter(c => c.user_id === user.id && c.status === 'pending')
      const pending = connectionsData.filter(c => c.connected_artist_id === user.id && c.status === 'pending')

      setConnections(accepted)
      setSentRequests(sent)
      setPendingRequests(pending)
    } catch (err) {
      console.error('Error fetching connections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'connections' || activeTab === 'sent' || activeTab === 'pending') {
      fetchConnections()
    }
  }, [activeTab, user])

  const handleAcceptConnection = async (connectionId) => {
    try {
      await Connection.update(connectionId, { status: 'accepted' })
      await fetchConnections()
    } catch (err) {
      console.error('Error accepting connection:', err)
    }
  }

  const handleDeclineConnection = async (connectionId) => {
    try {
      await Connection.update(connectionId, { status: 'declined' })
      await fetchConnections()
    } catch (err) {
      console.error('Error declining connection:', err)
    }
  }

  const handleCancelRequest = async (connectionId) => {
    try {
      await Connection.delete(connectionId)
      await fetchConnections()
    } catch (err) {
      console.error('Error cancelling connection:', err)
    }
  }

  const getUserDisplay = (userId) => {
    return usersMap[userId] || { name: userId, avatar: null, role: 'User' }
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Reminders</h2>
        <span className="w-8 h-8 rounded-xl bg-[#F4A261]/15 flex items-center justify-center">
          <Bell className="w-3.5 h-3.5 text-[#F4A261]" />
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-3 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('invitations')}
          className={`text-xs font-medium pb-2 border-b-2 transition-colors ${activeTab === 'invitations' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Invitations ({invitations.length})
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          className={`text-xs font-medium pb-2 border-b-2 transition-colors ${activeTab === 'connections' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Connections ({connections.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`text-xs font-medium pb-2 border-b-2 transition-colors ${activeTab === 'sent' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Sent ({sentRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`text-xs font-medium pb-2 border-b-2 transition-colors ${activeTab === 'pending' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
        >
          Pending ({pendingRequests.length})
        </button>
      </div>

      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <>
          {!invitations[0] ? (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                <CalendarClock className="w-4 h-4 text-gray-300" />
              </span>
              <p className="text-xs text-gray-400">No pending invitations</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="rounded-xl bg-[#F4A261]/8 p-3 mb-3">
                <p className="font-semibold text-gray-900 text-xs leading-snug">{invitations[0].message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(invitations[0].created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <Link
                to={createPageUrl('JobInvitations')}
                className="mt-auto inline-block text-center w-full bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl py-2.5 transition-colors"
              >
                View Invitations
              </Link>
            </div>
          )}
        </>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-gray-300" />
              </span>
              <p className="text-xs text-gray-400">No connections yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {connections.slice(0, 3).map((conn) => {
                const userId = conn.user_id === user?.id ? conn.connected_artist_id : conn.user_id
                const userData = getUserDisplay(userId)
                return (
                  <div key={conn.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {userData.avatar ? (
                        <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-600">{userData.name[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{userData.name}</p>
                      <p className="text-[10px] text-gray-500">Connected</p>
                    </div>
                  </div>
                )
              })}
              {connections.length > 3 && (
                <Link
                  to={createPageUrl('Network')}
                  className="block text-center text-xs text-gray-600 hover:text-gray-900 mt-2"
                >
                  View all {connections.length} connections
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {/* Sent Requests Tab */}
      {activeTab === 'sent' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
          ) : sentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                <Clock className="w-4 h-4 text-gray-300" />
              </span>
              <p className="text-xs text-gray-400">No sent requests</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sentRequests.slice(0, 3).map((request) => {
                const userData = getUserDisplay(request.connected_artist_id)
                return (
                  <div key={request.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {userData.avatar ? (
                        <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-600">{userData.name[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{userData.name}</p>
                      <p className="text-[10px] text-gray-500">Pending</p>
                    </div>
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )
              })}
              {sentRequests.length > 3 && (
                <Link
                  to={createPageUrl('Network')}
                  className="block text-center text-xs text-gray-600 hover:text-gray-900 mt-2"
                >
                  View all {sentRequests.length} requests
                </Link>
              )}
            </div>
          )}
        </>
      )}

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <span className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                <UserCheck className="w-4 h-4 text-gray-300" />
              </span>
              <p className="text-xs text-gray-400">No pending requests</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pendingRequests.slice(0, 3).map((request) => {
                const userData = getUserDisplay(request.user_id)
                return (
                  <div key={request.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {userData.avatar ? (
                        <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-600">{userData.name[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{userData.name}</p>
                      <p className="text-[10px] text-gray-500">Wants to connect</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAcceptConnection(request.id)}
                        className="text-xs bg-black text-white px-2 py-1 rounded hover:bg-gray-800"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineConnection(request.id)}
                        className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )
              })}
              {pendingRequests.length > 3 && (
                <Link
                  to={createPageUrl('Network')}
                  className="block text-center text-xs text-gray-600 hover:text-gray-900 mt-2"
                >
                  View all {pendingRequests.length} requests
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}