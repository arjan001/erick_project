// AI Service for ChatGPT/OpenAI API integration

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generate production plan using ChatGPT
 * @param {Object} projectData - Project information (url, category, description, etc.)
 * @returns {Promise<Object>} AI-generated production plan data
 */
export async function generateProductionPlan(projectData) {
  const prompt = `You are an expert film production planner. Generate a comprehensive production plan for the following project:

Project Details:
- URL: ${projectData.url || 'Not provided'}
- Category: ${projectData.category || 'Commercial'}
- Description: ${projectData.description || 'Not provided'}
- Budget: ${projectData.budget || 'Not specified'}
- Title: ${projectData.title || 'Untitled Project'}

Please generate a detailed production plan with the following sections:

1. overviewBrief - Must include:
   - title: Project title
   - description: A professional, narrative-style production brief that describes the project's strategic approach, target audience, and brand positioning. This should be written in a formal, professional tone suitable for client presentations. Focus on the WHY and WHO - why this project matters and who it's for.
   - initialIdea: An action-oriented directive that describes WHAT to create, including specific visual techniques, platform distribution strategy, and call-to-action elements. This should be more direct and instructional than the description. Focus on the HOW and WHERE - how to execute and where to distribute.
   - introduction: A concise summary paragraph that bridges the strategic vision with the creative execution
   - category: The project category
   - tags: An array of 10 relevant tags based on the project context

   CRITICAL: The description and initialIdea must be based on the SAME core concept but use COMPLETELY DIFFERENT wording and structure:
   - description: Professional narrative focusing on brand strategy, audience, and positioning (e.g., "Bloom & Vine requires a high-impact commercial video to elevate their brand presence...")
   - initialIdea: Action-oriented directive with specific visual techniques, platforms, and CTAs (e.g., "Create a high-impact commercial for Bloom & Vine showcasing their bespoke artisanal floral arrangements...")
   - introduction: Bridge paragraph that connects strategy to execution (e.g., "Bloom & Vine requires a high-impact commercial video... By leveraging cinematic visuals...")

2. Budget Breakdown - Cost estimates across production phases (Conservative, Standard, Premium packages)
3. Roles & Team - Required personnel and team composition
4. Screening Questions - 8 evaluation questions for talent screening with preferred answers
5. Locations & Places - 4 suggested filming locations with requirements
6. Technical Requirements - Camera, lighting, and audio equipment specifications
7. Production Schedule - Pre-production, production, and post-production timeline
8. Creative Direction - Visual style, cinematography notes, tone & mood, reference style
9. Deliverables - Primary deliverables and modification options

Return the response as a structured JSON object with all sections populated.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert film production planner who creates detailed, professional production plans. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    const productionPlan = JSON.parse(content);
    
    return {
      success: true,
      data: productionPlan,
      rawResponse: content
    };
  } catch (error) {
    console.error('AI generation error:', error);
    
    // If API call fails, return dynamic mock data based on project data
    return {
      success: true,
      data: {
        overviewBrief: {
          title: projectData?.title || 'AI Generated Project',
          description: `${projectData?.title || 'The brand'} requires a professional ${projectData?.category || 'commercial'} video production to elevate their brand presence in the competitive market. The project will showcase their core offerings, targeting the intended audience who value quality and authenticity. By leveraging cinematic techniques and strategic storytelling, we aim to communicate the key value propositions effectively. The final output will serve as a powerful tool for brand engagement and conversion across digital platforms.`,
          initialIdea: `Create a compelling ${projectData?.category || 'commercial'} showcasing the key features and benefits of ${projectData?.title || 'the product'}. Use modern, cinematic visuals with strategic camera movements to highlight important elements. Include clear brand messaging and strong call-to-action throughout. Designed for multi-platform distribution including social media and digital channels to maximize reach and engagement.`,
          introduction: `This ${projectData?.category || 'commercial'} project represents a strategic opportunity to connect with the target audience through compelling visual storytelling. The production will focus on delivering measurable results while maintaining brand consistency and creative excellence.`,
          category: projectData?.category || 'commercial',
          tags: generateDynamicTags(projectData?.category || 'commercial', projectData?.description || '')
        },
        budgetBreakdown: generateDynamicBudget(projectData?.category || 'commercial'),
        rolesTeam: {
          team: generateDynamicRoles(projectData?.category || 'commercial')
        },
        screeningQuestions: generateDynamicQuestions(projectData?.category || 'commercial'),
        locations: generateDynamicLocations(projectData?.category || 'commercial'),
        technicalRequirements: generateDynamicTechnical(projectData?.category || 'commercial'),
        productionSchedule: generateDynamicSchedule(projectData?.category || 'commercial'),
        creativeDirection: generateDynamicCreative(projectData?.category || 'commercial'),
        deliverables: generateDynamicDeliverables(projectData?.category || 'commercial')
      },
      isMock: true
    };
  }
}

// Helper functions to generate dynamic mock data based on project category
function generateDynamicTags(category, description) {
  const baseTags = ['professional', 'quality', 'creative', 'modern'];
  const categoryTags = {
    commercial: ['brand', 'marketing', 'conversion', 'premium'],
    music_video: ['music', 'artist', 'rhythm', 'visual'],
    short_film: ['story', 'narrative', 'cinematic', 'emotional'],
    documentary: ['authentic', 'real', 'informative', 'compelling'],
    branded_content: ['brand', 'story', 'engaging', 'strategic'],
    corporate_video: ['business', 'professional', 'corporate', 'clear'],
    event_coverage: ['live', 'event', 'coverage', 'dynamic'],
    product_demo: ['product', 'demonstration', 'features', 'clear'],
    social_media: ['social', 'engaging', 'viral', 'trending'],
    animation: ['animated', 'creative', 'visual', 'motion']
  };
  return [...baseTags, ...(categoryTags[category] || categoryTags.commercial)].slice(0, 10);
}

function generateDynamicBudget(category) {
  const baseBudgets = [
    { name: 'Conservative', price: '€5,000', desc: 'Essential coverage with efficient setup', pre: '€2,000', prod: '€2,000', post: '€1,000', highlight: false },
    { name: 'Standard', price: '€14,000', desc: 'Professional production with enhanced quality', pre: '€4,000', prod: '€6,000', post: '€4,000', highlight: true },
    { name: 'Premium', price: '€40,000', desc: 'Full-scale production with premium equipment', pre: '€10,000', prod: '€20,000', post: '€10,000', highlight: false }
  ];
  return baseBudgets;
}

function generateDynamicRoles(category) {
  const baseRoles = ['Director', 'Cinematographer', 'Sound Mixer', 'Editor'];
  const categoryRoles = {
    commercial: ['Gaffer', 'Production Assistant'],
    music_video: ['Choreographer', 'Art Director'],
    short_film: ['Script Supervisor', 'Location Manager'],
    documentary: ['Researcher', 'Interviewer'],
    branded_content: ['Brand Strategist', 'Art Director'],
    corporate_video: ['Teleprompter Operator', 'Production Coordinator'],
    event_coverage: ['Live Stream Engineer', 'Multi-camera Director'],
    product_demo: ['Product Specialist', 'Lighting Designer'],
    social_media: ['Social Media Manager', 'Content Creator'],
    animation: ['Animator', 'Motion Designer']
  };
  return [...baseRoles, ...(categoryRoles[category] || categoryRoles.commercial)];
}

function generateDynamicQuestions(category) {
  return [
    { q: 'How do you handle unexpected challenges during production?', options: ['Cancel immediately', 'Adapt and find solutions', 'Ignore the problem', 'Wait for instructions'], preferred: 1 },
    { q: 'What is your approach to maintaining quality standards?', options: ['Cut corners to save time', 'Focus on details and excellence', 'Follow minimum requirements', 'Depends on budget'], preferred: 1 },
    { q: 'How do you collaborate with clients and team members?', options: ['Work independently', 'Communicate clearly and collaborate', 'Follow client demands blindly', 'Avoid feedback'], preferred: 1 }
  ];
}

function generateDynamicLocations(category) {
  const baseLocations = [
    { name: 'Professional Studio Space', type: 'Indoor', typeColor: '#dbeafe', typeText: '#1d4ed8', desc: 'Controlled environment with professional lighting and equipment access.', reqs: ['Studio rental', 'Equipment setup', 'Climate control'] },
    { name: 'Urban Location Setting', type: 'Outdoor', typeColor: '#dcfce7', typeText: '#166534', desc: 'Dynamic urban backdrop that adds authenticity and energy.', reqs: ['Location permit', 'Weather contingency', 'Power access'] }
  ];
  return baseLocations;
}

function generateDynamicTechnical(category) {
  return {
    camera: [['Camera Type', 'Professional Cinema Camera'], ['Resolution', '4K UHD'], ['Frame Rate', '24/25/30/60fps'], ['Lenses', 'Prime and zoom lens kit'], ['Camera Support', 'Professional tripod and stabilization']],
    lighting: ['Professional lighting kit', 'Soft boxes and diffusers', 'LED panels for color control', 'Reflectors and bounce cards'],
    audio: ['Professional shotgun microphone', 'Wireless lavalier system', 'Field recorder', 'Wind protection equipment']
  };
}

function generateDynamicSchedule(category) {
  return [
    { name: 'Pre-Production', days: '7-14 days', items: ['Concept development', 'Location scouting', 'Crew assembly', 'Equipment planning', 'Permits and logistics'] },
    { name: 'Production', days: '1-5 days', items: ['Setup and preparation', 'Principal photography', 'Coverage capture', 'Daily reviews', 'Equipment management'] },
    { name: 'Post-Production', days: '14-21 days', items: ['Footage organization', 'Editorial assembly', 'Client review and revisions', 'Color grading', 'Final delivery preparation'] }
  ];
}

function generateDynamicCreative(category) {
  return {
    moodTags: ['Professional', 'Engaging', 'Modern', 'Dynamic', 'Compelling'],
    visualStyle: 'Contemporary aesthetic with clean composition and professional lighting.',
    cinematographyNotes: 'Strategic camera movements that enhance storytelling. Professional lighting techniques for optimal image quality.',
    toneMood: 'Professional yet approachable, balancing sophistication with accessibility.',
    referenceStyle: 'Modern commercial aesthetic with cinematic quality.'
  };
}

function generateDynamicDeliverables(category) {
  return {
    primary: ['4K master files', 'Social media optimized versions', 'Project files'],
    formats: ['16:9 (standard)', '9:16 (vertical)', '1:1 (square)'],
    additional: ['Color grades', 'Audio mixes', 'Motion graphics'],
    timeline: '2-4 weeks from final approval'
  };
}

/**
 * Regenerate a specific section of the production plan
 * @param {string} section - Section name to regenerate
 * @param {Object} currentData - Current production plan data
 * @param {string} feedback - User feedback for regeneration
 * @returns {Promise<Object>} Updated section data
 */
export async function regenerateSection(section, currentData, feedback = '') {
  let prompt = '';

  if (section === 'budgetBreakdown') {
    prompt = `Regenerate the budget breakdown section based on the following user request: "${feedback}"

Current budget data:
${JSON.stringify(currentData.budgetBreakdown || [], null, 2)}

The user may be requesting:
- A specific package (Conservative, Standard, Premium)
- Custom budget amount
- Specific crew size (solo, small team, full crew)
- Number of shooting days
- Focus on specific production phase (pre-production, production, post-production)
- Cost reduction or increase

Please regenerate the budget breakdown as an array of 3 packages (Conservative, Standard, Premium) with:
- name: Package name
- price: Total price
- desc: Description of what's included
- pre: Pre-production cost
- prod: Production cost  
- post: Post-production cost
- highlight: true for the recommended package

Adjust the packages based on the user's request while keeping realistic cost breakdowns across production phases.`;
  } else if (section === 'rolesTeam') {
    prompt = `Regenerate the roles and team section based on the following user request: "${feedback}"

Current team data:
${JSON.stringify(currentData.rolesTeam || {}, null, 2)}

The user may be requesting:
- Specific number of team members (add/remove crew)
- Specific roles (e.g., "two extra boom arm mic operators", "solo director only")
- Package change (Conservative/Standard/Premium with different team sizes)
- Pricing adjustments based on team composition

Please regenerate the team data as an object with:
- team: Array of required roles
- Adjust the team composition based on the user's request
- Consider pricing implications of team size changes`;
  } else if (section === 'screeningQuestions') {
    prompt = `Regenerate the screening questions section based on the following user request: "${feedback}"

Current questions data:
${JSON.stringify(currentData.screeningQuestions || [], null, 2)}

The user may be requesting:
- Questions about specific skills (equipment, creativity, availability)
- Questions tailored to production type (commercial, music video, etc.)
- Technical skill assessments
- More specific or simpler questions
- Different focus areas

Please regenerate the screening questions as an array of questions with:
- q: The question text
- options: Array of 4 possible answers
- preferred: Index of the preferred answer (0-3)

Generate questions that are relevant to the production requirements and user's feedback.`;
  } else if (section === 'locations') {
    prompt = `Regenerate the locations section based on the following user request: "${feedback}"

Current locations data:
${JSON.stringify(currentData.locations || [], null, 2)}

The user may be requesting:
- Specific location types (warehouse, beach, rooftop, studio, cafe)
- Geographic preferences (Brooklyn, California, downtown, etc.)
- Indoor/outdoor preferences
- Backup locations
- Natural vs urban settings

Please regenerate the locations as an array of location suggestions with:
- name: Location name
- type: Indoor/Outdoor/Hybrid/Studio
- typeColor: Color code for type badge
- typeText: Color code for type text
- desc: Description of the location
- reqs: Array of requirements for filming at this location

Generate locations that match the user's preferences and production brief.`;
  } else if (section === 'technicalRequirements') {
    prompt = `Regenerate the technical requirements section based on the following user request: "${feedback}"

Current technical requirements data:
${JSON.stringify(currentData.technicalRequirements || {}, null, 2)}

The user may be requesting:
- Specific camera equipment (ARRI, Sony, RED, etc.)
- Lighting adjustments (LED, budget-friendly, cinema lights)
- Audio equipment changes (boom mics, wireless systems, recorders)
- Equipment additions (drone, gimbal, cinema lenses)
- Equipment reductions (remove gimbal, simplify setup)
- Budget-friendly alternatives

Please regenerate the technical requirements as an object with:
- camera: Array of [label, value] pairs for camera specs
- lighting: Array of lighting equipment items
- audio: Array of audio equipment items

Adjust equipment based on the user's request and project category while maintaining professional standards.`;
  } else if (section === 'productionSchedule') {
    prompt = `Regenerate the production schedule section based on the following user request: "${feedback}"

Current production schedule data:
${JSON.stringify(currentData.productionSchedule || [], null, 2)}

The user may be requesting:
- Timeline changes (Quick 1-2 days, Standard 3-5 days, Extended 2-4 weeks)
- Sequence adjustments (move tasks, swap days, reorder phases)
- Phase duration changes (reduce pre-production, extend post-production)
- Specific task additions or removals
- Milestone additions (client reviews, casting days)

Please regenerate the production schedule as an array of phases with:
- name: Phase name (Pre-Production, Production, Post-Production)
- days: Duration for the phase
- items: Array of tasks in sequence

Adjust the schedule based on the user's timeline preference and sequence modifications while maintaining logical production workflow.`;
  } else if (section === 'creativeDirection') {
    prompt = `Regenerate the creative direction section based on the following user request: "${feedback}"

Current creative direction data:
${JSON.stringify(currentData.creativeDirection || {}, null, 2)}

The user may be requesting:
- Different visual style (energetic, minimalist, cinematic, documentary, etc.)
- Different mood (aspirational, authentic, playful, dramatic, etc.)
- Different reference style (Nike, Apple, cinematic, documentary, etc.)
- Different cinematography approach (handheld, static, drone, etc.)
- Image regeneration with different aesthetic

Please regenerate the creative direction as an object with:
- moodTags: Array of 5 mood tags
- visualStyle: Description of visual style
- cinematographyNotes: Cinematography approach and techniques
- toneMood: Overall tone and mood description
- referenceStyle: Reference style description
- generatedImage: Base64 encoded image URL (placeholder for AI image generation)

Adjust the creative direction based on the user's request while maintaining consistency with the production brief.`;
  } else if (section === 'deliverables') {
    prompt = `Regenerate the deliverables section based on the following user request: "${feedback}"

Current deliverables data:
${JSON.stringify(currentData.deliverables || {}, null, 2)}

The user may be requesting:
- Different video formats (vertical, square, cinematic, etc.)
- Additional deliverables (behind-the-scenes, audio versions, subtitles, etc.)
- Format removals (remove raw footage, remove specific formats)
- Resolution changes (4K, 8K, HD, etc.)
- Timeline adjustments (faster delivery, extended timeline)

Please regenerate the deliverables as an object with:
- primary: Array of primary deliverables
- formats: Array of video format specifications
- additional: Array of additional items
- timeline: Delivery timeline description

Adjust the deliverables based on the user's request and project category while maintaining professional standards.`;
  } else if (section === 'overviewBrief') {
    prompt = `Regenerate the overviewBrief section based on the following feedback: "${feedback}"

Current data for this section:
${JSON.stringify(currentData.overviewBrief || {}, null, 2)}

Please provide an improved version of this section as a JSON object with:
- title: Project title
- description: Professional narrative focusing on brand strategy, audience, and positioning
- initialIdea: Action-oriented directive with specific visual techniques, platforms, and CTAs
- category: The project category
- tags: Array of 10 relevant tags

Ensure description and initialIdea are based on the same concept but use different wording.`;
  } else {
    prompt = `Regenerate the "${section}" section of this production plan based on the following feedback: "${feedback}"

Current data for this section:
${JSON.stringify(currentData[section] || {}, null, 2)}

Please provide an improved version of this section as a JSON object.`;
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert film production planner. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const updatedSection = JSON.parse(content);
    
    return {
      success: true,
      data: updatedSection,
      section
    };
  } catch (error) {
    console.error('Section regeneration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
