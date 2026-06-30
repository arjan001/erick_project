export const UserRole = {
  ADMIN: 'admin',
  ARTIST: 'artist',
  TEAM: 'team',
  CLIENT: 'client',
  PROJECT_OWNER: 'project_owner',
  BACKER: 'backer'
} as const;

export interface Session {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: keyof typeof UserRole;
    linked_entity_id?: string;
  };
  source: 'base44' | 'demo';
}

export interface LoginCredentials {
  email: string;
  password: string;
}
