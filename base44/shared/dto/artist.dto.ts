export const ArtistStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export const ArtistRole = {
  DIRECTOR: 'director',
  CINEMATOGRAPHER: 'cinematographer',
  PRODUCER: 'producer',
  EDITOR: 'editor',
  VFX_SUPERVISOR: 'vfx_supervisor',
  SOUND_DESIGNER: 'sound_designer',
  ART_DIRECTOR: 'art_director',
  WRITER: 'writer'
} as const;

export interface ArtistDto {
  id: string;
  full_name: string;
  email: string;
  role: keyof typeof ArtistRole;
  status: keyof typeof ArtistStatus;
  based_in_city: string;
  based_in_country: string;
  phone?: string;
  website?: string;
  instagram?: string;
  portfolio_clips?: string[];
  admin_notes?: string;
  approved_date?: string;
  created_date: string;
}

export function mapArtistFromEntity(raw: any): ArtistDto {
  return {
    id: raw.id,
    full_name: raw.full_name ?? '',
    email: raw.email ?? '',
    role: raw.role || 'director',
    status: raw.status || 'pending',
    based_in_city: raw.based_in_city ?? '',
    based_in_country: raw.based_in_country ?? '',
    phone: raw.phone,
    website: raw.website,
    instagram: raw.instagram,
    portfolio_clips: raw.portfolio_clips || [],
    admin_notes: raw.admin_notes,
    approved_date: raw.approved_date,
    created_date: raw.created_date
  };
}
