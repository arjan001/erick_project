-- Insert subscription packages for SmartGigs Kenya
-- Prices in KES (Kenyan Shillings), range 20-30 KES as requested

-- Clear existing subscription packages first
DELETE FROM subscription_packages WHERE name IN ('Basic', 'Pro', 'Premium', 'Starter', 'Standard', 'Enterprise');

-- Insert subscription packages
INSERT INTO subscription_packages (name, slug, description, price_monthly, price_yearly, currency, features, active) VALUES
-- Basic Package - 20 KES monthly
('Basic', 'basic', 'Perfect for getting started. Access to job listings and basic profile features.', 20, 200, 'KES', '[
  "Access to all job listings",
  "Basic profile visibility",
  "Apply to up to 10 jobs per month",
  "Email notifications for new jobs",
  "Basic analytics"
]'::jsonb, true),

-- Pro Package - 30 KES monthly
('Pro', 'pro', 'Everything in Basic plus premium features for serious professionals.', 30, 300, 'KES', '[
  "All Basic features",
  "Priority listing in search results",
  "Unlimited job applications",
  "Verified badge on profile",
  "Advanced analytics dashboard",
  "Direct messaging with clients",
  "Portfolio showcase",
  "Skill endorsements",
  "Priority support"
]'::jsonb, true);
