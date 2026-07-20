-- ============================================
-- POPULATE REFERENCE DATA TABLES
-- Insert data from JSON files into reference tables
-- ============================================

-- ============================================
-- POPULATE SKILLS
-- ============================================

-- 3D CGI Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('3D Modeling', '3d_cgi', 1),
('3D Sculpting', '3d_cgi', 2),
('3D Texturing', '3d_cgi', 3),
('3D Rendering', '3d_cgi', 4),
('3D Animation', '3d_cgi', 5),
('Character Modeling', '3d_cgi', 6),
('Character Rigging', '3d_cgi', 7),
('Character Animation', '3d_cgi', 8),
('Environment Art', '3d_cgi', 9),
('Hard Surface Modeling', '3d_cgi', 10),
('Organic Modeling', '3d_cgi', 11),
('UV Mapping', '3d_cgi', 12),
('Substance Painter', '3d_cgi', 13),
('Substance Designer', '3d_cgi', 14),
('ZBrush', '3d_cgi', 15),
('Blender', '3d_cgi', 16),
('Maya', '3d_cgi', 17),
('Cinema 4D', '3d_cgi', 18),
('Houdini', '3d_cgi', 19),
('3ds Max', '3d_cgi', 20),
('Look Development', '3d_cgi', 21),
('Lighting', '3d_cgi', 22),
('Shading', '3d_cgi', 23),
('Compositing', '3d_cgi', 24),
('Matchmoving', '3d_cgi', 25),
('Rotoscoping', '3d_cgi', 26),
('Motion Capture', '3d_cgi', 27),
('Photogrammetry', '3d_cgi', 28),
('Procedural Generation', '3d_cgi', 29),
('Particle Effects', '3d_cgi', 30),
('Fluid Simulation', '3d_cgi', 31),
('Cloth Simulation', '3d_cgi', 32),
('Hair/Fur Simulation', '3d_cgi', 33),
('Destruction', '3d_cgi', 34),
('Crowd Simulation', '3d_cgi', 35)
ON CONFLICT (skill_name) DO NOTHING;

-- 2D Animation Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('2D Animation', '2d_animation', 1),
('Traditional Animation', '2d_animation', 2),
('Digital Animation', '2d_animation', 3),
('Character Design', '2d_animation', 4),
('Storyboarding', '2d_animation', 5),
('Layout', '2d_animation', 6),
('Background Art', '2d_animation', 7),
('Clean-up', '2d_animation', 8),
('In-betweening', '2d_animation', 9),
('Timing', '2d_animation', 10),
('Squash and Stretch', '2d_animation', 11),
('Lip Sync', '2d_animation', 12),
('Adobe Animate', '2d_animation', 13),
('Toon Boom Harmony', '2d_animation', 14),
('TVPaint', '2d_animation', 15),
('Moho', '2d_animation', 16),
('Krita', '2d_animation', 17),
('Clip Studio Paint', '2d_animation', 18)
ON CONFLICT (skill_name) DO NOTHING;

-- VFX Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('VFX Supervision', 'visual_effects', 1),
('Compositing', 'visual_effects', 2),
('Rotoscoping', 'visual_effects', 3),
('Paint', 'visual_effects', 4),
('Matchmoving', 'visual_effects', 5),
('Tracking', 'visual_effects', 6),
('Camera Tracking', 'visual_effects', 7),
('3D Tracking', 'visual_effects', 8),
('Green Screen', 'visual_effects', 9),
('Chroma Key', 'visual_effects', 10),
('Color Grading', 'visual_effects', 11),
('Color Correction', 'visual_effects', 12),
('Particle Effects', 'visual_effects', 13),
('Fluid Simulation', 'visual_effects', 14),
('Fire/Smoke Simulation', 'visual_effects', 15),
('Explosions', 'visual_effects', 16),
('Destruction', 'visual_effects', 17),
('Crowd Simulation', 'visual_effects', 18),
('Digital Makeup', 'visual_effects', 19),
('Digital Doubles', 'visual_effects', 20),
('Set Extension', 'visual_effects', 21),
('Environment Creation', 'visual_effects', 22),
('Matte Painting', 'visual_effects', 23),
('Nuke', 'visual_effects', 24),
('After Effects', 'visual_effects', 25),
('Fusion', 'visual_effects', 26),
('Silhouette', 'visual_effects', 27)
ON CONFLICT (skill_name) DO NOTHING;

-- Cinematography Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Cinematography', 'cinematography', 1),
('Directing Photography', 'cinematography', 2),
('Camera Operation', 'cinematography', 3),
('Focus Pulling', 'cinematography', 4),
('1st AC', 'cinematography', 5),
('2nd AC', 'cinematography', 6),
('Camera Assistant', 'cinematography', 7),
('Steadicam', 'cinematography', 8),
('Gimbal Operation', 'cinematography', 9),
('Drone Operation', 'cinematography', 10),
('FPV Drone', 'cinematography', 11),
('Aerial Cinematography', 'cinematography', 12),
('Underwater Cinematography', 'cinematography', 13),
('Slow Motion', 'cinematography', 14),
('High Speed', 'cinematography', 15),
('Time-lapse', 'cinematography', 16),
('Hyperlapse', 'cinematography', 17),
('Lighting Design', 'cinematography', 18),
('Gaffer', 'cinematography', 19),
('Best Boy', 'cinematography', 20),
('Lighting Technician', 'cinematography', 21),
('Grip', 'cinematography', 22),
('Key Grip', 'cinematography', 23),
('Dolly Grip', 'cinematography', 24),
('Crane Operation', 'cinematography', 25),
('Jib Operation', 'cinematography', 26),
('Camera Rigging', 'cinematography', 27),
('Lens Selection', 'cinematography', 28),
('Anamorphic', 'cinematography', 29),
('Large Format', 'cinematography', 30),
('Digital Cinema', 'cinematography', 31),
('Film Photography', 'cinematography', 32)
ON CONFLICT (skill_name) DO NOTHING;

-- Editing Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Video Editing', 'editing', 1),
('Film Editing', 'editing', 2),
('Offline Editing', 'editing', 3),
('Online Editing', 'editing', 4),
('Assistant Editing', 'editing', 5),
('Color Grading', 'editing', 6),
('Color Correction', 'editing', 7),
('DaVinci Resolve', 'editing', 8),
('Premiere Pro', 'editing', 9),
('Final Cut Pro', 'editing', 10),
('Avid Media Composer', 'editing', 11),
('Avid', 'editing', 12),
('Narrative Editing', 'editing', 13),
('Documentary Editing', 'editing', 14),
('Commercial Editing', 'editing', 15),
('Music Video Editing', 'editing', 16),
('Trailers', 'editing', 17),
('Sound Design', 'editing', 18),
('Sound Editing', 'editing', 19),
('Dialogue Editing', 'editing', 20),
('Foley', 'editing', 21),
('ADR', 'editing', 22),
('Mixing', 'editing', 23),
('Audio Mixing', 'editing', 24),
('Re-recording Mixing', 'editing', 25),
('Pro Tools', 'editing', 26),
('Logic Pro', 'editing', 27)
ON CONFLICT (skill_name) DO NOTHING;

-- Sound Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Sound Design', 'sound', 1),
('Sound Engineering', 'sound', 2),
('Sound Recording', 'sound', 3),
('Location Sound', 'sound', 4),
('Production Sound', 'sound', 5),
('Boom Operation', 'sound', 6),
('Sound Mixing', 'sound', 7),
('Audio Mixing', 'sound', 8),
('Re-recording Mixing', 'sound', 9),
('Dialogue Editing', 'sound', 10),
('Foley', 'sound', 11),
('Foley Artist', 'sound', 12),
('ADR', 'sound', 13),
('Voice Recording', 'sound', 14),
('Music Production', 'sound', 15),
('Music Composition', 'sound', 16),
('Score', 'sound', 17),
('Sound Effects', 'sound', 18),
('Field Recording', 'sound', 19),
('Audio Post-production', 'sound', 20),
('Pro Tools', 'sound', 21),
('Logic Pro', 'sound', 22),
('Ableton Live', 'sound', 23),
('Cubase', 'sound', 24),
('Nuendo', 'sound', 25),
('Reaper', 'sound', 26),
('Audition', 'sound', 27),
('iZotope RX', 'sound', 28)
ON CONFLICT (skill_name) DO NOTHING;

-- Production Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Producing', 'production', 1),
('Line Producing', 'production', 2),
('Production Management', 'production', 3),
('Production Coordination', 'production', 4),
('Production Assistant', 'production', 5),
('Location Scouting', 'production', 6),
('Location Management', 'production', 7),
('Casting', 'production', 8),
('Casting Director', 'production', 9),
('Script Supervising', 'production', 10),
('Continuity', 'production', 11),
('Script Supervision', 'production', 12),
('Production Design', 'production', 13),
('Art Direction', 'production', 14),
('Set Design', 'production', 15),
('Set Decoration', 'production', 16),
('Prop Master', 'production', 17),
('Props', 'production', 18),
('Wardrobe', 'production', 19),
('Costume Design', 'production', 20),
('Makeup', 'production', 21),
('Hair', 'production', 22),
('Styling', 'production', 23),
('Catering', 'production', 24),
('Transportation', 'production', 25),
('Equipment', 'production', 26),
('Call Sheet', 'production', 27),
('Scheduling', 'production', 28),
('Budgeting', 'production', 29)
ON CONFLICT (skill_name) DO NOTHING;

-- Directing Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Directing', 'directing', 1),
('Film Directing', 'directing', 2),
('Commercial Directing', 'directing', 3),
('Music Video Directing', 'directing', 4),
('Documentary Directing', 'directing', 5),
('TV Directing', 'directing', 6),
('Assistant Directing', 'directing', 7),
('1st AD', 'directing', 8),
('2nd AD', 'directing', 9),
('3rd AD', 'directing', 10),
('Script Supervising', 'directing', 11),
('Screenwriting', 'directing', 12),
('Writing', 'directing', 13),
('Storytelling', 'directing', 14),
('Narrative', 'directing', 15),
('Visual Storytelling', 'directing', 16),
('Blocking', 'directing', 17),
('Rehearsal', 'directing', 18),
('Performance Direction', 'directing', 19),
('Actor Direction', 'directing', 20),
('Casting Direction', 'directing', 21)
ON CONFLICT (skill_name) DO NOTHING;

-- Photography Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Photography', 'photography', 1),
('Cinematography', 'photography', 2),
('Still Photography', 'photography', 3),
('Product Photography', 'photography', 4),
('Fashion Photography', 'photography', 5),
('Portrait Photography', 'photography', 6),
('Landscape Photography', 'photography', 7),
('Architectural Photography', 'photography', 8),
('Food Photography', 'photography', 9),
('Automotive Photography', 'photography', 10),
('Editorial Photography', 'photography', 11),
('Commercial Photography', 'photography', 12),
('Lighting', 'photography', 13),
('Studio Lighting', 'photography', 14),
('Natural Light', 'photography', 15),
('Flash', 'photography', 16),
('Strobe', 'photography', 17),
('Continuous Light', 'photography', 18),
('Retouching', 'photography', 19),
('Photo Editing', 'photography', 20),
('Photoshop', 'photography', 21),
('Lightroom', 'photography', 22),
('Capture One', 'photography', 23),
('Color Grading', 'photography', 24),
('Composition', 'photography', 25),
('Framing', 'photography', 26),
('Camera Operation', 'photography', 27),
('Lens Selection', 'photography', 28)
ON CONFLICT (skill_name) DO NOTHING;

-- Motion Graphics Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Motion Graphics', 'motion_graphics', 1),
('Animation', 'motion_graphics', 2),
('2D Animation', 'motion_graphics', 3),
('3D Animation', 'motion_graphics', 4),
('Typography', 'motion_graphics', 5),
('Kinetic Typography', 'motion_graphics', 6),
('Title Design', 'motion_graphics', 7),
('Title Sequence', 'motion_graphics', 8),
('Broadcast Design', 'motion_graphics', 9),
('Brand Animation', 'motion_graphics', 10),
('Logo Animation', 'motion_graphics', 11),
('Infographics', 'motion_graphics', 12),
('Data Visualization', 'motion_graphics', 13),
('UI Animation', 'motion_graphics', 14),
('After Effects', 'motion_graphics', 15),
('Cinema 4D', 'motion_graphics', 16),
('Blender', 'motion_graphics', 17),
('Houdini', 'motion_graphics', 18),
('Nuke', 'motion_graphics', 19),
('Design', 'motion_graphics', 20),
('Graphic Design', 'motion_graphics', 21),
('Visual Design', 'motion_graphics', 22),
('Animation Principles', 'motion_graphics', 23),
('Timing', 'motion_graphics', 24),
('Easing', 'motion_graphics', 25),
('Expression', 'motion_graphics', 26),
('Scripting', 'motion_graphics', 27)
ON CONFLICT (skill_name) DO NOTHING;

-- Virtual Production Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Virtual Production', 'virtual_production', 1),
('VP', 'virtual_production', 2),
('Unreal Engine', 'virtual_production', 3),
('UE5', 'virtual_production', 4),
('Real-time Rendering', 'virtual_production', 5),
('LED Volume', 'virtual_production', 6),
('In-camera VFX', 'virtual_production', 7),
('ICVFX', 'virtual_production', 8),
('Motion Capture', 'virtual_production', 9),
('Performance Capture', 'virtual_production', 10),
('Camera Tracking', 'virtual_production', 11),
('Virtual Camera', 'virtual_production', 12),
('Techvis', 'virtual_production', 13),
('Previz', 'virtual_production', 14),
('Postviz', 'virtual_production', 15),
('Tech Art', 'virtual_production', 16),
('Real-time Compositing', 'virtual_production', 17),
('NDisplay', 'virtual_production', 18),
('Notch', 'virtual_production', 19),
('Disguise', 'virtual_production', 20),
('Brompton', 'virtual_production', 21),
('Green Screen', 'virtual_production', 22),
('Chroma Key', 'virtual_production', 23)
ON CONFLICT (skill_name) DO NOTHING;

-- Post Production Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Post-production', 'post_production', 1),
('Editing', 'post_production', 2),
('Color Grading', 'post_production', 3),
('VFX', 'post_production', 4),
('Compositing', 'post_production', 5),
('Sound Design', 'post_production', 6),
('Audio Post', 'post_production', 7),
('Mixing', 'post_production', 8),
('Mastering', 'post_production', 9),
('Delivery', 'post_production', 10),
('DCP', 'post_production', 11),
('HDR', 'post_production', 12),
('Dolby Vision', 'post_production', 13),
('Dolby Atmos', 'post_production', 14),
('Quality Control', 'post_production', 15),
('Online Editing', 'post_production', 16),
('Finishing', 'post_production', 17),
('Conforming', 'post_production', 18),
('Restoration', 'post_production', 19),
('Archive', 'post_production', 20),
('Data Management', 'post_production', 21)
ON CONFLICT (skill_name) DO NOTHING;

-- Software Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Adobe Creative Cloud', 'software', 1),
('Photoshop', 'software', 2),
('Illustrator', 'software', 3),
('After Effects', 'software', 4),
('Premiere Pro', 'software', 5),
('Lightroom', 'software', 6),
('DaVinci Resolve', 'software', 7),
('Final Cut Pro', 'software', 8),
('Avid Media Composer', 'software', 9),
('Maya', 'software', 10),
('3ds Max', 'software', 11),
('Cinema 4D', 'software', 12),
('Blender', 'software', 13),
('Houdini', 'software', 14),
('ZBrush', 'software', 15),
('Substance Painter', 'software', 16),
('Substance Designer', 'software', 17),
('Nuke', 'software', 18),
('Mari', 'software', 19),
('Unreal Engine', 'software', 20),
('Unity', 'software', 21),
('Pro Tools', 'software', 22),
('Logic Pro', 'software', 23),
('Ableton Live', 'software', 24),
('Cubase', 'software', 25),
('Fusion 360', 'software', 26),
('AutoCAD', 'software', 27),
('SketchUp', 'software', 28),
('Rhino', 'software', 29)
ON CONFLICT (skill_name) DO NOTHING;

-- Equipment Skills
INSERT INTO skills (skill_name, category, display_order) VALUES
('Camera Systems', 'equipment', 1),
('RED', 'equipment', 2),
('Arri', 'equipment', 3),
('Sony', 'equipment', 4),
('Canon', 'equipment', 5),
('Blackmagic', 'equipment', 6),
('Lenses', 'equipment', 7),
('Lighting', 'equipment', 8),
('Grip', 'equipment', 9),
('Sound', 'equipment', 10),
('Drones', 'equipment', 11),
('Gimbals', 'equipment', 12),
('Steadicam', 'equipment', 13),
('Cranes', 'equipment', 14),
('Jibs', 'equipment', 15),
('Sliders', 'equipment', 16),
('Dollies', 'equipment', 17),
('Monitors', 'equipment', 18),
('Recorders', 'equipment', 19),
('Wireless', 'equipment', 20),
('Follow Focus', 'equipment', 21),
('Motors', 'equipment', 22),
('Motion Control', 'equipment', 23)
ON CONFLICT (skill_name) DO NOTHING;

-- ============================================
-- POPULATE ROLES
-- ============================================

-- Pre-production Roles
INSERT INTO roles (role_name, category, display_order) VALUES
('Director', 'pre_production', 1),
('Producer', 'pre_production', 2),
('Executive Producer', 'pre_production', 3),
('Writer', 'pre_production', 4),
('Screenwriter', 'pre_production', 5),
('Storyboard Artist', 'pre_production', 6),
('Concept Artist', 'pre_production', 7),
('Art Director', 'pre_production', 8),
('Production Designer', 'pre_production', 9),
('Location Scout', 'pre_production', 10),
('Casting Director', 'pre_production', 11)
ON CONFLICT (role_name) DO NOTHING;

-- Production Roles
INSERT INTO roles (role_name, category, display_order) VALUES
('Director of Photography', 'production', 1),
('Cinematographer', 'production', 2),
('Camera Operator', 'production', 3),
('1st AC', 'production', 4),
('Focus Puller', 'production', 5),
('2nd AC', 'production', 6),
('Drone Pilot', 'production', 7),
('FPV Pilot', 'production', 8),
('Gaffer', 'production', 9),
('Best Boy Electric', 'production', 10),
('Lighting Technician', 'production', 11),
('Grip', 'production', 12),
('Key Grip', 'production', 13),
('Dolly Grip', 'production', 14),
('Sound Recordist', 'production', 15),
('Boom Operator', 'production', 16),
('Production Assistant', 'production', 17),
('Set Designer', 'production', 18),
('Set Decorator', 'production', 19),
('Prop Master', 'production', 20),
('Hair Artist', 'production', 21),
('Makeup Artist', 'production', 22),
('Costume Designer', 'production', 23)
ON CONFLICT (role_name) DO NOTHING;

-- 3D CGI Roles
INSERT INTO roles (role_name, category, display_order) VALUES
('3D Generalist', '3d_cgi', 1),
('Hard Surface Modeler', '3d_cgi', 2),
('Character Artist', '3d_cgi', 3),
('Environment Artist', '3d_cgi', 4),
('Texture Artist', '3d_cgi', 5),
('Material Artist', '3d_cgi', 6),
('Look Development Artist', '3d_cgi', 7),
('Lighting Artist', '3d_cgi', 8),
('Rendering Artist', '3d_cgi', 9),
('Animator', '3d_cgi', 10),
('Character Animator', '3d_cgi', 11),
('Motion Designer', '3d_cgi', 12),
('VFX Artist', '3d_cgi', 13),
('FX Artist', '3d_cgi', 14),
('Houdini Artist', '3d_cgi', 15),
('Cloth Artist', '3d_cgi', 16),
('Groom Artist', '3d_cgi', 17),
('Rigger', '3d_cgi', 18),
('Technical Artist', '3d_cgi', 19),
('Unreal Engine Artist', '3d_cgi', 20),
('Virtual Production Artist', '3d_cgi', 21)
ON CONFLICT (role_name) DO NOTHING;

-- Post Production Roles
INSERT INTO roles (role_name, category, display_order) VALUES
('Video Editor', 'post_production', 1),
('Assistant Editor', 'post_production', 2),
('Colorist', 'post_production', 3),
('Online Editor', 'post_production', 4),
('Compositor', 'post_production', 5),
('Matchmove Artist', 'post_production', 6),
('Rotoscope Artist', 'post_production', 7),
('Paint Artist', 'post_production', 8),
('Cleanup Artist', 'post_production', 9),
('Motion Graphics Designer', 'post_production', 10),
('Title Designer', 'post_production', 11),
('Sound Designer', 'post_production', 12),
('Foley Artist', 'post_production', 13),
('Dialogue Editor', 'post_production', 14),
('Re Recording Mixer', 'post_production', 15),
('Music Composer', 'post_production', 16),
('Music Producer', 'post_production', 17),
('Voice Over Artist', 'post_production', 18)
ON CONFLICT (role_name) DO NOTHING;

-- Photography/Product Roles
INSERT INTO roles (role_name, category, display_order) VALUES
('Product Photographer', 'photography_product', 1),
('Automotive Photographer', 'photography_product', 2),
('Retoucher', 'photography_product', 3),
('CGI Product Artist', 'photography_product', 4)
ON CONFLICT (role_name) DO NOTHING;

-- Marketing/Social Media Roles
INSERT INTO roles (role_name, category, display_order) VALUES
('Creative Director', 'marketing_social_media', 1),
('Content Creator', 'marketing_social_media', 2),
('Social Media Manager', 'marketing_social_media', 3),
('Thumbnail Designer', 'marketing_social_media', 4),
('Graphic Designer', 'marketing_social_media', 5),
('Copywriter', 'marketing_social_media', 6),
('Community Manager', 'marketing_social_media', 7),
('SEO Specialist', 'marketing_social_media', 8)
ON CONFLICT (role_name) DO NOTHING;

-- Technical Roles
INSERT INTO roles (role_name, category, display_order) VALUES
('Pipeline TD', 'technical', 1),
('Render Wrangler', 'technical', 2),
('Render Farm Manager', 'technical', 3),
('Software Developer', 'technical', 4),
('AI Artist', 'technical', 5),
('Prompt Engineer', 'technical', 6)
ON CONFLICT (role_name) DO NOTHING;

-- ============================================
-- POPULATE COUNTRIES (Sample - add more as needed)
-- ============================================

INSERT INTO countries (country_name, country_code, dial_code, flag_emoji, display_order) VALUES
('Afghanistan', 'AF', '+93', '🇦🇫', 1),
('Albania', 'AL', '+355', '🇦🇱', 2),
('Algeria', 'DZ', '+213', '🇩🇿', 3),
('Andorra', 'AD', '+376', '🇦🇩', 4),
('Argentina', 'AR', '+54', '🇦🇷', 5),
('Australia', 'AU', '+61', '🇦🇺', 6),
('Austria', 'AT', '+43', '🇦🇹', 7),
('Belgium', 'BE', '+32', '🇧🇪', 8),
('Brazil', 'BR', '+55', '🇧🇷', 9),
('Canada', 'CA', '+1', '🇨🇦', 10),
('China', 'CN', '+86', '🇨🇳', 11),
('Denmark', 'DK', '+45', '🇩🇰', 12),
('Finland', 'FI', '+358', '🇫🇮', 13),
('France', 'FR', '+33', '🇫🇷', 14),
('Germany', 'DE', '+49', '🇩🇪', 15),
('Greece', 'GR', '+30', '🇬🇷', 16),
('India', 'IN', '+91', '🇮🇳', 17),
('Ireland', 'IE', '+353', '🇮🇪', 18),
('Italy', 'IT', '+39', '🇮🇹', 19),
('Japan', 'JP', '+81', '🇯🇵', 20),
('Mexico', 'MX', '+52', '🇲🇽', 21),
('Netherlands', 'NL', '+31', '🇳🇱', 22),
('New Zealand', 'NZ', '+64', '🇳🇿', 23),
('Norway', 'NO', '+47', '🇳🇴', 24),
('Poland', 'PL', '+48', '🇵🇱', 25),
('Portugal', 'PT', '+351', '🇵🇹', 26),
('South Korea', 'KR', '+82', '🇰🇷', 27),
('Spain', 'ES', '+34', '🇪🇸', 28),
('Sweden', 'SE', '+46', '🇸🇪', 29),
('Switzerland', 'CH', '+41', '🇨🇭', 30),
('United Kingdom', 'GB', '+44', '🇬🇧', 31),
('United States', 'US', '+1', '🇺🇸', 32)
ON CONFLICT (country_name) DO NOTHING;
