-- Seed partner logos from public/ericlogo folder
-- Run this in Supabase SQL Editor

-- Insert logos into partners table
INSERT INTO public.partners (name, logo_url, website, description, industry, status, featured) VALUES
('Multan Production', '/ericlogo/Multan-Production-Logo-Website.png', NULL, 'Production company', 'Production', 'active', true),
('Zamaradi', '/ericlogo/our-brands-zamaradi.png', NULL, 'Brand partner', 'Media', 'active', true),
('SmartGigs Logo', '/ericlogo/logowhite.png', NULL, 'Primary brand', 'Technology', 'active', true),
('Insignia', '/ericlogo/INsignia_red_1261x916_logo-650x433.png.webp', NULL, 'Partner brand', 'Media', 'active', true),
('Web Logo', '/ericlogo/Web-Logo-3.png', NULL, 'Brand partner', 'Technology', 'active', true),
('Web Logo Alt', '/ericlogo/Web-Logo-3 (1).png', NULL, 'Brand partner', 'Technology', 'active', true),
('Brand Image 1', '/ericlogo/100986583_1938815372918364_5702847353606635520_n.jpg', NULL, 'Partner brand', 'Media', 'active', true),
('Brand Image 2', '/ericlogo/images.jfif', NULL, 'Partner brand', 'Media', 'active', true),
('Brand Image 3', '/ericlogo/images (1).jfif', NULL, 'Partner brand', 'Media', 'active', true),
('Brand Image 4', '/ericlogo/images (2).jfif', NULL, 'Partner brand', 'Media', 'active', true)
ON CONFLICT DO NOTHING;
