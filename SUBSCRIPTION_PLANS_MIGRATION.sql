-- ============================================================
-- Studio22 — Subscription Plans Migration
-- New 3-tier plan system:
--   1. Free              — €0/mo, basic access
--   2. Plus              — €9/mo, expanded limits
--   3. Pro (Beta Release) — Invitation only, free for invited creators
-- Run this in Supabase SQL Editor.
-- ============================================================

-- 1. Add invitation_only column to subscription_packages
ALTER TABLE subscription_packages
  ADD COLUMN IF NOT EXISTS invitation_only BOOLEAN DEFAULT FALSE;

-- 2. Add referred_by column to subscriptions (tracks which invite code was used)
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- 3. Ensure unique constraint on package name (for clean upserts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscription_packages_name_key'
  ) THEN
    ALTER TABLE subscription_packages
      ADD CONSTRAINT subscription_packages_name_key UNIQUE (name);
  END IF;
END $$;

-- 4. Upsert the 3 new plans (EUR currency, updated limits)
INSERT INTO subscription_packages
  (name, description, price, currency, billing_cycle,
   job_applications_limit, message_limit, connects_included,
   featured_listing, priority_support, analytics_access,
   active, display_order, invitation_only)
VALUES
  -- Free
  ('Free',
   'Free plan — get started with basic access to the Studio22 network.',
   0, 'EUR', 'monthly',
   5, 20, 5,
   FALSE, FALSE, FALSE,
   TRUE, 0, FALSE),

  -- Plus (€9/month)
  ('Plus',
   'Plus plan — more applications, more messages, more connects. €9/month.',
   9, 'EUR', 'monthly',
   20, 100, 15,
   FALSE, FALSE, FALSE,
   TRUE, 1, FALSE),

  -- Pro (Beta Release) — invitation only, free for invited creators
  ('Pro',
   'Pro Beta Release — invitation only. Unlimited applications, featured listing, priority support, and analytics. Free for invited creators.',
   0, 'EUR', 'monthly',
   -1, -1, 30,
   TRUE, TRUE, TRUE,
   TRUE, 2, TRUE)
ON CONFLICT (name) DO UPDATE SET
  description            = EXCLUDED.description,
  price                  = EXCLUDED.price,
  currency               = EXCLUDED.currency,
  billing_cycle          = EXCLUDED.billing_cycle,
  job_applications_limit = EXCLUDED.job_applications_limit,
  message_limit          = EXCLUDED.message_limit,
  connects_included      = EXCLUDED.connects_included,
  featured_listing       = EXCLUDED.featured_listing,
  priority_support       = EXCLUDED.priority_support,
  analytics_access       = EXCLUDED.analytics_access,
  active                 = EXCLUDED.active,
  display_order          = EXCLUDED.display_order,
  invitation_only        = EXCLUDED.invitation_only;

-- 5. Deactivate legacy plans that no longer exist in the new tier system
UPDATE subscription_packages
  SET active = FALSE
  WHERE name IN ('Basic', 'Elite')
    AND name NOT IN ('Free', 'Plus', 'Pro');

-- 6. Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscription_packages_name
  ON subscription_packages (name);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_email
  ON subscriptions (user_email);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON subscriptions (status);

-- ============================================================
-- Verification queries (run after to confirm)
-- ============================================================
-- SELECT name, price, currency, invitation_only, active, display_order
--   FROM subscription_packages ORDER BY display_order;