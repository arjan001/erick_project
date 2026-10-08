// Comprehensive film, video & audio production roles database
// Organized by department for easy selection as multi-select tags

export const FILM_ROLES_BY_CATEGORY = {
  'Pre-Production': [
    'Director', 'Producer', 'Executive Producer', 'Writer / Screenwriter',
    'Storyboard Artist', 'Concept Artist', 'Art Director', 'Production Designer',
    'Location Scout', 'Casting Director',
  ],
  'Production': [
    'Director of Photography (Cinematographer)', 'Camera Operator', '1st AC (Focus Puller)',
    '2nd AC', 'Drone Pilot', 'FPV Pilot', 'Gaffer', 'Best Boy Electric',
    'Lighting Technician', 'Grip', 'Key Grip', 'Dolly Grip', 'Sound Recordist',
    'Boom Operator', 'Production Assistant', 'Set Designer', 'Set Decorator',
    'Prop Master', 'Hair Artist', 'Makeup Artist', 'Costume Designer',
  ],
  '3D & CGI': [
    '3D Generalist', 'Hard Surface Modeler', 'Character Artist', 'Environment Artist',
    'Texture Artist', 'Material Artist', 'Look Development Artist', 'Lighting Artist',
    'Rendering Artist', 'Animator', 'Character Animator', 'Motion Designer',
    'VFX Artist', 'FX Artist (Fire, Smoke, Water, Destruction)', 'Houdini Artist',
    'Cloth Artist', 'Groom Artist (Hair/Fur)', 'Rigger', 'Technical Artist',
    'Unreal Engine Artist', 'Virtual Production Artist',
  ],
  'Post-Production': [
    'Video Editor', 'Assistant Editor', 'Colorist', 'Online Editor', 'Compositor',
    'Matchmove Artist', 'Rotoscope Artist', 'Paint Artist', 'Cleanup Artist',
    'Motion Graphics Designer', 'Title Designer', 'Sound Designer', 'Foley Artist',
    'Dialogue Editor', 'Re-Recording Mixer', 'Music Composer', 'Music Producer',
    'Voice Over Artist',
  ],
  'Photography & Product': [
    'Product Photographer', 'Automotive Photographer', 'Retoucher', 'CGI Product Artist',
  ],
  'Marketing & Social Media': [
    'Creative Director', 'Content Creator', 'Social Media Manager', 'Thumbnail Designer',
    'Graphic Designer', 'Copywriter', 'Community Manager', 'SEO Specialist',
  ],
  'Technical': [
    'Pipeline TD', 'Render Wrangler', 'Render Farm Manager', 'Software Developer',
    'AI Artist', 'Prompt Engineer',
  ],
}

// Flat list of all roles for quick lookup / autocomplete
export const ALL_FILM_ROLES = Object.values(FILM_ROLES_BY_CATEGORY).flat()

// Equipment categories
export const EQUIPMENT_CATEGORIES = {
  'Cameras': [
    'Cinema Camera', 'Mirrorless Camera', 'Action Camera', 'Drone', 'FPV Drone', '360 Camera',
  ],
  'Lenses': [
    'Prime Lenses', 'Zoom Lenses', 'Anamorphic Lenses', 'Macro Lenses',
    'Tilt Shift Lenses', 'Vintage Lenses',
  ],
  'Camera Support': [
    'Tripod', 'Monopod', 'Gimbal', 'Slider', 'Dolly', 'Crane / Jib',
    'Suction Mount', 'Car Rig',
  ],
  'Lighting': [
    'COB Lights', 'LED Panels', 'Tube Lights', 'Fresnel Lights', 'Practical Lights',
    'Softboxes', 'Diffusion', 'Reflectors', 'Flags', 'C Stands', 'Light Stands',
  ],
  'Audio': [
    'Shotgun Microphone', 'Lavalier Microphone', 'Wireless Microphone',
    'Audio Recorder', 'Boom Pole',
  ],
  'Grip': [
    'Clamps', 'Sandbags', 'Apple Boxes', 'Magic Arms', 'Monitor Mounts',
  ],
}

// Software categories
export const SOFTWARE_CATEGORIES = {
  '3D': ['Blender', 'Autodesk Maya', 'Cinema 4D', 'Houdini', '3ds Max', 'ZBrush'],
  'Texturing': ['Substance 3D Painter', 'Substance 3D Designer', 'Quixel Mixer', 'Mari'],
  'Rendering': ['Cycles', 'Octane', 'Redshift', 'Arnold', 'V-Ray', 'Unreal Engine'],
  'Compositing': ['After Effects', 'Nuke', 'Fusion'],
  'Editing': ['Premiere Pro', 'DaVinci Resolve', 'Final Cut Pro'],
  'Color Grading': ['DaVinci Resolve', 'Baselight'],
  'Motion Graphics': ['After Effects', 'Cavalry'],
  'Audio': ['Audition', 'Pro Tools', 'Reaper', 'Logic Pro'],
  'Music': ['Suno', 'Udio', 'Ableton Live', 'FL Studio'],
  'AI': ['ChatGPT', 'Midjourney', 'Runway', 'Kling AI', 'Veo', 'ElevenLabs', 'Topaz Video AI'],
}

// Delivery / output types
export const DELIVERY_TYPES = [
  '3D Animation', 'CGI', 'VFX', 'Motion Graphics', 'Product Visualization',
  'Commercial', 'Social Media Video', 'Short Film', 'Feature Film',
  'Virtual Production', 'Interactive Experience', 'VR', 'AR',
]

// File formats
export const FILE_FORMATS = [
  '.blend', '.fbx', '.obj', '.usd', '.usdz', '.abc (Alembic)', '.exr', '.hdr',
  '.png', '.tif', '.psd', '.mp4', '.mov', '.wav',
]