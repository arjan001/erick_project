-- Seed all partner logos including brand1-brand6
-- Run this in Supabase SQL Editor
-- Note: Upload brand1.svg through brand6.svg to cms-assets bucket first, then run this

INSERT INTO public.partners (name, logo_url, website, status, featured, description, industry, contact_email) VALUES
('Brand 1', '/brand1.svg', 'https://brand1.com', 'active', false, 'Brand 1 Logo', 'Media', 'contact@brand1.com'),
('Brand 2', '/brand2.svg', 'https://brand2.com', 'active', false, 'Brand 2 Logo', 'Media', 'contact@brand2.com'),
('Brand 3', '/brand3.svg', 'https://brand3.com', 'active', false, 'Brand 3 Logo', 'Media', 'contact@brand3.com'),
('Brand 4', '/brand4.svg', 'https://brand4.com', 'active', false, 'Brand 4 Logo', 'Media', 'contact@brand4.com'),
('Brand 5', '/brand5.svg', 'https://brand5.com', 'active', false, 'Brand 5 Logo', 'Media', 'contact@brand5.com'),
('Brand 6', '/brand6.svg', 'https://brand6.com', 'active', false, 'Brand 6 Logo', 'Media', 'contact@brand6.com')
ON CONFLICT (name) DO NOTHING;
