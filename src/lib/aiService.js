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

Please generate a detailed production plan with the following sections:
1. Overview & Brief - Project overview and creative brief
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
    
    // If API call fails, return mock data for testing
    return {
      success: true,
      data: {
        overviewBrief: {
          title: projectData?.title || 'AI Generated Project',
          description: projectData?.description || 'AI-generated project description based on your requirements.',
          initialIdea: projectData?.description || `Create a high-impact commercial for ${projectData?.title || 'your brand'} showcasing their bespoke artisanal floral arrangements. Target affluent lifestyle enthusiasts and event planners with key selling points like premium, sustainably sourced blooms and custom design artistry.`,
          category: projectData?.category || 'commercial',
          tags: ['bespoke', 'floristry', 'artisanal', 'sustainable', 'luxury', 'floraldesign', 'eventplanning', 'cinematic', 'modern', 'premium']
        },
        budgetBreakdown: [
          { name: 'Conservative', price: '€5,000', desc: 'Essential coverage with single-camera setup', pre: '€2,000', prod: '€2,000', post: '€1,000', highlight: false },
          { name: 'Standard', price: '€14,000', desc: 'Professional multi-camera production', pre: '€4,000', prod: '€6,000', post: '€4,000', highlight: true },
          { name: 'Premium', price: '€40,000', desc: 'Full-scale production with cinema equipment', pre: '€10,000', prod: '€20,000', post: '€10,000', highlight: false }
        ],
        rolesTeam: {
          team: ['Director', 'Cinematographer', 'Gaffer', 'Sound Mixer', 'Editor', 'Colorist', 'Production Assistant']
        },
        screeningQuestions: [
          { q: 'If a key element for a shoot is suddenly unavailable on the day, how do you handle it?', options: ['Cancel the shoot immediately', 'Assess the situation and brainstorm alternatives', 'Tell the client it is not my problem', 'Wait for the client to decide'], preferred: 1 },
          { q: "What is your process for creating a video that feels 'exclusive' and 'high-end'?", options: ['Use bright colours and fast transitions', 'Focus on slow, intentional details', "Copy a popular video style", 'Make the video as long as possible'], preferred: 1 },
          { q: 'How do you handle receiving feedback that you disagree with?', options: ['Tell the client their idea is wrong', 'Ignore the feedback', 'Listen and offer collaborative solution', 'Immediately quit the project'], preferred: 2 },
        ],
        locations: [
          { name: 'Minimalist Art Gallery', type: 'Indoor', typeColor: '#dbeafe', typeText: '#1d4ed8', desc: 'Premium, gallery-like canvas that makes colors pop.', reqs: ['Controlled climate', 'Lighting rig permission', 'Furniture removal'] },
          { name: 'Botanical Conservatory', type: 'Hybrid', typeColor: '#fef3c7', typeText: '#92400e', desc: 'Lush, organic backdrop reinforcing sustainability.', reqs: ['Temperature regulation', 'Reflector panels', 'Filming permit'] },
          { name: 'Luxury Penthouse Terrace', type: 'Outdoor', typeColor: '#dcfce7', typeText: '#166534', desc: 'High-end urban terrace suggesting exclusive lifestyle.', reqs: ['Weather backup', 'Portable power', 'Equipment access'] },
        ],
        technicalRequirements: {
          camera: [['Camera Type', 'Sony FX6 Cinema Line'], ['Resolution', '4K DCI 10-bit 4:2:2 XAVC-I'], ['Frame Rate', '24fps for cinematic, 120fps for high-speed'], ['Lenses', 'Sony FE 35mm f/1.4 GM, 50mm f/1.2 GM, 90mm f/2.8 Macro G OSS'], ['Camera Support', 'DJI RS3 Pro Gimbal and Sachtler Ace XL Tripod']],
          lighting: ['Aputure LS 600d Pro for high-output key light', 'Aputure Light Dome II for soft portrait lighting', '2x Aputure Amaran 200x Bi-Color for rim lighting', 'Aputure MC RGBWW for accent colors', '4x4 Scrim Jim Cine Kit for diffusion'],
          audio: ['Sennheiser MKH 416 shotgun microphone', 'Rode Wireless PRO lavalier system', 'Zoom F6 MultiTrack Field Recorder', 'Rycote Softie Windshield']
        },
        productionSchedule: [
          { name: 'Pre-Production', days: '14 days', items: ['Finalize creative concept', 'Scout locations', 'Secure talent', 'Confirm equipment rentals', 'Draft shot list', 'Production meetings', 'Location permits', 'Contract crew', 'Coordinate logistics'] },
          { name: 'Production', days: '3 days', items: ['Day 1: Studio scenes', 'Day 2: Location shoot', 'Day 3: Detail shots', 'Daily call/wrap times', 'Crew breaks', 'Contingency plans', 'Footage review', 'BTS documentation', 'Equipment check-in'] },
          { name: 'Post-Production', days: '21 days', items: ['Transfer and backup footage', 'Assemble rough cut', 'Client review', 'Editorial notes', 'Color grading', 'Motion graphics', 'Sound design', 'Music licensing', 'Final review', 'Export files', 'Archive project'] },
        ],
        creativeDirection: {
          moodTags: ['Energetic', 'Aspirational', 'Modern', 'Dynamic', 'Confident'],
          visualStyle: 'Clean, modern aesthetic with high contrast. Focus on product detail with shallow depth of field.',
          cinematographyNotes: 'Strategic camera movements that serve the story. Motivated lighting that creates depth and dimension.',
          toneMood: 'Aspirational yet authentic, avoiding overt luxury clichés.',
          referenceStyle: 'Nike commercial aesthetic. Apple product launch feel. Quick cuts with impact.'
        },
        deliverables: {
          primary: ['4K video files', 'Social media versions', 'Raw footage'],
          timeline: '3-4 weeks from final approval'
        }
      },
      isMock: true
    };
  }
}

/**
 * Regenerate a specific section of the production plan
 * @param {string} section - Section name to regenerate
 * @param {Object} currentData - Current production plan data
 * @param {string} feedback - User feedback for regeneration
 * @returns {Promise<Object>} Updated section data
 */
export async function regenerateSection(section, currentData, feedback = '') {
  const prompt = `Regenerate the "${section}" section of this production plan based on the following feedback: "${feedback}"

Current data for this section:
${JSON.stringify(currentData[section] || {}, null, 2)}

Please provide an improved version of this section as a JSON object.`;

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
