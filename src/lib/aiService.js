// AI Service for ChatGPT/OpenAI API integration

import { base44 } from '@/api/base44Client';

/**
 * Generate production plan using ChatGPT via Base44
 * @param {Object} projectData - Project information (url, category, description, etc.)
 * @returns {Promise<Object>} AI-generated production plan data
 */
export async function generateProductionPlan(projectData) {
  console.log('generateProductionPlan called with:', projectData);
  
  const prompt = `You are an expert film production planner for Studio22, a professional video production company that creates high-quality commercial videos, music videos, short films, documentaries, branded content, corporate videos, event coverage, product demos, social media content, and animation projects.

Studio22's Analysis Process:
- We analyze client websites and brand materials to understand their visual identity, target audience, and brand positioning
- We extract key information about the client's products/services, brand voice, and marketing goals
- We use this analysis to create tailored production plans that align with the client's brand and objectives

Project Details:
- URL: ${projectData.url || 'Not provided'}
- Category: ${projectData.category || 'Commercial'}
- Description: ${projectData.description || 'Not provided'}
- Budget: ${projectData.budget || 'Not specified'}
- Title: ${projectData.title || 'Untitled Project'}

IMPORTANT INSTRUCTIONS:
1. Generate REAL, SPECIFIC content based on the project details provided - DO NOT use generic placeholder text
2. If the description contains specific information about the client's brand, products, or goals, incorporate that into ALL sections
3. Make the budget breakdown realistic for the project category and scope
4. Suggest locations that would actually work for this specific project type
5. Recommend equipment appropriate for the production category
6. Create a timeline that makes sense for the project's complexity
7. Develop creative direction that aligns with the brand's visual identity (if known from the description)
8. Suggest deliverables that match modern distribution needs for this project type

Please generate a detailed production plan with the following sections:

1. overviewBrief - Must include:
   - title: Project title (use the actual project title or create a relevant one based on the description)
   - description: A professional, narrative-style production brief that describes the project's strategic approach, target audience, and brand positioning. This should be written in a formal, professional tone suitable for client presentations. Focus on the WHY and WHO - why this project matters and who it's for. MUST be specific to the project, not generic.
   - initialIdea: An action-oriented directive that describes WHAT to create, including specific visual techniques, platform distribution strategy, and call-to-action elements. This should be more direct and instructional than the description. Focus on the HOW and WHERE - how to execute and where to distribute. MUST be specific to the project.
   - introduction: A concise summary paragraph that bridges the strategic vision with the creative execution
   - category: The project category
   - tags: An array of 10 relevant tags based on the project context (NOT generic tags like "professional", "quality" - use specific tags relevant to the actual project)

   CRITICAL: The description and initialIdea must be based on the SAME core concept but use COMPLETELY DIFFERENT wording and structure:
   - description: Professional narrative focusing on brand strategy, audience, and positioning (e.g., "Bloom & Vine requires a high-impact commercial video to elevate their brand presence...")
   - initialIdea: Action-oriented directive with specific visual techniques, platforms, and CTAs (e.g., "Create a high-impact commercial for Bloom & Vine showcasing their bespoke artisanal floral arrangements...")
   - introduction: Bridge paragraph that connects strategy to execution

2. budgetBreakdown - Cost estimates across production phases with 3 packages (Conservative, Standard, Premium). Each package must have:
   - name: Package name (e.g., "Conservative Package", "Standard Package", "Premium Package")
   - price: Total price in EUR (e.g., "€5,000")
   - desc: Description of what's included in this package
   - pre: Pre-production cost (e.g., "€2,000")
   - preDetails: Detailed description of pre-production activities (e.g., "Full pre-production planning, detailed script development, location scouting, casting coordination, production schedule")
   - prod: Production cost (e.g., "€8,000")
   - prodDetails: Detailed description of production activities (e.g., "2-day shoot with 5-person crew (Director, DP, Gaffer, Sound, PA), cinema camera package, professional lighting, audio recording")
   - post: Post-production cost (e.g., "€4,000")
   - postDetails: Detailed description of post-production activities (e.g., "Professional editing, color grading, sound design, motion graphics, multi-format delivery")
   - team: List of team members with counts (e.g., "Director (1), Cinematographer (1), Gaffer (1), Sound Mixer (1), Production Assistant (1), Editor (1), Colorist (1)")
   - highlight: true for the recommended package
   - reasoning: Overall budget reasoning explaining cost drivers

3. roles - Required personnel and team composition with:
   - packages: Array of 3 team packages (Conservative, Standard, Premium) with name, price, teamSize, and roles array
   - roles: Array of all required roles for this project type

4. questions - 8 evaluation questions for talent screening with:
   - questions: Array of question objects, each with q (question text), options (4 possible answers), preferred (index of preferred answer), and weight (importance 1-5)

5. locations - 4 suggested filming locations with:
   - locations: Array of location objects with name, type (Indoor/Outdoor), typeColor, typeText, description, and requirements array

6. technical - Camera, lighting, and audio equipment specifications with:
   - camera: Array of [label, value] pairs
   - lighting: Array of lighting equipment items
   - audio: Array of audio equipment items

7. schedule - Pre-production, production, and post-production timeline with:
   - phases: Array of phase objects with name, duration, description, and tasks array

8. creativeDirection - Visual style, cinematography notes, tone & mood, reference style with:
   - visualStyle: Description of visual style
   - cinematography: Cinematography approach and techniques
   - moodTags: Array of 5-7 mood tags
   - referenceStyle: Reference style description

9. deliverables - Primary deliverables and modification options with:
   - deliverables: Array of primary deliverables
   - formats: Array of video format specifications

Return the response as a structured JSON object with all sections populated with SPECIFIC, REAL content based on the project details provided. DO NOT use generic placeholder text.`;

  try {
    console.log('Calling Base44 AI with ChatGPT...');
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          overviewBrief: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              initialIdea: { type: "string" },
              introduction: { type: "string" },
              category: { type: "string" },
              tags: { type: "array", items: { type: "string" } }
            }
          },
          budgetBreakdown: {
            type: "object",
            properties: {
              packages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    price: { type: "string" },
                    desc: { type: "string" },
                    pre: { type: "string" },
                    preDetails: { type: "string" },
                    prod: { type: "string" },
                    prodDetails: { type: "string" },
                    post: { type: "string" },
                    postDetails: { type: "string" },
                    team: { type: "string" },
                    highlight: { type: "boolean" }
                  }
                }
              },
              reasoning: { type: "string" }
            }
          },
          roles: {
            type: "object",
            properties: {
              packages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    price: { type: "string" },
                    teamSize: { type: "string" },
                    roles: { type: "array", items: { type: "string" } }
                  }
                }
              },
              team: { type: "array", items: { type: "string" } }
            }
          },
          questions: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    q: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    preferred: { type: "number" },
                    weight: { type: "number" }
                  }
                }
              }
            }
          },
          locations: {
            type: "object",
            properties: {
              locations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                    typeColor: { type: "string" },
                    typeText: { type: "string" },
                    desc: { type: "string" },
                    reqs: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          },
          technicalRequirements: {
            type: "object",
            properties: {
              camera: { type: "array", items: { type: "array", items: { type: "string" } } },
              lighting: { type: "array", items: { type: "string" } },
              audio: { type: "array", items: { type: "string" } }
            }
          },
          productionSchedule: {
            type: "object",
            properties: {
              phases: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    days: { type: "string" },
                    items: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          },
          creativeDirection: {
            type: "object",
            properties: {
              visualStyle: { type: "string" },
              cinematographyNotes: { type: "string" },
              moodTags: { type: "array", items: { type: "string" } },
              toneMood: { type: "string" },
              referenceStyle: { type: "string" }
            }
          },
          deliverables: {
            type: "object",
            properties: {
              primary: { type: "array", items: { type: "string" } },
              timeline: { type: "string" },
              formats: { type: "array", items: { type: "string" } },
              additional: { type: "array", items: { type: "string" } }
            }
          }
        },
        required: ["overviewBrief", "budgetBreakdown", "roles", "questions", "locations", "technicalRequirements", "productionSchedule", "creativeDirection", "deliverables"]
      },
      temperature: 0.7,
      max_tokens: 4000
    });

    console.log('Base44 response received');

    if (!response?.data?.content) {
      throw new Error('Failed to generate production plan - no content in response');
    }

    let productionPlan;
    try {
      productionPlan = typeof response.data.content === 'string' 
        ? JSON.parse(response.data.content) 
        : response.data.content;
    } catch (parseError) {
      console.error('Error parsing production plan JSON:', parseError);
      throw new Error('Failed to parse generated production plan');
    }
    
    console.log('Parsed production plan successfully');
    console.log('Generated tags:', productionPlan.overviewBrief?.tags);
    
    return {
      success: true,
      data: productionPlan,
      rawResponse: response.data.content
    };
  } catch (error) {
    console.error('AI generation error:', error);
    console.log('Falling back to mock data generation...');
    
    // If API call fails, return dynamic mock data based on project data
    const mockData = {
      overviewBrief: {
        title: projectData?.title || 'AI Generated Project',
        description: projectData?.description 
          ? `${projectData.description} This professional ${projectData?.category || 'commercial'} video production will elevate brand presence in the competitive market. The project will showcase core offerings, targeting the intended audience who value quality and authenticity. By leveraging cinematic techniques and strategic storytelling, we aim to communicate the key value propositions effectively.`
          : `${projectData?.title || 'The brand'} requires a professional ${projectData?.category || 'commercial'} video production to elevate their brand presence in the competitive market. The project will showcase their core offerings, targeting the intended audience who value quality and authenticity. By leveraging cinematic techniques and strategic storytelling, we aim to communicate the key value propositions effectively. The final output will serve as a powerful tool for brand engagement and conversion across digital platforms.`,
        initialIdea: projectData?.description
          ? `Based on the analyzed content: ${projectData.description.substring(0, 200)}... Create a compelling ${projectData?.category || 'commercial'} showcasing key features. Use modern, cinematic visuals with strategic camera movements to highlight important elements. Include clear brand messaging and strong call-to-action throughout. Designed for multi-platform distribution including social media and digital channels to maximize reach and engagement.`
          : `Create a compelling ${projectData?.category || 'commercial'} showcasing the key features and benefits of ${projectData?.title || 'the product'}. Use modern, cinematic visuals with strategic camera movements to highlight important elements. Include clear brand messaging and strong call-to-action throughout. Designed for multi-platform distribution including social media and digital channels to maximize reach and engagement.`,
        introduction: `This ${projectData?.category || 'commercial'} project represents a strategic opportunity to connect with the target audience through compelling visual storytelling. The production will focus on delivering measurable results while maintaining brand consistency and creative excellence.`,
        category: projectData?.category || 'commercial',
        tags: generateDynamicTags(projectData?.category || 'commercial', projectData?.description || '')
      },
      budgetBreakdown: {
        packages: generateDynamicBudget(projectData?.category || 'commercial'),
        reasoning: 'Costs are driven primarily by crew size, the quality of rental cinema equipment, the number of shooting days required, and the depth of post-production polish needed for the project.'
      },
      roles: {
        packages: [
          { name: 'Conservative', price: '€5,000', teamSize: '3-4', roles: generateDynamicRoles(projectData?.category || 'commercial').slice(0, 4) },
          { name: 'Standard', price: '€14,000', teamSize: '5-7', roles: generateDynamicRoles(projectData?.category || 'commercial') },
          { name: 'Premium', price: '€40,000', teamSize: '8-12', roles: [...generateDynamicRoles(projectData?.category || 'commercial'), 'Art Director', 'Colorist', 'Sound Designer'] }
        ],
        team: generateDynamicRoles(projectData?.category || 'commercial')
      },
      questions: {
        questions: generateDynamicQuestions(projectData?.category || 'commercial')
      },
      locations: {
        locations: generateDynamicLocations(projectData?.category || 'commercial')
      },
      technicalRequirements: {
        camera: generateDynamicTechnical(projectData?.category || 'commercial').camera,
        lighting: generateDynamicTechnical(projectData?.category || 'commercial').lighting,
        audio: generateDynamicTechnical(projectData?.category || 'commercial').audio
      },
      productionSchedule: {
        phases: generateDynamicSchedule(projectData?.category || 'commercial')
      },
      creativeDirection: {
        visualStyle: generateDynamicCreative(projectData?.category || 'commercial').visualStyle,
        cinematographyNotes: generateDynamicCreative(projectData?.category || 'commercial').cinematographyNotes,
        moodTags: generateDynamicCreative(projectData?.category || 'commercial').moodTags,
        toneMood: generateDynamicCreative(projectData?.category || 'commercial').toneMood,
        referenceStyle: generateDynamicCreative(projectData?.category || 'commercial').referenceStyle
      },
      deliverables: {
        primary: generateDynamicDeliverables(projectData?.category || 'commercial').primary,
        timeline: generateDynamicDeliverables(projectData?.category || 'commercial').timeline,
        formats: generateDynamicDeliverables(projectData?.category || 'commercial').formats,
        additional: generateDynamicDeliverables(projectData?.category || 'commercial').additional
      }
    };
    
    console.log('Generated mock data:', mockData);
    
    return {
      success: true,
      data: mockData,
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
    { 
      name: 'Conservative Package', 
      price: '€5,000', 
      desc: 'Includes a one-man band videographer, basic lighting kit, one day of shooting at the studio, and essential editing.',
      pre: '€500',
      preDetails: 'Project planning, basic script outline, location scouting, shot list preparation',
      prod: '€3,500',
      prodDetails: '1-day shoot with solo videographer, basic lighting kit, essential audio equipment',
      post: '€1,000',
      postDetails: 'Basic editing, color correction, audio mixing, final export in standard formats',
      team: 'Director/Videographer (1), Editor (1)',
      highlight: false 
    },
    { 
      name: 'Standard Package', 
      price: '€14,000', 
      desc: 'Includes a 5-person professional crew, rental cinema cameras, two days of filming, professional lighting, and color grading.',
      pre: '€2,000',
      preDetails: 'Full pre-production planning, detailed script development, location scouting, casting coordination, production schedule',
      prod: '€8,000',
      prodDetails: '2-day shoot with 5-person crew (Director, DP, Gaffer, Sound, PA), cinema camera package, professional lighting, audio recording',
      post: '€4,000',
      postDetails: 'Professional editing, color grading, sound design, motion graphics, multi-format delivery',
      team: 'Director (1), Cinematographer (1), Gaffer (1), Sound Mixer (1), Production Assistant (1), Editor (1), Colorist (1)',
      highlight: true 
    },
    { 
      name: 'Premium Package', 
      price: '€40,000', 
      desc: 'Includes a large crew, high-end cinema package, specialized motion control equipment, four days of production, and post-production with advanced VFX and sound design.',
      pre: '€6,000',
      preDetails: 'Comprehensive pre-production with creative development, detailed storyboards, full casting, location scouting with permits, production design, equipment testing',
      prod: '€25,000',
      prodDetails: '4-day shoot with 8-12 person crew, ARRI/RED cinema package, motion control, drone operations, specialized lighting, full audio team, art department',
      post: '€9,000',
      postDetails: 'Advanced post-production with VFX, 3D animation, professional color grading, Dolby Atmos sound design, multiple deliverable formats',
      team: 'Director (1), Cinematographer (1), 1st AC (1), Gaffer (1), Key Grip (1), Sound Mixer (1), Boom Operator (1), Production Designer (1), Art Director (1), VFX Artist (1), Colorist (1), Sound Designer (1), Editor (1)',
      highlight: false 
    }
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
- preDetails: Detailed description of pre-production activities (e.g., "Full pre-production planning, detailed script development, location scouting, casting coordination, production schedule")
- prod: Production cost  
- prodDetails: Detailed description of production activities (e.g., "2-day shoot with 5-person crew (Director, DP, Gaffer, Sound, PA), cinema camera package, professional lighting, audio recording")
- post: Post-production cost
- postDetails: Detailed description of post-production activities (e.g., "Professional editing, color grading, sound design, motion graphics, multi-format delivery")
- team: List of team members with counts (e.g., "Director (1), Cinematographer (1), Gaffer (1), Sound Mixer (1), Production Assistant (1), Editor (1), Colorist (1)")
- highlight: true for the recommended package

Adjust the packages based on the user's request while keeping realistic cost breakdowns across production phases.`;
  } else if (section === 'roles') {
    prompt = `Regenerate the roles and team section based on the following user request: "${feedback}"

Current team data:
${JSON.stringify(currentData.roles || {}, null, 2)}

The user may be requesting:
- Specific number of team members (add/remove crew)
- Specific roles (e.g., "two extra boom arm mic operators", "solo director only")
- Package change (Conservative/Standard/Premium with different team sizes)
- Pricing adjustments based on team composition

Please regenerate the team data as an object with:
- packages: Array of 3 team packages with name, price, teamSize, and roles array
- team: Array of all required roles
- Adjust the team composition based on the user's request
- Consider pricing implications of team size changes`;
  } else if (section === 'questions') {
    prompt = `Regenerate the screening questions section based on the following user request: "${feedback}"

Current questions data:
${JSON.stringify(currentData.questions || {}, null, 2)}

The user may be requesting:
- Questions about specific skills (equipment, creativity, availability)
- Questions tailored to production type (commercial, music video, etc.)
- Technical skill assessments
- More specific or simpler questions
- Different focus areas

Please regenerate the screening questions as an object with:
- questions: Array of question objects with q (question text), options (4 possible answers), preferred (index of preferred answer), and weight (importance 1-5)

Generate questions that are relevant to the production requirements and user's feedback.`;
  } else if (section === 'locations') {
    prompt = `Regenerate the locations section based on the following user request: "${feedback}"

Current locations data:
${JSON.stringify(currentData.locations || {}, null, 2)}

The user may be requesting:
- Specific location types (warehouse, beach, rooftop, studio, cafe)
- Geographic preferences (Brooklyn, California, downtown, etc.)
- Indoor/outdoor preferences
- Backup locations
- Natural vs urban settings

Please regenerate the locations as an object with:
- locations: Array of location suggestions with name, type (Indoor/Outdoor/Hybrid/Studio), typeColor, typeText, description, and requirements array

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
${JSON.stringify(currentData.productionSchedule || {}, null, 2)}

The user may be requesting:
- Timeline changes (Quick 1-2 days, Standard 3-5 days, Extended 2-4 weeks)
- Sequence adjustments (move tasks, swap days, reorder phases)
- Phase duration changes (reduce pre-production, extend post-production)
- Specific task additions or removals
- Milestone additions (client reviews, casting days)

Please regenerate the production schedule as an object with:
- phases: Array of phase objects with name, duration, description, and tasks array

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

Please regenerate the creative direction as an object with:
- moodTags: Array of 5 mood tags
- visualStyle: Description of visual style
- cinematographyNotes: Cinematography approach and techniques
- toneMood: Overall tone and mood description
- referenceStyle: Reference style description

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
    console.log(`Regenerating section "${section}" via Base44 AI...`);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    });

    console.log('Base44 regeneration response received');

    if (!response?.data?.content) {
      throw new Error('Failed to regenerate section - no content in response');
    }

    let updatedSection;
    try {
      updatedSection = typeof response.data.content === 'string' 
        ? JSON.parse(response.data.content) 
        : response.data.content;
    } catch (parseError) {
      console.error('Error parsing regenerated section JSON:', parseError);
      throw new Error('Failed to parse regenerated section');
    }
    
    console.log('Regenerated section successfully');
    
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
