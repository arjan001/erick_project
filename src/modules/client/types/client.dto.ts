// Client-specific DTOs

export interface ClientProfileUpdate {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  description?: string;
  social_links?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface ProjectCreate {
  title: string;
  description: string;
  project_type: 'commercial' | 'short' | 'feature' | 'music' | 'documentary';
  budget_range?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  requirements?: string[];
}
