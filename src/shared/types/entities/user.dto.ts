export const UserRole = {
  ADMIN: 'admin',
  ARTIST: 'artist',
  TEAM: 'team',
  CLIENT: 'client',
  PROJECT_OWNER: 'project_owner',
  BACKER: 'backer'
} as const;

export function mapUserFromEntity(raw: any) {
  return {
    id: raw.id,
    email: raw.email ?? '',
    full_name: raw.full_name ?? '',
    role: raw.role || 'artist',
    linked_entity_id: raw.linked_entity_id,
    created_date: raw.created_date
  };
}
