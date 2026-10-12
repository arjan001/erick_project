-- Insert shop products for SmartGigs Kenya
-- Only 5 products with images
-- Prices in KES (Kenyan Shillings), range 20-30 KES as requested
-- Some products are auction-only, others buy-direct

-- Clear existing shop products
DELETE FROM shop_products;

-- Insert 5 realistic film/production equipment products
INSERT INTO shop_products (name, slug, description, image, category, sku, price, discount_price, currency, stock, sold, status, featured, fulfillment_type, auction_enabled, auction_start_price, auction_end_time) VALUES
-- Product 1: Cinema Camera (Buy Direct)
('Sony FX3 Cinema Camera', 'sony-fx3-cinema-camera', 'Professional cinema camera with 4K recording, excellent low-light performance, and compact design perfect for on-the-go filmmaking.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', 'Equipment', 'CAM-001', 30000, NULL, 'KES', 5, 0, 'active', true, 'physical', false, NULL, NULL),

-- Product 2: Camera Lens (Auction)
('Canon EF 24-70mm f/2.8L Lens', 'canon-ef-24-70mm-lens', 'Professional zoom lens with fast f/2.8 aperture, ideal for portraits, weddings, and event photography. Sharp and versatile. Auction only!', 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&q=80', 'Equipment', 'LENS-001', 25000, NULL, 'KES', 1, 0, 'active', true, 'physical', true, 20000, '2026-11-12 23:59:59'),

-- Product 3: Lighting Kit (Buy Direct)
('Aputure 600d Pro LED Light', 'aputure-600d-pro-led', 'High-output LED daylight light with accurate color reproduction. Perfect for interviews, product shots, and cinematic lighting setups.', 'https://images.unsplash.com/photo-1574269909862-220e6d8bb312?w=800&q=80', 'Lighting', 'LIGHT-001', 20000, NULL, 'KES', 10, 0, 'active', false, 'physical', false, NULL, NULL),

-- Product 4: Tripod (Buy Direct)
('Manfrotto Carbon Fiber Tripod', 'manfrotto-carbon-tripod', 'Lightweight yet sturdy carbon fiber tripod with fluid head. Smooth pan and tilt for professional video production.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 'Accessories', 'TRIPOD-001', 15000, NULL, 'KES', 15, 0, 'active', false, 'physical', false, NULL, NULL),

-- Product 5: Wireless Microphone (Auction)
('Rode Wireless GO II Mic', 'rode-wireless-go-ii', 'Compact wireless microphone system with dual channels. Crystal clear audio for interviews, vlogs, and documentary work. Auction only!', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80', 'Audio', 'MIC-001', 18000, NULL, 'KES', 1, 0, 'active', false, 'physical', true, 15000, '2026-11-15 23:59:59');
