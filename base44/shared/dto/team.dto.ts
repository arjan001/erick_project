export const TeamStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export interface TeamDto {
  id: string;
  team_name: string;
  team_code: string;
  contact_name: string;
  contact_email: string;
  phone?: string;
  status: keyof typeof TeamStatus;
  based_in_city: string;
  based_in_country: string;
  team_logo_url?: string;
  specialties?: string[];
  portfolio_clips?: string[];
  availability?: string;
  created_date: string;
}

export function mapTeamFromEntity(raw: any): TeamDto {
  return {
    id: raw.id,
    team_name: raw.team_name ?? '',
    team_code: raw.team_code ?? '',
    contact_name: raw.contact_name ?? '',
    contact_email: raw.contact_email ?? '',
    phone: raw.phone,
    status: raw.status || 'pending',
    based_in_city: raw.based_in_city ?? '',
    based_in_country: raw.based_in_country ?? '',
    team_logo_url: raw.team_logo_url,
    specialties: raw.specialties || [],
    portfolio_clips: raw.portfolio_clips || [],
    availability: raw.availability,
    created_date: raw.created_date
  };
}
