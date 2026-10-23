-- Seed dummy blog articles with featured data
-- Run this in Supabase SQL Editor

INSERT INTO public.articles (title, slug, excerpt, content, cover_image, category, tags, published, published_at, featured, views) VALUES
(
  'Earn CA$1,500 for a Supernatural Thriller + More Casting Calls In Canada',
  'earn-1500-supernatural-thriller-casting-calls-canada',
  'Exciting casting opportunities for supernatural thriller film in Canada. Multiple roles available for experienced actors.',
  '<p>Production is currently casting for an upcoming supernatural thriller feature film set to begin filming in Vancouver, BC. The project is looking for talented actors across various age ranges and experience levels.</p>
<p><strong>Available Roles:</strong></p>
<ul>
<li>Lead Actor (Male, 25-35): $1,500/day</li>
<li>Supporting Actress (Female, 20-30): $800/day</li>
<li>Villain Role (Male, 30-45): $1,200/day</li>
<li>Supporting Cast (Various): $500-$800/day</li>
</ul>
<p>Requirements: Previous acting experience, ability to work flexible hours, valid work permit for Canada.</p>
<p>Auditions will be held in Vancouver and Toronto. Selected candidates will be contacted within 48 hours.</p>',
  '/ericlogo/Multan-Production-Logo-Website.png',
  'Casting',
  ARRAY['supernatural', 'thriller', 'vancouver', 'canada', 'casting', 'paid'],
  true,
  NOW(),
  true,
  245
),
(
  'SmartGigs Kenya Launches New Platform for Creative Industry',
  'smartgigs-kenya-launches-new-platform-creative-industry',
  'Revolutionary platform connecting actors, crew, and producers in Kenya''s growing film and creative industry.',
  '<p>SmartGigs Kenya is proud to announce the official launch of our innovative platform designed to revolutionize how the creative industry operates in Kenya.</p>
<p>Our platform provides a centralized hub where actors, voice artists, crew members, and production companies can connect, collaborate, and create amazing content together.</p>
<p><strong>Key Features:</strong></p>
<ul>
<li>Talent database with detailed profiles and portfolios</li>
<li>Job posting and application system</li>
<li>Direct messaging between talent and producers</li>
<li>Secure payment integration for services</li>
<li>Portfolio and media management</li>
</ul>
<p>Join us today and be part of Kenya''s creative revolution. Sign up is free for all talent.</p>',
  '/ericlogo/logowhite.png',
  'News',
  ARRAY['launch', 'platform', 'kenya', 'creative', 'industry', 'tech'],
  true,
  NOW(),
  true,
  520
)
ON CONFLICT DO NOTHING;
