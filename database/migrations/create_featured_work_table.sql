-- Create featured_work table for managing featured projects on the landing page
-- This table stores curated projects that are displayed in the Featured Work section

CREATE TABLE IF NOT EXISTS featured_work (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    video_url TEXT,
    featured_type VARCHAR(20) DEFAULT 'admin_pick', -- 'admin_pick', 'paid', 'subscription'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive'
    display_order INTEGER DEFAULT 0,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Optional link to actual project
    artist_id UUID REFERENCES artists(id) ON DELETE SET NULL, -- Optional link to artist
    portfolio_clip_id UUID REFERENCES portfolio_clips(id) ON DELETE SET NULL, -- Optional link to portfolio clip
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_featured_work_status ON featured_work(status);
CREATE INDEX IF NOT EXISTS idx_featured_work_display_order ON featured_work(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_work_project_id ON featured_work(project_id);
CREATE INDEX IF NOT EXISTS idx_featured_work_artist_id ON featured_work(artist_id);
CREATE INDEX IF NOT EXISTS idx_featured_work_portfolio_clip_id ON featured_work(portfolio_clip_id);
CREATE INDEX IF NOT EXISTS idx_featured_work_featured_type ON featured_work(featured_type);

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_featured_work_updated_at ON featured_work;

-- Add trigger to update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_featured_work_updated_at
    BEFORE UPDATE ON featured_work
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add check constraint for valid status values
ALTER TABLE featured_work 
ADD CONSTRAINT chk_featured_work_status 
CHECK (status IN ('active', 'inactive'));

-- Add check constraint for valid featured_type values
ALTER TABLE featured_work 
ADD CONSTRAINT chk_featured_work_type 
CHECK (featured_type IN ('admin_pick', 'paid', 'subscription'));

-- Add comments for documentation
COMMENT ON TABLE featured_work IS 'Stores featured projects displayed on the landing page';
COMMENT ON COLUMN featured_work.title IS 'Title of the featured work';
COMMENT ON COLUMN featured_work.description IS 'Description of the featured work';
COMMENT ON COLUMN featured_work.images IS 'Array of image URLs for the featured work';
COMMENT ON COLUMN featured_work.video_url IS 'Video URL for the featured work';
COMMENT ON COLUMN featured_work.featured_type IS 'Type of featured work: admin_pick, paid, or subscription';
COMMENT ON COLUMN featured_work.status IS 'Status: active or inactive';
COMMENT ON COLUMN featured_work.display_order IS 'Display order for sorting (lower numbers appear first)';
COMMENT ON COLUMN featured_work.project_id IS 'Optional reference to the actual project in projects table';

-- Grant permissions to admin role
GRANT ALL ON featured_work TO admin;
GRANT USAGE, SELECT ON SEQUENCE featured_work_id_seq TO admin;

-- Enable RLS and create policies for admin access
ALTER TABLE featured_work ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on featured_work
CREATE POLICY "Admin full access to featured_work" ON featured_work
    FOR ALL
    TO admin
    USING (true)
    WITH CHECK (true);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service full access to featured_work" ON featured_work
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated users can view active featured work
CREATE POLICY "Authenticated users can view featured_work" ON featured_work
    FOR SELECT
    TO authenticated
    USING (status = 'active');

-- Public can view active featured work
CREATE POLICY "Public can view featured_work" ON featured_work
    FOR SELECT
    TO anon
    USING (status = 'active');
