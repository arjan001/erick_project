// Artist-specific DTOs extending shared types
import { ArtistDto, ArtistStatus, ArtistRole } from '@/shared/types/entities/artist.dto';

export type {
  ArtistDto,
  ArtistStatus,
  ArtistRole
};

export interface ArtistProfileUpdate {
  full_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    instagram?: string;
    linkedin?: string;
    vimeo?: string;
    youtube?: string;
  };
  skills?: string[];
  portfolio_url?: string;
  avatar_url?: string;
  reel_url?: string;
}

export interface PortfolioClipCreate {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  project_type?: string;
  role?: string;
}
