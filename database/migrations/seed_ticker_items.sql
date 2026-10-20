-- ============================================================
-- SEED TICKER ITEMS TABLE WITH DUMMY DATA
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor

-- Insert dummy ticker items
INSERT INTO public.ticker_items (text, link, active, display_order) VALUES
('🎬 SmartGigs Kenya - Your gateway to creative talent', null, true, 1),
('🌟 Featured: Star in upcoming Nollywood productions!', '/FindGigs', true, 2),
('🎭 New casting calls for actors and voice artists', '/FindGigs', true, 3),
('📢 Production companies are hiring now - Apply today!', '/FindGigs', true, 4),
('🎬 Join our community of creative professionals', '/SignUp', true, 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- COMPLETED
-- ============================================================
-- The ticker_items table is now seeded with dummy data.
-- These will appear in the navbar marquee ticker.
