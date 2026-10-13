-- Reset shop_products table: delete all products and restart ID sequence
-- Run this in Supabase SQL Editor

-- Delete all products from shop_products table
DELETE FROM public.shop_products;

-- Reset the ID sequence to start from 1
ALTER SEQUENCE public.shop_products_id_seq RESTART WITH 1;

-- Verify the reset
SELECT setval('public.shop_products_id_seq', 1, false);
