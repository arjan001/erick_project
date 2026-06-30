export const ProjectStatus = {
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  IN_PROGRESS: 'in_progress',
  DELIVERED: 'delivered',
  REJECTED: 'rejected'
} as const;

export const ProjectType = {
  COMMERCIAL: 'commercial',
  SHORT_FILM: 'short_film',
  FEATURE_FILM: 'film',
  MUSIC_VIDEO: 'music_video',
  DOCUMENTARY: 'documentary'
} as const;

export function mapProjectFromEntity(raw: any) {
  return {
    id: raw.id,
    title: raw.project_owner_company ?? '',
    project_owner_company: raw.project_owner_company ?? '',
    project_owner_email: raw.project_owner_email ?? '',
    project_type: raw.project_type || 'commercial',
    status: raw.status || 'submitted',
    open_to_backing: raw.open_to_backing || false,
    verified_only: raw.verified_only || false,
    image_url: raw.image_url,
    description: raw.description,
    budget: raw.budget,
    location: raw.location,
    created_date: raw.created_date
  };
}
