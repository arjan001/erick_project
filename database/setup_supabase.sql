-- SmartGigs Kenya - Complete Supabase Database Setup
-- Run this entire script in Supabase SQL Editor to set up the database
-- This combines the main schema with analytics tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- MAIN SCHEMA
-- ============================================================

-- Read and execute the main schema
\i database/supabase_schema.sql

-- ============================================================
-- ANALYTICS TABLES
-- ============================================================

-- Note: user_sessions, page_views, live_users, and analytics tables
-- are created separately to avoid conflicts

-- These tables are in migrations/add_analytics_tables.sql
-- Run that file after this one if needed

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Run storage buckets setup
\i database/legacy_sql/STORAGE_BUCKETS.sql

-- ============================================================
-- COMPLETE
-- ============================================================

-- Verify setup
SELECT 'Database setup complete!' as status;
