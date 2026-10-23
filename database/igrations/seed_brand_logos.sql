-- Seed all partner logos including brand1-brand6
-- Run this in Supabase SQL Editor

INSERT INTO public.partners (name, logo_url, website, status, featured, description, industry, contact_email) VALUES
('Brand 1', 'https://kjikqldkdufxoaeenwsd.supabase.co/storage/v1/object/public/cms-assets/brand1.svg', 'https://brand1.com', 'active', false, 'Brand 1 Logo', 'Media', 'contact@brand1.com'),
('Brand 2', 'https://kjikqldkdufxoaeenwsd.supabase.co/storage/v1/object/public/cms-assets/brand2.svg', 'https://brand2.com', 'active', false, 'Brand 2 Logo', 'Media', 'contact@brand2.com'),
('Brand 3', 'https://kjikqldkdufxoaeenwsd.supabase.co/storage/v1/object/public/cms-assets/brand3.svg', 'https://brand3.com', 'active', false, 'Brand 3 Logo', 'Media', 'contact@brand3.com'),
('Brand 4', 'https://kjikqldkdufxoaeenwsd.supabase.co/storage/v1/object/public/cms-assets/brand4.svg', 'https://brand4.com', 'active', false, 'Brand 4 Logo', 'Media', 'contact@brand4.com'),
('Brand 5', 'https://kjikqldkdufxoaeenwsd.supabase.co/storage/v1/object/public/cms-assets/brand5.svg', 'https://brand5.com', 'active', false, 'Brand 5 Logo', 'Media', 'contact@brand5.com'),
('Brand 6', 'https://kjikqldkdufxoaeenwsd.supabase.co/storage/v1/object/public/cms-assets/brand6.svg', 'https://brand6.com', 'active', false, 'Brand 6 Logo', 'Media', 'contact@brand6.com')
ON CONFLICT (name) DO NOTHING;
