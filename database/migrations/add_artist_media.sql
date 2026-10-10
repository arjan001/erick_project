-- Add artist_media table for multiple photos and videos
-- This migration is fully idempotent - safe to run multiple times

-- Check if table exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'artist_media'
    ) THEN
        CREATE TABLE public.artist_media (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            artist_id UUID NOT NULL,
            media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('photo', 'video')),
            media_url TEXT NOT NULL,
            thumbnail_url TEXT,
            caption TEXT,
            order_index INTEGER DEFAULT 0,
            is_primary BOOLEAN DEFAULT false,
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes
        CREATE INDEX idx_artist_media_artist_id ON public.artist_media(artist_id);
        CREATE INDEX idx_artist_media_type ON public.artist_media(media_type);
        CREATE INDEX idx_artist_media_status ON public.artist_media(status);
        CREATE INDEX idx_artist_media_order ON public.artist_media(artist_id, order_index);

        -- Add foreign key constraint to creators table
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints
                WHERE constraint_name = 'fk_artist_media_artist'
                AND table_name = 'artist_media'
            ) THEN
                ALTER TABLE public.artist_media
                ADD CONSTRAINT fk_artist_media_artist
                FOREIGN KEY (artist_id) REFERENCES public.creators(id) ON DELETE CASCADE;
            END IF;
        END $$;

        -- Add trigger for updated_at
        DROP TRIGGER IF EXISTS trg_artist_media_updated_at ON public.artist_media;
        CREATE TRIGGER trg_artist_media_updated_at
            BEFORE UPDATE ON public.artist_media
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();

        -- Enable RLS
        ALTER TABLE public.artist_media ENABLE ROW LEVEL SECURITY;

        -- Add comments
        COMMENT ON TABLE public.artist_media IS 'Artist portfolio media (photos and videos)';
        COMMENT ON COLUMN public.artist_media.artist_id IS 'Reference to the artist who owns this media';
        COMMENT ON COLUMN public.artist_media.media_type IS 'Type of media: photo or video';
        COMMENT ON COLUMN public.artist_media.media_url IS 'URL to the media file in Supabase Storage';
        COMMENT ON COLUMN public.artist_media.thumbnail_url IS 'URL to thumbnail (for videos)';
        COMMENT ON COLUMN public.artist_media.caption IS 'Optional caption or description';
        COMMENT ON COLUMN public.artist_media.order_index IS 'Display order (lower numbers shown first)';
        COMMENT ON COLUMN public.artist_media.is_primary IS 'Mark as primary/featured media';
        COMMENT ON COLUMN public.artist_media.status IS 'Approval status: pending, approved, rejected';
    END IF;
END $$;

-- Add RLS policies only if they don't exist
DO $$
BEGIN
    -- Artists can view own media
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Artists can view own media'
        AND tablename = 'artist_media'
    ) THEN
        CREATE POLICY "Artists can view own media"
            ON public.artist_media FOR SELECT
            USING (artist_id IN (SELECT id FROM public.creators WHERE email = auth.email()));
    END IF;

    -- Artists can insert own media
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Artists can insert own media'
        AND tablename = 'artist_media'
    ) THEN
        CREATE POLICY "Artists can insert own media"
            ON public.artist_media FOR INSERT
            WITH CHECK (artist_id IN (SELECT id FROM public.creators WHERE email = auth.email()));
    END IF;

    -- Artists can update own media
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Artists can update own media'
        AND tablename = 'artist_media'
    ) THEN
        CREATE POLICY "Artists can update own media"
            ON public.artist_media FOR UPDATE
            USING (artist_id IN (SELECT id FROM public.creators WHERE email = auth.email()));
    END IF;

    -- Artists can delete own media
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Artists can delete own media'
        AND tablename = 'artist_media'
    ) THEN
        CREATE POLICY "Artists can delete own media"
            ON public.artist_media FOR DELETE
            USING (artist_id IN (SELECT id FROM public.creators WHERE email = auth.email()));
    END IF;

    -- Public can view approved media
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE policyname = 'Public can view approved media'
        AND tablename = 'artist_media'
    ) THEN
        CREATE POLICY "Public can view approved media"
            ON public.artist_media FOR SELECT
            USING (status = 'approved');
    END IF;
END $$;
