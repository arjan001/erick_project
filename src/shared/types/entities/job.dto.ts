export const JobStatus = {
  OPEN: 'open',
  CLOSED: 'closed',
  FILLED: 'filled'
} as const;

export function mapJobFromEntity(raw: any) {
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
