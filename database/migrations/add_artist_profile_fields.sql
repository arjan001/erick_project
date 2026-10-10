-- Add missing fields to artists table for comprehensive profile management
-- This migration adds fields for appearance, social media, representation, credits, education, union membership, license/passport, self-recording equipment, and highlights

-- Run this in Supabase SQL Editor

-- Check if table exists, if not create it (for new installations)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'artists') THEN
        CREATE TABLE artists (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255),
            phone VARCHAR(50),
            role VARCHAR(50),
            roles TEXT[] DEFAULT ARRAY[]::TEXT[],
            secondary_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
            skills_experience JSONB DEFAULT '[]',
            based_in_city VARCHAR(255),
            based_in_country VARCHAR(255),
            languages_spoken TEXT[] DEFAULT ARRAY[]::TEXT[],
            portfolio_clips TEXT[] DEFAULT ARRAY[]::TEXT[],
            ai_questionnaire_response JSONB,
            website VARCHAR(255),
            instagram VARCHAR(255),
            twitter VARCHAR(255),
            youtube VARCHAR(255),
            vimeo VARCHAR(255),
            imdb VARCHAR(255),
            linkedin VARCHAR(255),
            profile_photo_url TEXT,
            bio TEXT,
            email_notifications BOOLEAN DEFAULT TRUE,
            project_alerts BOOLEAN DEFAULT TRUE,
            profile_public BOOLEAN DEFAULT TRUE,
            status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            admin_notes TEXT,
            approved_date DATE,
            connects_balance NUMERIC DEFAULT 5,
            last_active TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_artists_email ON artists(email);
        CREATE INDEX idx_artists_status ON artists(status);
    END IF;
END $$;

-- Add new columns if they don't exist
DO $$
BEGIN
    -- Profession field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'profession') THEN
        ALTER TABLE artists ADD COLUMN profession VARCHAR(255);
    END IF;

    -- Gender field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'gender') THEN
        ALTER TABLE artists ADD COLUMN gender VARCHAR(50);
    END IF;

    -- Appearance JSONB field (height, weight, ageRange, ethnicity, build, hairColor, eyeColor)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'appearance') THEN
        ALTER TABLE artists ADD COLUMN appearance JSONB DEFAULT '{"height":"","weight":"","ageRange":"","ethnicity":"","build":"","hairColor":"","eyeColor":""}'::jsonb;
    END IF;

    -- Skills array field (separate from skills_experience for easier querying)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'skills') THEN
        ALTER TABLE artists ADD COLUMN skills TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    -- Credits JSONB field (film, commercials)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'credits') THEN
        ALTER TABLE artists ADD COLUMN credits JSONB DEFAULT '{"film":[],"commercials":[]}'::jsonb;
    END IF;

    -- Education array field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'education') THEN
        ALTER TABLE artists ADD COLUMN education TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    -- Social Media JSONB field (instagram, linkedin, twitter, youtube, tiktok)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'socialMedia') THEN
        ALTER TABLE artists ADD COLUMN "socialMedia" JSONB DEFAULT '{"instagram":"","linkedin":"","twitter":"","youtube":"","tiktok":""}'::jsonb;
    END IF;

    -- Representation JSONB field (agent, email)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'representation') THEN
        ALTER TABLE artists ADD COLUMN representation JSONB DEFAULT '{"agent":"","email":""}'::jsonb;
    END IF;

    -- Union Membership array field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'unionMembership') THEN
        ALTER TABLE artists ADD COLUMN "unionMembership" TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    -- License & Passport JSONB field (driverLicense, passport)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'licensePassport') THEN
        ALTER TABLE artists ADD COLUMN "licensePassport" JSONB DEFAULT '{"driverLicense":false,"passport":false}'::jsonb;
    END IF;

    -- Self-Recording Equipment field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'self_recording_equipment') THEN
        ALTER TABLE artists ADD COLUMN self_recording_equipment TEXT;
    END IF;

    -- Highlights field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'artists' AND column_name = 'highlights') THEN
        ALTER TABLE artists ADD COLUMN highlights TEXT;
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_artists_skills ON artists USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_artists_appearance ON artists USING GIN (appearance);
CREATE INDEX IF NOT EXISTS idx_artists_credits ON artists USING GIN (credits);
CREATE INDEX IF NOT EXISTS idx_artists_socialMedia ON artists USING GIN ("socialMedia");

-- Add comment to table
COMMENT ON TABLE artists IS 'Artist/Creator profiles with comprehensive film industry skills and credentials';

-- Add comments to new columns
COMMENT ON COLUMN artists.profession IS 'Primary profession or job title';
COMMENT ON COLUMN artists.gender IS 'Gender identity';
COMMENT ON COLUMN artists.appearance IS 'JSONB object containing height, weight, ageRange, ethnicity, build, hairColor, eyeColor';
COMMENT ON COLUMN artists.skills IS 'Array of film industry skills';
COMMENT ON COLUMN artists.credits IS 'JSONB object containing film and commercial credits';
COMMENT ON COLUMN artists.education IS 'Array of education and training institutions';
COMMENT ON COLUMN artists."socialMedia" IS 'JSONB object containing social media links (instagram, linkedin, twitter, youtube, tiktok)';
COMMENT ON COLUMN artists.representation IS 'JSONB object containing agency and agent email';
COMMENT ON COLUMN artists."unionMembership" IS 'Array of union memberships';
COMMENT ON COLUMN artists."licensePassport" IS 'JSONB object containing driverLicense and passport boolean flags';
COMMENT ON COLUMN artists.self_recording_equipment IS 'Description of self-recording equipment and setup';
COMMENT ON COLUMN artists.highlights IS 'Special highlights or notable achievements';
