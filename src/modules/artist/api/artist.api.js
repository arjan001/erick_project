import { base44Client } from '@/shared/api/base44.client';
import { mapArtistFromEntity } from '@/shared/types/entities/artist.dto';

const base44 = base44Client;

export const artistApi = {
  // Get current artist profile
  async getCurrentArtist() {
    const user = await base44.auth.me();
    if (!user) throw new Error('Not authenticated');
    
    const artists = await base44.entities.Artist.filter({ user_id: user.id });
    if (!artists || artists.length === 0) return null;
    
    return artists.map(mapArtistFromEntity)[0];
  },

  // Get artist by ID
  async getArtistById(artistId) {
    const artist = await base44.entities.Artist.get(artistId);
    return artist ? mapArtistFromEntity(artist) : null;
  },

  // List all artists (admin use)
  async listArtists(filters = {}) {
    const artists = await base44.entities.Artist.filter(filters);
    return artists.map(mapArtistFromEntity);
  },

  // Create artist profile
  async createArtist(artistData) {
    const user = await base44.auth.me();
    if (!user) throw new Error('Not authenticated');
    
    const newArtist = await base44.entities.Artist.create({
      ...artistData,
      user_id: user.id,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    
    return mapArtistFromEntity(newArtist);
  },

  // Update artist profile
  async updateArtist(artistId, updates) {
    const updated = await base44.entities.Artist.update(artistId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    return mapArtistFromEntity(updated);
  },

  // Update current artist profile
  async updateCurrentArtist(updates) {
    const current = await this.getCurrentArtist();
    if (!current) throw new Error('No artist profile found');
    
    return this.updateArtist(current.id, updates);
  },

  // Delete artist profile
  async deleteArtist(artistId) {
    await base44.entities.Artist.delete(artistId);
  },

  // Approve artist (admin)
  async approveArtist(artistId) {
    return this.updateArtist(artistId, { status: 'approved' });
  },

  // Reject artist (admin)
  async rejectArtist(artistId) {
    return this.updateArtist(artistId, { status: 'rejected' });
  },

  // Portfolio clips CRUD
  async addPortfolioClip(artistId, clipData) {
    const clip = await base44.entities.PortfolioClip.create({
      ...clipData,
      artist_id: artistId,
      created_at: new Date().toISOString()
    });
    return clip;
  },

  async updatePortfolioClip(clipId, updates) {
    return base44.entities.PortfolioClip.update(clipId, updates);
  },

  async deletePortfolioClip(clipId) {
    await base44.entities.PortfolioClip.delete(clipId);
  },

  async getPortfolioClips(artistId) {
    const clips = await base44.entities.PortfolioClip.filter({ artist_id: artistId });
    return clips;
  }
};
