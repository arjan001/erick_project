import { Artist, PortfolioClip } from '@/lib/supabaseEntities'
import { mapArtistFromEntity } from '@/shared/types/entities/artist.dto'

export const artistApi = {
  // Get current artist profile
  async getCurrentArtist() {
    const artists = await Artist.filter({ user_id: '' })
    if (!artists || artists.length === 0) return null
    return artists.map(mapArtistFromEntity)[0]
  },

  // Get artist by ID
  async getArtistById(artistId) {
    const artist = await Artist.get(artistId)
    return artist ? mapArtistFromEntity(artist) : null
  },

  // List all artists (admin use)
  async listArtists(filters = {}) {
    const artists = await Artist.filter(filters)
    return artists.map(mapArtistFromEntity)
  },

  // Create artist profile
  async createArtist(artistData) {
    const newArtist = await Artist.create({
      ...artistData,
      status: 'pending',
      created_at: new Date().toISOString()
    })
    return mapArtistFromEntity(newArtist)
  },

  // Update artist profile
  async updateArtist(artistId, updates) {
    const updated = await Artist.update(artistId, {
      ...updates,
      updated_at: new Date().toISOString()
    })
    return mapArtistFromEntity(updated)
  },

  // Update current artist profile
  async updateCurrentArtist(updates) {
    const current = await this.getCurrentArtist()
    if (!current) throw new Error('No artist profile found')
    return this.updateArtist(current.id, updates)
  },

  // Delete artist profile
  async deleteArtist(artistId) {
    await Artist.delete(artistId)
  },

  // Approve artist (admin)
  async approveArtist(artistId) {
    return this.updateArtist(artistId, { status: 'approved' })
  },

  // Reject artist (admin)
  async rejectArtist(artistId) {
    return this.updateArtist(artistId, { status: 'rejected' })
  },

  // Portfolio clips CRUD
  async addPortfolioClip(artistId, clipData) {
    const clip = await PortfolioClip.create({
      ...clipData,
      artist_id: artistId,
      created_at: new Date().toISOString()
    })
    return clip
  },

  async updatePortfolioClip(clipId, updates) {
    return PortfolioClip.update(clipId, updates)
  },

  async deletePortfolioClip(clipId) {
    await PortfolioClip.delete(clipId)
  },

  async getPortfolioClips(artistId) {
    const clips = await PortfolioClip.filter({ artist_id: artistId })
    return clips
  }
}
