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
          description: projectData?.description || 'AI-generated project description based on your requirements.'
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
          { q: 'What is your experience with similar projects?', options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years'], preferred: 3 },
          { q: 'Are you available for the entire project duration?', options: ['Yes', 'No', 'Maybe'], preferred: 0 }
        ],
        locations: [
          { name: 'Studio Location', type: 'Indoor', desc: 'Professional studio setup', reqs: ['Lighting equipment', 'Sound proofing'] },
          { name: 'Outdoor Location', type: 'Outdoor', desc: 'Natural lighting setup', reqs: ['Weather backup', 'Permits'] }
        ],
        technicalRequirements: {
          camera: '4K Cinema Camera',
          lighting: 'Professional LED lighting kit',
          audio: 'High-quality audio recording equipment'
        },
        productionSchedule: {
          preProduction: '2 weeks',
          production: '1 week',
          postProduction: '3 weeks'
        },
        creativeDirection: {
          style: 'Modern and professional',
          mood: 'Energetic and engaging',
          references: 'High-end commercial aesthetics'
        },
        deliverables: {
          primary: ['4K video files', 'Social media versions', 'Raw footage']
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
