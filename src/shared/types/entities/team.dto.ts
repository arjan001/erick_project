export const TeamStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

export function mapTeamFromEntity(raw: any) {
  return {
    id: raw.id,
    team_name: raw.team_name ?? '',
    team_code: raw.team_code ?? '',
    contact_name: raw.contact_name ?? '',
    contact_email: raw.contact_email ?? '',
    contact_phone: raw.contact_phone ?? '',
    phone: raw.phone,
    city: raw.city ?? '',
    country: raw.country ?? '',
    location: raw.location ?? `${raw.city || ''}, ${raw.country || ''}`,
    status: raw.status || 'pending',
    based_in_city: raw.based_in_city ?? raw.city ?? '',
    based_in_country: raw.based_in_country ?? raw.country ?? '',
    team_logo_url: raw.team_logo_url ?? raw.logo ?? '',
    logo: raw.logo ?? '',
    specialties: raw.specialties || [],
    equipment_owned: raw.equipment_owned || [],
    languages_spoken: raw.languages_spoken || [],
    portfolio_clips: raw.portfolio_clips || [],
    availability: raw.availability ?? 'available',
    website: raw.website ?? '',
    industry: raw.industry ?? '',
    company_size: raw.company_size ?? '',
    description: raw.description ?? '',
    verified: raw.verified ?? false,
    created_at: raw.created_at ?? raw.created_date,
    updated_at: raw.updated_at
  };
}
