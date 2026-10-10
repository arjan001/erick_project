-- Add newsletter and mailing list tables for SmartGigs Kenya
-- This migration creates tables for newsletter management and email campaigns

-- Create newsletter_subscribers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    -- Subscriber status
    status TEXT DEFAULT 'active', -- active, unsubscribed, bounced
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    -- Subscription source
    source TEXT DEFAULT 'manual', -- manual, signup_form, landing_page, admin
    -- Preferences
    preferences JSONB DEFAULT '{"news": true, "updates": true, "offers": true}'::jsonb,
    -- Tracking
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);

-- Drop trigger if exists, then create it
DROP TRIGGER IF EXISTS trg_newsletter_subscribers_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER trg_newsletter_subscribers_updated_at
    BEFORE UPDATE ON public.newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.newsletter_subscribers IS 'Newsletter subscribers list';
COMMENT ON COLUMN public.newsletter_subscribers.status IS 'Subscription status: active, unsubscribed, bounced';
COMMENT ON COLUMN public.newsletter_subscribers.preferences IS 'JSON object with subscriber preferences';

-- Create newsletter_campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    from_name TEXT DEFAULT 'SmartGigs Kenya',
    from_email TEXT DEFAULT 'noreply@smartgigskenya.com',
    -- Content
    content TEXT NOT NULL, -- HTML content
    plain_text TEXT, -- Plain text version
    -- Campaign settings
    status TEXT DEFAULT 'draft', -- draft, scheduled, sent, cancelled
    scheduled_for TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    -- Targeting
    target_segment TEXT DEFAULT 'all', -- all, active, custom
    custom_recipients TEXT[], -- Array of email addresses for custom targeting
    -- Stats
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    -- Preview
    preview_image TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON public.newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_scheduled ON public.newsletter_campaigns(scheduled_for);

-- Drop trigger if exists, then create it
DROP TRIGGER IF EXISTS trg_newsletter_campaigns_updated_at ON public.newsletter_campaigns;
CREATE TRIGGER trg_newsletter_campaigns_updated_at
    BEFORE UPDATE ON public.newsletter_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.newsletter_campaigns IS 'Newsletter email campaigns';
COMMENT ON COLUMN public.newsletter_campaigns.status IS 'Campaign status: draft, scheduled, sent, cancelled';
COMMENT ON COLUMN public.newsletter_campaigns.content IS 'HTML content of the email';
COMMENT ON COLUMN public.newsletter_campaigns.target_segment IS 'Target audience: all, active, custom';

-- Create newsletter_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.newsletter_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    -- Event tracking
    event_type TEXT NOT NULL, -- sent, opened, clicked, bounced, unsubscribed
    event_data JSONB, -- Additional event data (link clicked, etc.)
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- User info
    ip_address TEXT,
    user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_campaign ON public.newsletter_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_subscriber ON public.newsletter_analytics(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_event ON public.newsletter_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_email ON public.newsletter_analytics(email);

COMMENT ON TABLE public.newsletter_analytics IS 'Newsletter campaign analytics and tracking';
COMMENT ON COLUMN public.newsletter_analytics.event_type IS 'Event type: sent, opened, clicked, bounced, unsubscribed';

-- Create newsletter_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.newsletter_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    -- Template content
    subject TEXT,
    content TEXT NOT NULL, -- HTML template with placeholders
    plain_text TEXT,
    -- Template category
    category TEXT DEFAULT 'general', -- general, welcome, update, offer, announcement
    -- Preview
    preview_image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_templates_category ON public.newsletter_templates(category);
CREATE INDEX IF NOT EXISTS idx_newsletter_templates_active ON public.newsletter_templates(is_active);

-- Drop trigger if exists, then create it
DROP TRIGGER IF EXISTS trg_newsletter_templates_updated_at ON public.newsletter_templates;
CREATE TRIGGER trg_newsletter_templates_updated_at
    BEFORE UPDATE ON public.newsletter_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.newsletter_templates IS 'Reusable email templates for newsletters';
COMMENT ON COLUMN public.newsletter_templates.category IS 'Template category: general, welcome, update, offer, announcement';

-- Insert default newsletter templates
INSERT INTO public.newsletter_templates (name, description, subject, content, category)
VALUES
    (
        'Welcome Template',
        'Welcome email for new subscribers',
        'Welcome to SmartGigs Kenya!',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">Welcome to SmartGigs Kenya!</h1>
            <p>Thank you for subscribing to our newsletter.</p>
            <p>You''ll receive updates about new casting calls, industry news, and exclusive offers.</p>
            <p>Best regards,<br>The SmartGigs Kenya Team</p>
        </div>',
        'welcome'
    ),
    (
        'System Update Template',
        'Template for system updates and announcements',
        'SmartGigs Kenya Update',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">SmartGigs Kenya Update</h1>
            <p>We have some exciting news to share with you!</p>
            <p>{{content}}</p>
            <p>Best regards,<br>The SmartGigs Kenya Team</p>
        </div>',
        'update'
    ),
    (
        'Special Offer Template',
        'Template for special offers and promotions',
        'Special Offer from SmartGigs Kenya',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #000;">Special Offer!</h1>
            <p>Don''t miss out on this exclusive offer:</p>
            <p>{{content}}</p>
            <p>Best regards,<br>The SmartGigs Kenya Team</p>
        </div>',
        'offer'
    )
ON CONFLICT DO NOTHING;

-- RLS Policies for newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can manage subscribers"
    ON public.newsletter_subscribers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Public can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Public can subscribe"
    ON public.newsletter_subscribers
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read active subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can read active subscribers"
    ON public.newsletter_subscribers
    FOR SELECT
    USING (true);

-- RLS Policies for newsletter_campaigns
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admins can manage campaigns"
    ON public.newsletter_campaigns
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- RLS Policies for newsletter_analytics
ALTER TABLE public.newsletter_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view analytics" ON public.newsletter_analytics;
CREATE POLICY "Admins can view analytics"
    ON public.newsletter_analytics
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- RLS Policies for newsletter_templates
ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage templates" ON public.newsletter_templates;
CREATE POLICY "Admins can manage templates"
    ON public.newsletter_templates
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Authenticated users can read templates" ON public.newsletter_templates;
CREATE POLICY "Authenticated users can read templates"
    ON public.newsletter_templates
    FOR SELECT
    USING (auth.role() = 'authenticated');
