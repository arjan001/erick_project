-- Seed partner logos from public/ericlogo folder
-- Run this in Supabase SQL Editor

-- Insert logos into partners table
INSERT INTO public.partners (name, logo_url, website, description, industry, status, featured) VALUES
('Multan Production', '/ericlogo/Multan-Production-Logo-Website.png', NULL, 'Production company', 'Production', 'active', true),
('Zamaradi', '/ericlogo/our-brands-zamaradi.png', NULL, 'Brand partner', 'Media', 'active', true),
('SmartGigs Logo', '/ericlogo/logowhite.png', NULL, 'Primary brand', 'Technology', 'active', true),
('Insignia', '/ericlogo/INsignia_red_1261x916_logo-650x433.png.webp', NULL, 'Partner brand', 'Media', 'active', false),
('Web Logo', '/ericlogo/Web-Logo-3.png', NULL, 'Brand partner', 'Technology', 'active', false),
('Web Logo Alt', '/ericlogo/Web-Logo-3 (1).png', NULL, 'Brand partner', 'Technology', 'active', false)
ON CONFLICT DO NOTHING;
