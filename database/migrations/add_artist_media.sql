-- Add artist_media table for multiple photos and videos
-- This table allows artists to upload multiple photos and short videos for their portfolio

-- Run this in Supabase SQL Editor

-- Create artist_media table
CREATE TABLE IF NOT EXISTS public.artist_media (
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
CREATE INDEX IF NOT EXISTS idx_artist_media_artist_id ON public.artist_media(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_media_type ON public.artist_media(media_type);
CREATE INDEX IF NOT EXISTS idx_artist_media_status ON public.artist_media(status);
CREATE INDEX IF NOT EXISTS idx_artist_media_order ON public.artist_media(artist_id, order_index);

-- Add foreign key constraint to artists table
ALTER TABLE public.artist_media
ADD CONSTRAINT fk_artist_media_artist
FOREIGN KEY (artist_id) REFERENCES public.artists(id) ON DELETE CASCADE;

-- Add trigger for updated_at
CREATE TRIGGER trg_artist_media_updated_at
    BEFORE UPDATE ON public.artist_media
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.artist_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Artists can view their own media
CREATE POLICY "Artists can view own media"
    ON public.artist_media FOR SELECT
    USING (artist_id IN (SELECT id FROM public.artists WHERE email = auth.email()));

-- Artists can insert their own media
CREATE POLICY "Artists can insert own media"
    ON public.artist_media FOR INSERT
    WITH CHECK (artist_id IN (SELECT id FROM public.artists WHERE email = auth.email()));

-- Artists can update their own media
CREATE POLICY "Artists can update own media"
    ON public.artist_media FOR UPDATE
    USING (artist_id IN (SELECT id FROM public.artists WHERE email = auth.email()));

-- Artists can delete their own media
CREATE POLICY "Artists can delete own media"
    ON public.artist_media FOR DELETE
    USING (artist_id IN (SELECT id FROM public.artists WHERE email = auth.email()));

-- Public users can view approved media
CREATE POLICY "Public can view approved media"
    ON public.artist_media FOR SELECT
    USING (status = 'approved');

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
