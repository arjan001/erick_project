// Comprehensive list of film and production positions
export const PRODUCTION_POSITIONS = [
  // DIRECTING DEPARTMENT
  { value: "director", label: "Director", department: "directing" },
  { value: "1st_ad", label: "1st Assistant Director", department: "directing" },
  { value: "2nd_ad", label: "2nd Assistant Director", department: "directing" },
  { value: "2nd_unit_director", label: "2nd Unit Director", department: "directing" },
  { value: "3rd_ad", label: "3rd Assistant Director", department: "directing" },
  { value: "dga_trainee", label: "DGA Trainee", department: "directing" },
  { value: "script_supervisor", label: "Script Supervisor", department: "directing" },

  // CAMERA DEPARTMENT
  { value: "dop", label: "Director of Photography (DoP/DP)", department: "camera" },
  { value: "cinematographer", label: "Cinematographer", department: "camera" },
  { value: "camera_operator", label: "Camera Operator", department: "camera" },
  { value: "1st_ac", label: "1st Assistant Camera (Focus Puller)", department: "camera" },
  { value: "2nd_ac", label: "2nd Assistant Camera (Clapper Loader)", department: "camera" },
  { value: "dit", label: "Digital Imaging Technician (DIT)", department: "camera" },
  { value: "steadicam_operator", label: "Steadicam Operator", department: "camera" },
  { value: "drone_operator", label: "Drone Operator / Aerial Cinematographer", department: "camera" },
  { value: "camera_pa", label: "Camera Production Assistant", department: "camera" },
  { value: "b_camera_operator", label: "B Camera Operator", department: "camera" },
  { value: "c_camera_operator", label: "C Camera Operator", department: "camera" },

  // LIGHTING / ELECTRICAL DEPARTMENT
  { value: "gaffer", label: "Gaffer (Chief Lighting Technician)", department: "lighting" },
  { value: "best_boy_electric", label: "Best Boy Electric", department: "lighting" },
  { value: "electrician", label: "Electrician", department: "lighting" },
  { value: "lighting_technician", label: "Lighting Technician", department: "lighting" },
  { value: "board_operator", label: "Board Operator", department: "lighting" },
  { value: "lighting_programmer", label: "Lighting Programmer", department: "lighting" },

  // GRIP DEPARTMENT
  { value: "key_grip", label: "Key Grip", department: "grip" },
  { value: "best_boy_grip", label: "Best Boy Grip", department: "grip" },
  { value: "dolly_grip", label: "Dolly Grip", department: "grip" },
  { value: "grip", label: "Grip", department: "grip" },

  // PRODUCTION DEPARTMENT
  { value: "producer", label: "Producer", department: "production" },
  { value: "executive_producer", label: "Executive Producer", department: "production" },
  { value: "line_producer", label: "Line Producer", department: "production" },
  { value: "associate_producer", label: "Associate Producer", department: "production" },
  { value: "co_producer", label: "Co-Producer", department: "production" },
  { value: "production_manager", label: "Production Manager (PM)", department: "production" },
  { value: "upm", label: "Unit Production Manager (UPM)", department: "production" },
  { value: "production_coordinator", label: "Production Coordinator", department: "production" },
  { value: "production_assistant", label: "Production Assistant (PA)", department: "production" },
  { value: "location_manager", label: "Location Manager", department: "production" },
  { value: "location_scout", label: "Location Scout", department: "production" },
  { value: "location_assistant", label: "Location Assistant", department: "production" },

  // CREATIVE DEPARTMENT
  { value: "creative_director", label: "Creative Director", department: "creative" },
  { value: "associate_creative_director", label: "Associate Creative Director", department: "creative" },
  { value: "copywriter", label: "Copywriter", department: "creative" },
  { value: "art_director", label: "Art Director", department: "creative" },
  { value: "casting_director", label: "Casting Director", department: "creative" },
  { value: "casting_assistant", label: "Casting Assistant", department: "creative" },

  // ART DEPARTMENT
  { value: "production_designer", label: "Production Designer", department: "art" },
  { value: "art_director_dept", label: "Art Director (Art Dept)", department: "art" },
  { value: "set_designer", label: "Set Designer", department: "art" },
  { value: "set_decorator", label: "Set Decorator", department: "art" },
  { value: "lead_man", label: "Lead Man", department: "art" },
  { value: "set_dresser", label: "Set Dresser", department: "art" },
  { value: "prop_master", label: "Prop Master", department: "art" },
  { value: "assistant_prop_master", label: "Assistant Prop Master", department: "art" },
  { value: "prop_buyer", label: "Prop Buyer", department: "art" },
  { value: "armorer", label: "Armorer / Weapons Master", department: "art" },
  { value: "graphic_designer", label: "Graphic Designer", department: "art" },
  { value: "scenic_artist", label: "Scenic Artist", department: "art" },
  { value: "construction_coordinator", label: "Construction Coordinator", department: "art" },

  // COSTUME DEPARTMENT
  { value: "costume_designer", label: "Costume Designer", department: "costume" },
  { value: "assistant_costume_designer", label: "Assistant Costume Designer", department: "costume" },
  { value: "costume_supervisor", label: "Costume Supervisor", department: "costume" },
  { value: "wardrobe_supervisor", label: "Wardrobe Supervisor", department: "costume" },
  { value: "wardrobe_assistant", label: "Wardrobe Assistant", department: "costume" },
  { value: "costume_buyer", label: "Costume Buyer", department: "costume" },

  // MAKEUP & HAIR DEPARTMENT
  { value: "makeup_department_head", label: "Makeup Department Head", department: "makeup" },
  { value: "key_makeup_artist", label: "Key Makeup Artist", department: "makeup" },
  { value: "makeup_artist", label: "Makeup Artist", department: "makeup" },
  { value: "sfx_makeup_artist", label: "SFX Makeup Artist", department: "makeup" },
  { value: "prosthetics_designer", label: "Prosthetics Designer", department: "makeup" },
  { value: "hair_department_head", label: "Hair Department Head", department: "makeup" },
  { value: "key_hairstylist", label: "Key Hairstylist", department: "makeup" },
  { value: "hairstylist", label: "Hairstylist", department: "makeup" },

  // POST-PRODUCTION / EDITING
  { value: "editor", label: "Editor", department: "post" },
  { value: "assistant_editor", label: "Assistant Editor", department: "post" },
  { value: "post_production_supervisor", label: "Post-Production Supervisor", department: "post" },
  { value: "post_production_coordinator", label: "Post-Production Coordinator", department: "post" },
  { value: "colorist", label: "Colorist / Color Grader", department: "post" },
  { value: "online_editor", label: "Online Editor", department: "post" },
  { value: "offline_editor", label: "Offline Editor", department: "post" },
  { value: "conform_artist", label: "Conform Artist", department: "post" },

  // VFX DEPARTMENT
  { value: "vfx_supervisor", label: "VFX Supervisor", department: "vfx" },
  { value: "vfx_producer", label: "VFX Producer", department: "vfx" },
  { value: "vfx_coordinator", label: "VFX Coordinator", department: "vfx" },
  { value: "vfx_artist", label: "VFX Artist", department: "vfx" },
  { value: "compositing_artist", label: "Compositing Artist", department: "vfx" },
  { value: "matte_painter", label: "Matte Painter", department: "vfx" },
  { value: "roto_artist", label: "Roto Artist", department: "vfx" },
  { value: "tracking_artist", label: "Tracking Artist", department: "vfx" },
  { value: "fx_artist", label: "FX Artist", department: "vfx" },
  { value: "on_set_vfx_supervisor", label: "On-Set VFX Supervisor", department: "vfx" },

  // 3D / ANIMATION DEPARTMENT
  { value: "3d_artist", label: "3D Artist", department: "3d" },
  { value: "3d_animator", label: "3D Animator", department: "3d" },
  { value: "3d_modeler", label: "3D Modeler", department: "3d" },
  { value: "texture_artist", label: "Texture Artist", department: "3d" },
  { value: "lighting_artist", label: "Lighting Artist (3D)", department: "3d" },
  { value: "rigging_artist", label: "Rigging Artist", department: "3d" },
  { value: "character_animator", label: "Character Animator", department: "3d" },
  { value: "motion_graphics_designer", label: "Motion Graphics Designer", department: "3d" },
  { value: "motion_designer", label: "Motion Designer", department: "3d" },

  // SOUND DEPARTMENT
  { value: "sound_designer", label: "Sound Designer", department: "sound" },
  { value: "sound_mixer", label: "Production Sound Mixer", department: "sound" },
  { value: "boom_operator", label: "Boom Operator", department: "sound" },
  { value: "sound_assistant", label: "Sound Assistant", department: "sound" },
  { value: "re_recording_mixer", label: "Re-Recording Mixer", department: "sound" },
  { value: "dialogue_editor", label: "Dialogue Editor", department: "sound" },
  { value: "sound_effects_editor", label: "Sound Effects Editor", department: "sound" },
  { value: "foley_artist", label: "Foley Artist", department: "sound" },
  { value: "foley_mixer", label: "Foley Mixer", department: "sound" },
  { value: "adr_mixer", label: "ADR Mixer", department: "sound" },
  { value: "music_editor", label: "Music Editor", department: "sound" },

  // MUSIC DEPARTMENT
  { value: "composer", label: "Composer / Music Composer", department: "music" },
  { value: "music_supervisor", label: "Music Supervisor", department: "music" },
  { value: "music_producer", label: "Music Producer", department: "music" },
  { value: "orchestrator", label: "Orchestrator", department: "music" },
  { value: "music_coordinator", label: "Music Coordinator", department: "music" },

  // STUNT DEPARTMENT
  { value: "stunt_coordinator", label: "Stunt Coordinator", department: "stunts" },
  { value: "stunt_performer", label: "Stunt Performer", department: "stunts" },
  { value: "stunt_double", label: "Stunt Double", department: "stunts" },
  { value: "fight_choreographer", label: "Fight Choreographer", department: "stunts" },

  // TALENT
  { value: "lead_actor", label: "Lead Actor/Actress", department: "talent" },
  { value: "supporting_actor", label: "Supporting Actor/Actress", department: "talent" },
  { value: "voice_actor", label: "Voice Actor", department: "talent" },
  { value: "narrator", label: "Narrator", department: "talent" },
  { value: "extra", label: "Extra / Background Actor", department: "talent" },

  // SPECIALIZED ROLES
  { value: "choreographer", label: "Choreographer", department: "specialized" },
  { value: "intimacy_coordinator", label: "Intimacy Coordinator", department: "specialized" },
  { value: "animal_wrangler", label: "Animal Wrangler", department: "specialized" },
  { value: "storyboard_artist", label: "Storyboard Artist", department: "specialized" },
  { value: "concept_artist", label: "Concept Artist", department: "specialized" },
  { value: "previz_artist", label: "Previz Artist", department: "specialized" },
  { value: "technical_director", label: "Technical Director", department: "specialized" },

  // COMMERCIAL / ADVERTISING
  { value: "brand_strategist", label: "Brand Strategist", department: "commercial" },
  { value: "account_manager", label: "Account Manager", department: "commercial" },
  { value: "account_executive", label: "Account Executive", department: "commercial" },

  // WEB / DIGITAL
  { value: "web_developer", label: "Web Developer", department: "digital" },
  { value: "ux_designer", label: "UX Designer", department: "digital" },
  { value: "ui_designer", label: "UI Designer", department: "digital" },
  { value: "digital_producer", label: "Digital Producer", department: "digital" },

  // OTHER
  { value: "photographer", label: "Photographer", department: "other" },
  { value: "still_photographer", label: "Still Photographer / Unit Photographer", department: "other" },
  { value: "prop_stylist", label: "Prop Stylist", department: "other" },
  { value: "bts_videographer", label: "BTS Videographer", department: "other" },
  { value: "publicist", label: "Publicist", department: "other" },
  { value: "unit_publicist", label: "Unit Publicist", department: "other" },
  { value: "craft_services", label: "Craft Services", department: "other" },
  { value: "catering", label: "Catering", department: "other" },
  { value: "medic", label: "Medic / Set Medic", department: "other" },
  { value: "security", label: "Security", department: "other" },
  { value: "driver", label: "Driver / Transportation", department: "other" },
];

// Departments for filtering
export const DEPARTMENTS = [
  { value: "all", label: "All Departments" },
  { value: "directing", label: "Directing" },
  { value: "camera", label: "Camera" },
  { value: "lighting", label: "Lighting / Electrical" },
  { value: "grip", label: "Grip" },
  { value: "production", label: "Production" },
  { value: "creative", label: "Creative" },
  { value: "art", label: "Art Department" },
  { value: "costume", label: "Costume" },
  { value: "makeup", label: "Makeup & Hair" },
  { value: "post", label: "Post-Production" },
  { value: "vfx", label: "VFX" },
  { value: "3d", label: "3D / Animation" },
  { value: "sound", label: "Sound" },
  { value: "music", label: "Music" },
  { value: "stunts", label: "Stunts" },
  { value: "talent", label: "Talent" },
  { value: "specialized", label: "Specialized" },
  { value: "commercial", label: "Commercial / Advertising" },
  { value: "digital", label: "Web / Digital" },
  { value: "other", label: "Other" },
];