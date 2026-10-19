import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPageUrl } from '@/shared/utils/routing'
import { Conversation, Message, Artist, Team, Client, Backer, User } from '@/lib/supabaseEntities'
import { MessageCircle } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

async function lookupUser(userId) {
  try {
    const user = await User.get(userId)
    if (user) {
      return { name: user.full_name || user.email, avatar: user.avatar_url }
    }
    const artists = await Artist.filter({ user_id: userId })
    if (artists[0]) return { name: artists[0].full_name, avatar: artists[0].profile_photo_url }
    const clients = await Client.filter({ user_id: userId })
    if (clients[0]) return { name: clients[0].company_name || clients[0].display_name, avatar: clients[0].logo_url }
    const teams = await Team.filter({ user_id: userId })
    if (teams[0]) return { name: teams[0].team_name, avatar: teams[0].team_logo_url }
    const backers = await Backer.filter({ user_id: userId })
    if (backers[0]) return { name: backers[0].organization_name, avatar: backers[0].logo_url }
  } catch {
    // ignore lookup failures
  }
  return { name: 'Unknown User', avatar: null }
}

export default function RecentConversations({ userEmail }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return
    (async () => {
      try {
        // Fetch conversations where user is a participant
        const convos = await Conversation.filter({
          or: `participant_1.eq.${user.id},participant_2.eq.${user.id}`
        }, '-updated_at', 5)

        // Get the last message for each conversation
        const enriched = await Promise.all(convos.map(async (convo) => {
          const otherUserId = convo.participant_1 === user.id ? convo.participant_2 : convo.participant_1
          const userInfo = await lookupUser(otherUserId)

          // Get the last message in this conversation
          const messages = await Message.filter({ conversation_id: convo.id }, '-created_at', 1)
          const lastMessage = messages[0] || null

          return {
            conversation_id: convo.id,
            otherUserId,
            ...userInfo,
            lastMessage: lastMessage?.text || lastMessage?.file_name || 'No messages yet',
            timestamp: lastMessage?.created_at || convo.updated_at
          }
        }))

        // Sort by timestamp
        enriched.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        setConversations(enriched)
      } catch (err) {
        console.error('Error fetching conversations:', err)
        setConversations([])
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Recent Conversations</h2>
        <Link to={createPageUrl('Messages')} className="w-8 h-8 rounded-xl bg-[#2A9D8F]/12 flex items-center justify-center hover:bg-[#2A9D8F]/20 transition-colors">
          <MessageCircle className="w-3.5 h-3.5 text-[#2A9D8F]" />
        </Link>
      </div>
      {loading ? (
        <p className="text-xs text-gray-400 text-center py-6">Loading...</p>
      ) : conversations.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6">No conversations yet</p>
      ) : (
        <div className="space-y-1">
          {conversations.map(c => (
            <Link key={c.conversation_id} to={createPageUrl('Messages')} className="flex items-center gap-2.5 p-2 -mx-1 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" loading="lazy" decoding="async" /> : <span className="text-xs font-bold text-gray-600">{c.name?.[0]?.toUpperCase()}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-500 truncate">{c.text || c.file_name || 'Attachment'}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}