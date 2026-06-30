// Team-specific DTOs extending shared types
import { TeamDto, TeamStatus } from '@/shared/types/entities/team.dto';

export type {
  TeamDto,
  TeamStatus
};

export interface TeamProfileUpdate {
  name?: string;
  description?: string;
  location?: string;
  website?: string;
  social_links?: {
    instagram?: string;
    linkedin?: string;
    vimeo?: string;
    youtube?: string;
  };
  specialties?: string[];
  logo_url?: string;
  reel_url?: string;
  team_size?: number;
  founded_year?: number;
}
