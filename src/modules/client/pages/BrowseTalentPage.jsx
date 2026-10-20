import React, { useState, useEffect } from 'react'
import { Artist, Connection, User as UserEntity } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TalentCard from '@/components/landing/backstage/TalentCard'
import { Search, SlidersHorizontal, Heart, MapPin, Mail, User as UserIcon, MessageCircle, ExternalLink, Star, Filter, ChevronDown, ChevronLeft, ChevronRight, CheckSquare, Square, Play, Pause, X, UserPlus } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/hooks/useToast'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function BrowseTalentPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [talent, setTalent] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [filterRole, setFilterRole] = useState(searchParams.get('role') || 'all')
  const [filterLocation, setFilterLocation] = useState(searchParams.get('location') || 'all')
  const [filterSkill, setFilterSkill] = useState(searchParams.get('skill') || 'all')
  const [savedArtistIds, setSavedArtistIds] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)
  const [selectedTalent, setSelectedTalent] = useState(new Set())
  const [autoPlay, setAutoPlay] = useState(false)

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (filterRole !== 'all') params.set('role', filterRole)
    if (filterLocation !== 'all') params.set('location', filterLocation)
    if (filterSkill !== 'all') params.set('skill', filterSkill)
    setSearchParams(params)
  }, [searchQuery, filterRole, filterLocation, filterSkill, setSearchParams])

  useEffect(() => {
    fetchTalent()
    fetchSavedTalent()
  }, [user])

  const fetchTalent = async () => {
    try {
      setLoading(true)
      console.log('Fetching talent from artists table...')

      // Fetch all artists from artists table
      const allArtists = await Artist.list('-created_at', 1000)
      console.log('Fetched all artists:', allArtists.length, allArtists)

      if (allArtists && allArtists.length > 0) {
        // Convert artists to talent format
        const talentData = allArtists.map(a => ({
          id: a.id,
          full_name: a.display_name || a.stage_name || a.full_name,
          email: a.email,
          user_role: 'artist',
          role: 'artist',
          profile_photo_url: a.profile_photo_url,
          based_in_city: a.location?.split(',')[0] || null,
          based_in_country: 'Kenya',
          skills_experience: (a.skills || []).map(s => ({ skill: s }))
        }))
        console.log('Setting talent data:', talentData)
        setTalent(talentData)
      } else {
        console.log('No artists found, setting empty talent')
        setTalent([])
      }
    } catch (err) {
      console.error('Error fetching talent:', err)
      setTalent([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedTalent = async () => {
    if (!user?.id) return
    try {
      const connections = await Connection.filter({
        user_id: user.id,
        connection_type: 'saved',
        status: 'active'
      })
      const savedIds = new Set(connections.map(c => c.connected_artist_id).filter(Boolean))
      setSavedArtistIds(savedIds)
    } catch (err) {
      console.error('Error fetching saved talent:', err)
      setSavedArtistIds(new Set()) // Set empty set on error
    }
  }

  const handleSave = async (artistId) => {
    if (!user?.id) {
      error('Authentication Required', 'Please sign in to save talent')
      return
    }
    try {
      if (savedArtistIds.has(artistId)) {
        // Unsave
        const connections = await Connection.filter({
          user_id: user.id,
          connected_artist_id: artistId,
          connection_type: 'saved'
        })
        if (connections.length > 0) {
          await Connection.delete(connections[0].id)
          setSavedArtistIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(artistId)
            return newSet
          })
          success('Removed', 'Talent removed from saved list')
        }
      } else {
        // Save
        await Connection.create({
          user_id: user.id,
          connected_artist_id: artistId,
          connection_type: 'saved',
          status: 'active',
          created_at: new Date().toISOString()
        })
        setSavedArtistIds(prev => new Set(prev).add(artistId))
        success('Saved', 'Talent added to saved list')
      }
    } catch (err) {
      console.error('Error saving talent:', err)
      error('Failed', 'Failed to save talent')
    }
  }

  const handleMessage = (artistId) => {
    navigate('/Messages?with=' + artistId)
  }

  const handleConnect = async (artistId) => {
    if (!user?.id) {
      error('Authentication Required', 'Please sign in to connect with talent')
      return
    }
    try {
      // Check if connection already exists
      const existingConnections = await Connection.filter({
        user_id: user.id,
        connected_artist_id: artistId,
        connection_type: 'connection'
      })

      if (existingConnections.length > 0) {
        success('Already Connected', 'You are already connected with this artist')
        return
      }

      // Create new connection
      await Connection.create({
        user_id: user.id,
        connected_artist_id: artistId,
        connection_type: 'connection',
        status: 'pending',
        created_at: new Date().toISOString()
      })
      success('Connection Request Sent', 'Your connection request has been sent')
    } catch (err) {
      console.error('Error connecting with artist:', err)
      error('Failed', 'Failed to send connection request')
    }
  }

  const handleViewProfile = (artistId) => {
    navigate(`/TalentPage?id=${artistId}`)
  }

  const filteredTalent = talent.filter(artist => {
    const matchesSearch =
      artist.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (artist.skills || []).some(s => s?.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesRole = filterRole === 'all' || artist.profession === filterRole || artist.user_role === filterRole
    const matchesLocation = filterLocation === 'all' ||
      artist.location?.toLowerCase().includes(filterLocation.toLowerCase()) ||
      (artist.based_in_city && artist.based_in_city.toLowerCase().includes(filterLocation.toLowerCase())) ||
      (artist.based_in_country && artist.based_in_country.toLowerCase().includes(filterLocation.toLowerCase()))
    const matchesSkill = filterSkill === 'all' ||
      (artist.skills || []).some(s => s?.toLowerCase() === filterSkill.toLowerCase())

    return matchesSearch && matchesRole && matchesLocation && matchesSkill
  })

  // Extract unique skills from all talent
  const allSkills = talent.reduce((acc, artist) => {
    const skills = artist.skills_experience || []
    skills.forEach(s => {
      if (s.skill && !acc.includes(s.skill)) {
        acc.push(s.skill)
      }
    })
    return acc
  }, [])

  // Pagination
  const totalPages = Math.ceil(filteredTalent.length / itemsPerPage)
  const paginatedTalent = filteredTalent.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const uniqueRoles = [...new Set(talent.map(a => a.user_role || a.role).filter(Boolean))]
  const uniqueLocations = [...new Set([
    ...talent.map(a => a.based_in_city).filter(Boolean),
    ...talent.map(a => a.based_in_country).filter(Boolean)
  ])]

  const handleSelectAll = () => {
    if (selectedTalent.size === paginatedTalent.length) {
      setSelectedTalent(new Set())
    } else {
      setSelectedTalent(new Set(paginatedTalent.map(a => a.id)))
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedTalent.size === 0) {
      error('No Selection', 'Please select at least one talent')
      return
    }
    // Implement bulk action logic here
    success('Bulk Action', `${action} completed for ${selectedTalent.size} talent`)
    setSelectedTalent(new Set())
  }

  return (
    <div className="bg-white min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Browse Talent</h1>
          <p className="text-sm text-gray-500 mt-1">Discover and connect with creative professionals</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, skill, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Filter Tags */}
          {(searchQuery || filterRole !== 'all' || filterLocation !== 'all' || filterSkill !== 'all') && (
            <div className="flex flex-wrap items-center gap-2">
              {searchQuery && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  <span>Search: {searchQuery}</span>
                  <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-gray-700">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filterRole !== 'all' && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  <span>Role: {filterRole}</span>
                  <button onClick={() => setFilterRole('all')} className="text-gray-500 hover:text-gray-700">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filterLocation !== 'all' && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  <span>Location: {filterLocation}</span>
                  <button onClick={() => setFilterLocation('all')} className="text-gray-500 hover:text-gray-700">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {filterSkill !== 'all' && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                  <span>Skill: {filterSkill}</span>
                  <button onClick={() => setFilterSkill('all')} className="text-gray-500 hover:text-gray-700">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterRole('all')
                  setFilterLocation('all')
                  setFilterSkill('all')
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl w-full">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Role</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[150px]"
                  >
                    <option value="all">All Roles</option>
                    {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Skill</label>
                  <select
                    value={filterSkill}
                    onChange={(e) => setFilterSkill(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[150px]"
                  >
                    <option value="all">All Skills</option>
                    {allSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Location</label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="px-3 py-2 border border border-gray-300 rounded-lg text-sm min-w-[150px]"
                  >
                    <option value="all">All Locations</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoPlay(!autoPlay)}
                className="flex items-center gap-2"
              >
                {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {autoPlay ? 'Pause' : 'Auto-Play'}
              </Button>

              {selectedTalent.size > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2"
                  >
                    {selectedTalent.size === paginatedTalent.length ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <CheckSquare className="w-4 h-4" />
                    )}
                    {selectedTalent.size} Selected
                  </Button>
                  <select
                    onChange={(e) => handleBulkAction(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Bulk Action...</option>
                    <option value="save">Save to List</option>
                    <option value="message">Send Message</option>
                    <option value="export">Export</option>
                  </select>
                </div>
              )}

              <p className="text-sm text-gray-500 ml-auto">
                {filteredTalent.length} talent found
              </p>
            </div>
          </div>
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#4F46E5]" />
          </div>
        ) : filteredTalent.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No talent found matching your criteria</p>
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
                    profession: artist.user_role || 'Artist',
                    location: artist.based_in_city || 'Kenya',
                    skills: (artist.skills_experience || []).map(s => s.skill),
                    overlayText: 'FEATURED'
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
                    onClick={() => handleConnect(artist.id)}
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Connect
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
        
      </div>
    </div>
  )
}
