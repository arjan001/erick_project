// Comprehensive skills & production-role database for creative professionals
export const SKILLS_DATABASE = [
  // Camera & Cinematography
  'ARRI Alexa', 'RED Camera', 'Sony FX Series', 'Canon Cinema', 'Blackmagic',
  'Steadicam Operator', 'Gimbal Operation', 'Crane Operation', 'Dolly Grip',
  'Focus Pulling', '1st AC', '2nd AC', 'DIT', 'Camera Assistant',
  'Director of Photography', 'Camera Operator', 'Drone Pilot', 'FPV Pilot',

  // Lighting
  'Gaffer', 'Best Boy Electric', 'Lighting Technician', 'LED Lighting',
  'HMI Lighting', 'Tungsten Lighting', 'Practical Lighting', 'Natural Light',

  // Grip
  'Key Grip', 'Best Boy Grip', 'Rigging', 'Dolly Operator', 'Grip',

  // Pre-Production
  'Executive Producer', 'Storyboard Artist', 'Concept Artist', 'Location Scout', 'Casting Director',

  // Directing
  'Commercial Director', 'Music Video Director', 'Documentary Director',
  'Film Director', 'Assistant Director', '1st AD', '2nd AD',

  // Production
  'Line Producer', 'Production Manager', 'Production Coordinator',
  'Location Manager', 'Production Assistant', 'Sound Recordist',
  'Set Designer', 'Set Decorator',

  // Post-Production
  'Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'Avid Media Composer',
  'Color Grading', 'Color Correction', 'Colorist', 'Offline Editor', 'Online Editor', 'Video Editor',
  'Assistant Editor', 'Conform', 'Finishing', 'Compositor', 'Matchmove Artist',
  'Rotoscope Artist', 'Paint Artist', 'Cleanup Artist',

  // VFX & 3D
  'After Effects', 'Nuke', 'Flame', 'Cinema 4D', 'Blender', 'Maya', '3ds Max',
  'Houdini', 'Houdini Artist', 'Unreal Engine', 'Unreal Engine Artist', 'Unity', 'Motion Tracking', 'Rotoscoping',
  'Compositing', 'Particle Effects', 'Fluid Simulation', 'Cloth Simulation', 'Cloth Artist',
  'Character Animation', 'Animator', 'Character Animator', 'Rigging', 'Rigger', 'Modeling', 'Texturing', 'Lighting Artist',
  'Rendering', 'Rendering Artist', 'Matte Painting', '3D Generalist', 'Hard Surface Modeler',
  'Character Artist', 'Environment Artist', 'Texture Artist', 'Material Artist',
  'Look Development Artist', 'VFX Artist', 'FX Artist', 'Groom Artist', 'Technical Artist',
  'Virtual Production Artist',

  // Motion Graphics
  'Motion Designer', 'Motion Graphics Designer', '2D Animation', 'Title Design', 'Title Designer', 'Lower Thirds',
  'Broadcast Design', 'Explainer Videos',

  // Sound
  'Sound Designer', 'Sound Mixer', 'Boom Operator', 'Sound Editor',
  'Foley Artist', 'ADR', 'Dialogue Editing', 'Dialogue Editor', 'Re-Recording Mixer', 'Sound Effects', 'Ambience',
  'Pro Tools', 'Logic Pro', 'Ableton Live',

  // Music
  'Composer', 'Music Composer', 'Music Producer', 'Music Supervisor', 'Scoring',
  'Orchestration', 'Music Editing', 'Voice Over Artist',

  // Art Department
  'Art Director', 'Production Designer', 'Set Designer', 'Set Decorator',
  'Props Master', 'Prop Maker', 'Scenic Artist', 'Construction Coordinator',

  // Costume & Makeup
  'Costume Designer', 'Wardrobe Stylist', 'Makeup Artist', 'Hair Stylist',
  'Special Effects Makeup', 'Prosthetics',

  // Special Skills
  'Underwater Cinematography', 'Time-Lapse', 'Hyperlapse',
  'Product Photography', 'Food Styling', 'Automotive', 'Aerial Photography',

  // Photography & Product
  'Product Photographer', 'Automotive Photographer', 'Retoucher', 'CGI Product Artist',

  // Marketing & Social Media
  'Creative Director', 'Content Creator', 'Social Media Manager', 'Thumbnail Designer',
  'Graphic Designer', 'Community Manager', 'SEO Specialist',

  // Scripting
  'Scriptwriter', 'Screenwriter', 'Copywriter', 'Script Supervisor',

  // Technical
  'Pipeline TD', 'Render Wrangler', 'Render Farm Manager', 'Software Developer', 'AI Artist', 'Prompt Engineer',

  // Other
  'Casting Director', 'Talent Coordinator', 'Storyboard Artist',
  'Concept Artist', 'Previsualization', 'Stunt Coordinator', 'Choreographer'
]

// Categorized for better organization (used for grouped browsing / suggestions)
export const SKILLS_BY_CATEGORY = {
  'Pre-Production': [
    'Executive Producer', 'Storyboard Artist', 'Concept Artist', 'Art Director',
    'Production Designer', 'Location Scout', 'Casting Director', 'Scriptwriter', 'Screenwriter'
  ],
  'Camera & Cinematography': [
    'Director of Photography', 'Camera Operator', 'ARRI Alexa', 'RED Camera', 'Sony FX Series',
    'Canon Cinema', 'Blackmagic', 'Steadicam Operator', 'Gimbal Operation', 'Crane Operation',
    'Dolly Grip', 'Focus Pulling', '1st AC', '2nd AC', 'DIT', 'Camera Assistant',
    'Drone Pilot', 'FPV Pilot'
  ],
  'Lighting': [
    'Gaffer', 'Best Boy Electric', 'Lighting Technician', 'LED Lighting',
    'HMI Lighting', 'Tungsten Lighting', 'Practical Lighting', 'Natural Light'
  ],
  'Grip': [
    'Key Grip', 'Best Boy Grip', 'Grip', 'Rigging', 'Dolly Operator'
  ],
  'Production': [
    'Line Producer', 'Production Manager', 'Production Coordinator', 'Sound Recordist',
    'Location Manager', 'Production Assistant', 'Set Designer', 'Set Decorator'
  ],
  'Directing': [
    'Commercial Director', 'Music Video Director', 'Documentary Director',
    'Film Director', 'Assistant Director', '1st AD', '2nd AD'
  ],
  '3D & CGI': [
    '3D Generalist', 'Hard Surface Modeler', 'Character Artist', 'Environment Artist',
    'Texture Artist', 'Material Artist', 'Look Development Artist', 'Lighting Artist',
    'Rendering Artist', 'Animator', 'Character Animator', 'Motion Designer', 'VFX Artist',
    'FX Artist', 'Houdini Artist', 'Cloth Artist', 'Groom Artist', 'Rigger', 'Technical Artist',
    'Unreal Engine Artist', 'Virtual Production Artist', 'Blender', 'Maya', 'Cinema 4D', '3ds Max', 'Houdini'
  ],
  'Post-Production': [
    'Video Editor', 'Assistant Editor', 'Colorist', 'Online Editor', 'Offline Editor',
    'Compositor', 'Matchmove Artist', 'Rotoscope Artist', 'Paint Artist', 'Cleanup Artist',
    'Motion Graphics Designer', 'Title Designer', 'Premiere Pro', 'Final Cut Pro',
    'DaVinci Resolve', 'Avid Media Composer', 'Conform', 'Finishing'
  ],
  'Sound & Music': [
    'Sound Designer', 'Sound Mixer', 'Boom Operator', 'Sound Editor', 'Foley Artist',
    'ADR', 'Dialogue Editor', 'Re-Recording Mixer', 'Music Composer', 'Music Producer',
    'Music Supervisor', 'Scoring', 'Voice Over Artist', 'Pro Tools', 'Logic Pro', 'Ableton Live'
  ],
  'Photography & Product': [
    'Product Photographer', 'Automotive Photographer', 'Retoucher', 'CGI Product Artist',
    'Aerial Photography', 'Product Photography'
  ],
  'Marketing & Social Media': [
    'Creative Director', 'Content Creator', 'Social Media Manager', 'Thumbnail Designer',
    'Graphic Designer', 'Copywriter', 'Community Manager', 'SEO Specialist'
  ],
  'Art Department': [
    'Art Director', 'Production Designer', 'Set Designer', 'Set Decorator',
    'Props Master', 'Prop Maker', 'Scenic Artist', 'Construction Coordinator'
  ],
  'Costume & Makeup': [
    'Costume Designer', 'Wardrobe Stylist', 'Makeup Artist', 'Hair Stylist',
    'Special Effects Makeup', 'Prosthetics'
  ],
  'Technical': [
    'Pipeline TD', 'Render Wrangler', 'Render Farm Manager', 'Software Developer',
    'AI Artist', 'Prompt Engineer'
  ],
  'Other': [
    'Talent Coordinator', 'Previsualization', 'Stunt Coordinator', 'Choreographer'
  ]
}