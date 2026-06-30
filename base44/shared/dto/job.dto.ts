export const JobStatus = {
  OPEN: 'open',
  CLOSED: 'closed',
  FILLED: 'filled'
} as const;

export interface JobDto {
  id: string;
  title: string;
  description: string;
  client_email: string;
  role: string;
  location?: string;
  budget?: number;
  status: keyof typeof JobStatus;
  created_date: string;
}

export function mapJobFromEntity(raw: any): JobDto {
  return {
    id: raw.id,
    title: raw.title ?? '',
    description: raw.description ?? '',
    client_email: raw.client_email ?? '',
    role: raw.role ?? '',
    location: raw.location,
    budget: raw.budget,
    status: raw.status || 'open',
    created_date: raw.created_date
  };
}
