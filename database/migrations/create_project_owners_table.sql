-- Create project_owners table for client profile management
-- This table stores client/company profile information for project owners

CREATE TABLE IF NOT EXISTS project_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(50),
    website TEXT,
    bio TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    profile_photo_url TEXT,
    
    -- Social media links
    linkedin TEXT,
    instagram TEXT,
    twitter TEXT,
    youtube TEXT,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    project_updates BOOLEAN DEFAULT true,
    profile_public BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_project_owners_email ON project_owners(email);
CREATE INDEX IF NOT EXISTS idx_project_owners_created_at ON project_owners(created_at);

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_project_owners_updated_at ON public.project_owners;

-- Add trigger to update updated_at on row update
CREATE TRIGGER update_project_owners_updated_at
    BEFORE UPDATE ON public.project_owners
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
