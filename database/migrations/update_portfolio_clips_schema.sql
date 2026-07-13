-- Update portfolio_clips table to match application requirements
-- This migration ensures all columns needed by the portfolio upload form exist

-- Ensure all required columns exist (using IF NOT EXISTS to be safe)
ALTER TABLE portfolio_clips 
ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS project_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS role VARCHAR(100),
ADD COLUMN IF NOT EXISTS project_type VARCHAR(100) DEFAULT 'commercial',
ADD COLUMN IF NOT EXISTS video_source VARCHAR(50) DEFAULT 'upload',
ADD COLUMN IF NOT EXISTS original_video_url TEXT,
ADD COLUMN IF NOT EXISTS video_embed_url TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS uploaded_by_type VARCHAR(50) DEFAULT 'artist',
ADD COLUMN IF NOT EXISTS uploaded_by_id UUID;

-- Add comments for documentation
COMMENT ON COLUMN portfolio_clips.artist_id IS 'Reference to the artist who owns this portfolio clip';
COMMENT ON COLUMN portfolio_clips.title IS 'Title of the portfolio item';
COMMENT ON COLUMN portfolio_clips.description IS 'Description of the project';
COMMENT ON COLUMN portfolio_clips.video_url IS 'URL of the video file';
COMMENT ON COLUMN portfolio_clips.thumbnail_url IS 'URL of the thumbnail/cover image';
COMMENT ON COLUMN portfolio_clips.project_name IS 'Name of the project (same as title)';
COMMENT ON COLUMN portfolio_clips.role IS 'Role of the artist in the project';
COMMENT ON COLUMN portfolio_clips.project_type IS 'Type of project: commercial, music_video, documentary, short_film, film, other';
COMMENT ON COLUMN portfolio_clips.video_source IS 'Source of video: upload, youtube, vimeo, tiktok, google_drive';
COMMENT ON COLUMN portfolio_clips.original_video_url IS 'Original URL of the video from external source';
COMMENT ON COLUMN portfolio_clips.video_embed_url IS 'Embeddable URL for video player';
COMMENT ON COLUMN portfolio_clips.status IS 'Approval status: pending, approved, rejected';
COMMENT ON COLUMN portfolio_clips.uploaded_by_type IS 'Type of uploader: artist, team';
COMMENT ON COLUMN portfolio_clips.uploaded_by_id IS 'ID of the uploader (artist or team)';
