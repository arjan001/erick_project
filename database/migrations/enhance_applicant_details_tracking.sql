-- Migration: Enhance Applicant Details Tracking for Client View
-- Created: July 15, 2026
-- Purpose: Add fields to track detailed applicant information snapshot at time of application

-- Add applicant details snapshot to applications table
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS applicant_type VARCHAR(20) CHECK (applicant_type IN ('artist', 'team')),
ADD COLUMN IF NOT EXISTS applicant_snapshot JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS skills_snapshot TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS past_clients_snapshot TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS project_specialties_snapshot TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS languages_spoken_snapshot TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS countries_worked_snapshot TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_letter_enhanced TEXT,
ADD COLUMN IF NOT EXISTS proposed_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS availability_notes TEXT,
ADD COLUMN IF NOT EXISTS client_notes TEXT;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_applications_applicant_type ON applications(applicant_type);
CREATE INDEX IF NOT EXISTS idx_applications_snapshot ON applications USING GIN(applicant_snapshot);

-- Add comments for documentation
COMMENT ON COLUMN applications.applicant_type IS 'Type of applicant: artist or team';
COMMENT ON COLUMN applications.applicant_snapshot IS 'JSON snapshot of applicant profile details at time of application';
COMMENT ON COLUMN applications.portfolio_urls IS 'Array of portfolio/work URLs';
COMMENT ON COLUMN applications.skills_snapshot IS 'Snapshot of applicant skills at time of application';
COMMENT ON COLUMN applications.experience_years IS 'Years of experience at time of application';
COMMENT ON COLUMN applications.hourly_rate IS 'Applicant hourly rate at time of application';
COMMENT ON COLUMN applications.availability_status IS 'Availability status at time of application';
COMMENT ON COLUMN applications.past_clients_snapshot IS 'Array of past clients worked with';
COMMENT ON COLUMN applications.project_specialties_snapshot IS 'Array of project specialties';
COMMENT ON COLUMN applications.languages_spoken_snapshot IS 'Array of languages spoken';
COMMENT ON COLUMN applications.countries_worked_snapshot IS 'Array of countries worked in';
COMMENT ON COLUMN applications.profile_photo_url IS 'Applicant profile photo URL';
COMMENT ON COLUMN applications.cover_letter_enhanced IS 'Enhanced cover letter with additional details';
COMMENT ON COLUMN applications.proposed_rate IS 'Rate proposed by applicant';
COMMENT ON COLUMN applications.availability_notes IS 'Notes about availability';
COMMENT ON COLUMN applications.client_notes IS 'Private notes for client about applicant';

-- Create table for application view history (track when clients view applications)
CREATE TABLE IF NOT EXISTS application_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    viewer_email VARCHAR(255) NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    view_duration_seconds INTEGER,
    UNIQUE(application_id, viewer_email)
);

CREATE INDEX IF NOT EXISTS idx_application_views_application_id ON application_views(application_id);
CREATE INDEX IF NOT EXISTS idx_application_views_viewer_email ON application_views(viewer_email);

COMMENT ON TABLE application_views IS 'Track when clients view applicant profiles';

-- Create table for client ratings of applicants
CREATE TABLE IF NOT EXISTS applicant_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    client_email VARCHAR(255) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    would_hire_again BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, client_email)
);

CREATE INDEX IF NOT EXISTS idx_applicant_ratings_application_id ON applicant_ratings(application_id);
CREATE INDEX IF NOT EXISTS idx_applicant_ratings_client_email ON applicant_ratings(client_email);

COMMENT ON TABLE applicant_ratings IS 'Client ratings and reviews of applicants';
