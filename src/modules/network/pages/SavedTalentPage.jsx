import React, { useState, useEffect } from 'react'
import { Artist, Connection, User as UserEntity } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TalentCard from '@/components/landing/backstage/TalentCard'
import { Star, Search, Heart, MapPin, Mail, User, MessageCircle, ExternalLink, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'

export default function SavedTalentPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [savedTalent, setSavedTalent] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  useEffect(() => {
    fetchSavedTalent()
  }, [user])

  const fetchSavedTalent = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      // Fetch connections where the current user has saved artists
      const connections = await Connection.filter({
        user_id: user.id,
        connection_type: 'saved',
        status: 'active'
      })

      if (connections && connections.length > 0) {
        // Fetch artist details for each saved connection
        const artistIds = connections.map(c => c.connected_artist_id).filter(Boolean)
        const artists = await Promise.all(
          artistIds.map(id => Artist.get(id))
        )

        // Transform artists to talent format with full details
        const talentData = artists.filter(Boolean).map(artist => ({
          id: artist.id,
          full_name: artist.display_name || artist.user_id,
          email: '', // Email not in artists table
          profile_photo_url: artist.profile_photo_url || artist.profile_image,
          profession: artist.profession || 'Artist',
          location: artist.location || 'Kenya',
          city: artist.city,
          country: artist.country,
          skills: artist.skills || [],
          disciplines: artist.disciplines || [],
          bio: artist.bio,
          reel_url: artist.video_reel_url,
          social_media: artist.social_media
        }))
        setSavedTalent(talentData)
      } else {
        setSavedTalent([])
      }
    } catch (err) {
      console.error('Error fetching saved talent:', err)
      setSavedTalent([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleUnsave = async (artistId) => {
    if (!user?.id) return
    try {
      // Find and delete the connection
      const connections = await Connection.filter({
        user_id: user.id,
        connected_artist_id: artistId,
        connection_type: 'saved'
      })

      if (connections.length > 0) {
        await Connection.delete(connections[0].id)
        setSavedTalent(prev => prev.filter(a => a.id !== artistId))
        success('Removed', 'Talent removed from saved list')
      }
    } catch (err) {
      console.error('Error removing saved talent:', err)
      error('Failed', 'Failed to remove saved talent')
    }
  }

  const handleMessage = (artistId) => {
    navigate('/Messages?with=' + artistId)
  }

  const handleViewProfile = (artistId) => {
    navigate(`/ArtistPublicProfile?id=${artistId}`)
  }

  const filteredTalent = savedTalent.filter(a =>
    a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredTalent.length / itemsPerPage)
  const paginatedTalent = filteredTalent.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Saved Talent</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your saved talent profiles</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search saved talent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4F46E5]" />
          </div>
        ) : filteredTalent.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No saved talent found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedTalent.map((artist) => (
              <div key={artist.id} className="group">
                <TalentCard
                  profile={{
                    id: artist.id,
                    name: artist.full_name,
                    images: artist.profile_photo_url ? [artist.profile_photo_url] : ['https://ui-avatars.com/api/?name=' + (artist.full_name || 'Artist') + '&background=6366f1&color=fff&size=256'],
                    profession: artist.profession || 'Artist',
                    location: artist.location || 'Kenya',
                    skills: artist.skills || [],
                    overlayText: 'SAVED'
                  }}
                  onOpenProfile={(id) => navigate(`/ArtistPublicProfile?id=${id}`)}
                  showActions={true}
                  showControls={true}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleUnsave(artist.id)}
                  >
                    <Heart className="w-3 h-3 mr-1" />
                    Unsave
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] text-xs"
                    onClick={() => handleMessage(artist.id)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
        )}
      </div>
    </div>
  )
}
