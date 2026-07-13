-- Seed functional team test account
-- This creates a user and corresponding team profile for testing

-- First, check if the user exists, if not create it
INSERT INTO users (email, password_hash, first_name, last_name, role, created_at, updated_at)
VALUES (
  'team@team.com',
  '$2a$10$placeholder.hash.for.test.account',
  'Studio',
  'Team',
  'team',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Create the team profile with all required fields
-- Use the user's email to find the created user ID
INSERT INTO teams (
  user_id,
  contact_email,
  contact_name,
  team_name,
  team_size,
  specialties,
  hourly_rate,
  availability_status,
  admin_approval_status,
  status,
  availability,
  city,
  country,
  phone,
  bio,
  team_members,
  created_at,
  updated_at
)
SELECT
  id,
  'team@team.com',
  'Studio Team',
  'Creative Studio',
  5,
  ARRAY['Cinematography', 'Editing', 'Color Grading'],
  75.00,
  'available',
  'approved',
  'approved',
  'available',
  'Los Angeles',
  'United States',
  '+1 (555) 123-4567',
  'Award-winning production studio specializing in commercials, music videos, and short films. Our team brings together experienced cinematographers, editors, and colorists to deliver stunning visual content.',
  '[]'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users
WHERE email = 'team@team.com'
ON CONFLICT (user_id) DO UPDATE SET
  contact_email = EXCLUDED.contact_email,
  contact_name = EXCLUDED.contact_name,
  team_name = EXCLUDED.team_name,
  team_size = EXCLUDED.team_size,
  specialties = EXCLUDED.specialties,
  hourly_rate = EXCLUDED.hourly_rate,
  availability_status = EXCLUDED.availability_status,
  admin_approval_status = EXCLUDED.admin_approval_status,
  status = EXCLUDED.status,
  availability = EXCLUDED.availability,
  city = EXCLUDED.city,
  country = EXCLUDED.country,
  phone = EXCLUDED.phone,
  bio = EXCLUDED.bio,
  updated_at = CURRENT_TIMESTAMP;
