-- Seed data for content_categories table
-- These categories will be displayed on the homepage "Browse by Category" section

INSERT INTO content_categories (name, slug, description, image_url, display_order, status, is_featured, created_at) VALUES
  (
    'Automotive Excellence',
    'automotive-excellence',
    'High-octane car commercials with dynamic camera work, precision lighting, and cinematic storytelling.',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200',
    1,
    'active',
    true,
    NOW()
  ),
  (
    'Fashion & Lifestyle',
    'fashion-lifestyle',
    'Elegant fashion films showcasing collections through artful composition and sophisticated visual narratives.',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200',
    2,
    'active',
    true,
    NOW()
  ),
  (
    'Tech & Innovation',
    'tech-innovation',
    'Sleek product reveals and tech launches with modern aesthetics and cutting-edge visual effects.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200',
    3,
    'active',
    true,
    NOW()
  ),
  (
    'Food & Beverage',
    'food-beverage',
    'Mouthwatering culinary cinematography with macro shots, steam effects, and appetizing color grading.',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200',
    4,
    'active',
    true,
    NOW()
  ),
  (
    'Documentary Stories',
    'documentary-stories',
    'Authentic human stories captured through intimate interviews, natural lighting, and real-world settings.',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1200',
    5,
    'active',
    true,
    NOW()
  ),
  (
    'Music Videos',
    'music-videos',
    'Bold artistic expressions combining narrative storytelling with dynamic performance cinematography.',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200',
    6,
    'active',
    true,
    NOW()
  )
ON CONFLICT (slug) DO NOTHING;
