// URL Analysis Service
// Analyzes URLs to extract project information and generate project briefs
// Uses Base44 AI with web search capabilities

import { base44 } from '@/api/base44Client';

/**
 * Analyzes a website URL to extract business information and project context
 * @param {string} url - The website URL to analyze
 * @param {string} projectType - The type of project (commercial, music_video, etc.)
 * @returns {Promise<Object>} - Analysis results including business info and project description
 */
export const analyzeWebsiteUrl = async (url, projectType = 'commercial') => {
  try {
    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    // Select prompt template based on project type
    const prompt = getPromptForProjectType(projectType);

    // Call Base44 AI with web search enabled
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt.replace('{{URL}}', normalizedUrl),
      add_context_from_internet: true, // This enables the AI to visit and read the website
      temperature: 0.7,
      max_tokens: 500
    });

    if (!response?.data?.content) {
      throw new Error('Failed to analyze website');
    }

    const analysis = response.data.content;

    // Parse the analysis to extract structured data
    const parsedAnalysis = parseAnalysisResponse(analysis);

    return {
      success: true,
      url: normalizedUrl,
      rawAnalysis: analysis,
      ...parsedAnalysis
    };
  } catch (error) {
    console.error('Error analyzing website URL:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze website',
      url: url
    };
  }
};

/**
 * Generates a comprehensive project brief from analyzed URL data
 * @param {Object} analysisData - The data from URL analysis
 * @param {string} projectType - The type of project
 * @param {string} additionalNotes - Any additional notes from the user
 * @returns {Promise<Object>} - Generated project brief
 */
export const generateProjectBrief = async (analysisData, projectType, additionalNotes = '') => {
  try {
    const prompt = `
You are a professional film production consultant. Based on the following website analysis and project type, create a comprehensive project brief.

WEBSITE ANALYSIS:
${analysisData.rawAnalysis}

PROJECT TYPE: ${projectType}
ADDITIONAL NOTES: ${additionalNotes}

Generate a detailed project brief with the following sections:

1. PROJECT OVERVIEW
   - Project title (creative and professional)
   - Project goal (what the client wants to achieve)
   - Target audience (who will see this content)

2. CREATIVE DIRECTION
   - Visual style (cinematic, documentary, commercial, etc.)
   - Tone and mood (serious, playful, inspirational, etc.)
   - Key visual elements (colors, imagery, branding)

3. PRODUCTION REQUIREMENTS
   - Suggested video length
   - Shooting locations (based on business location or studio)
   - Key scenes or segments needed
   - Talent requirements (actors, presenters, voiceover)

4. TECHNICAL SPECIFICATIONS
   - Camera format suggestions
   - Lighting requirements
   - Audio needs
   - Post-production requirements

5. DELIVERABLES
   - Final video formats
   - Social media versions
   - Additional assets (stills, graphics)

6. TIMELINE
   - Pre-production timeline
   - Production timeline
   - Post-production timeline

7. BUDGET RANGE
   - Estimated budget range (low, medium, high)
   - Budget breakdown by phase

8. KEY MESSAGES
   - Main message to convey
   - Supporting messages
   - Call to action

9. SUCCESS METRICS
   - How success will be measured
   - KPIs to track

10. ADDITIONAL NOTES
    - Any other relevant information

Format the response as structured JSON with these exact keys:
{
  "project_title": "...",
  "project_overview": { "goal": "...", "target_audience": "..." },
  "creative_direction": { "visual_style": "...", "tone": "...", "key_elements": "..." },
  "production_requirements": { "video_length": "...", "locations": "...", "key_scenes": "...", "talent": "..." },
  "technical_specifications": { "camera": "...", "lighting": "...", "audio": "...", "post_production": "..." },
  "deliverables": { "formats": "...", "social_versions": "...", "additional_assets": "..." },
  "timeline": { "pre_production": "...", "production": "...", "post_production": "..." },
  "budget": { "range": "...", "breakdown": "..." },
  "key_messages": { "main_message": "...", "supporting_messages": "...", "call_to_action": "..." },
  "success_metrics": "...",
  "additional_notes": "...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}
`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          project_title: { type: "string" },
          project_overview: {
            type: "object",
            properties: {
              goal: { type: "string" },
              target_audience: { type: "string" }
            }
          },
          creative_direction: {
            type: "object",
            properties: {
              visual_style: { type: "string" },
              tone: { type: "string" },
              key_elements: { type: "string" }
            }
          },
          production_requirements: {
            type: "object",
            properties: {
              video_length: { type: "string" },
              locations: { type: "string" },
              key_scenes: { type: "string" },
              talent: { type: "string" }
            }
          },
          technical_specifications: {
            type: "object",
            properties: {
              camera: { type: "string" },
              lighting: { type: "string" },
              audio: { type: "string" },
              post_production: { type: "string" }
            }
          },
          deliverables: {
            type: "object",
            properties: {
              formats: { type: "string" },
              social_versions: { type: "string" },
              additional_assets: { type: "string" }
            }
          },
          timeline: {
            type: "object",
            properties: {
              pre_production: { type: "string" },
              production: { type: "string" },
              post_production: { type: "string" }
            }
          },
          budget: {
            type: "object",
            properties: {
              range: { type: "string" },
              breakdown: { type: "string" }
            }
          },
          key_messages: {
            type: "object",
            properties: {
              main_message: { type: "string" },
              supporting_messages: { type: "string" },
              call_to_action: { type: "string" }
            }
          },
          success_metrics: { type: "string" },
          additional_notes: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["project_title", "project_overview", "creative_direction", "production_requirements", "technical_specifications", "deliverables", "timeline", "budget", "key_messages", "success_metrics", "tags"]
      },
      temperature: 0.7,
      max_tokens: 2000
    });

    if (!response?.data?.content) {
      throw new Error('Failed to generate project brief');
    }

    let briefData;
    try {
      briefData = typeof response.data.content === 'string' 
        ? JSON.parse(response.data.content) 
        : response.data.content;
    } catch (parseError) {
      console.error('Error parsing brief JSON:', parseError);
      throw new Error('Failed to parse generated brief');
    }

    return {
      success: true,
      brief: briefData,
      originalAnalysis: analysisData
    };
  } catch (error) {
    console.error('Error generating project brief:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate project brief'
    };
  }
};

/**
 * Re-generates project brief with updated context (category or description changes)
 * @param {Object} currentBrief - The current brief data
 * @param {string} newProjectType - The new project type (if changed)
 * @param {string} newDescription - The new description (if changed)
 * @param {Object} originalAnalysis - The original URL analysis data
 * @returns {Promise<Object>} - Re-generated project brief
 */
export const regenerateProjectBrief = async (currentBrief, newProjectType, newDescription, originalAnalysis) => {
  try {
    const prompt = `
You are a professional film production consultant. Re-generate and update the project brief based on the following changes.

ORIGINAL WEBSITE ANALYSIS:
${originalAnalysis.rawAnalysis}

CURRENT PROJECT BRIEF:
${JSON.stringify(currentBrief, null, 2)}

UPDATED PROJECT TYPE: ${newProjectType}
UPDATED DESCRIPTION/NOTES: ${newDescription}

Please re-generate the project brief with the following changes:
1. Update all sections to reflect the new project type (${newProjectType})
2. Incorporate the new description/notes into the project overview and key messages
3. Maintain consistency across all sections (creative direction, production requirements, technical specs, timeline, budget)
4. Ensure the brief is tailored specifically to the ${newProjectType} project type
5. Update tags to be relevant to the new project type

Generate a detailed project brief with the following sections:

1. PROJECT OVERVIEW
   - Project title (creative and professional)
   - Project goal (what the client wants to achieve)
   - Target audience (who will see this content)

2. CREATIVE DIRECTION
   - Visual style (cinematic, documentary, commercial, etc.)
   - Tone and mood (serious, playful, inspirational, etc.)
   - Key visual elements (colors, imagery, branding)

3. PRODUCTION REQUIREMENTS
   - Suggested video length
   - Shooting locations (based on business location or studio)
   - Key scenes or segments needed
   - Talent requirements (actors, presenters, voiceover)

4. TECHNICAL SPECIFICATIONS
   - Camera format suggestions
   - Lighting requirements
   - Audio needs
   - Post-production requirements

5. DELIVERABLES
   - Final video formats
   - Social media versions
   - Additional assets (stills, graphics)

6. TIMELINE
   - Pre-production timeline
   - Production timeline
   - Post-production timeline

7. BUDGET RANGE
   - Estimated budget range (low, medium, high)
   - Budget breakdown by phase

8. KEY MESSAGES
   - Main message to convey
   - Supporting messages
   - Call to action

9. SUCCESS METRICS
   - How success will be measured
   - KPIs to track

10. ADDITIONAL NOTES
    - Any other relevant information

Format the response as structured JSON with these exact keys:
{
  "project_title": "...",
  "project_overview": { "goal": "...", "target_audience": "..." },
  "creative_direction": { "visual_style": "...", "tone": "...", "key_elements": "..." },
  "production_requirements": { "video_length": "...", "locations": "...", "key_scenes": "...", "talent": "..." },
  "technical_specifications": { "camera": "...", "lighting": "...", "audio": "...", "post_production": "..." },
  "deliverables": { "formats": "...", "social_versions": "...", "additional_assets": "..." },
  "timeline": { "pre_production": "...", "production": "...", "post_production": "..." },
  "budget": { "range": "...", "breakdown": "..." },
  "key_messages": { "main_message": "...", "supporting_messages": "...", "call_to_action": "..." },
  "success_metrics": "...",
  "additional_notes": "...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}
`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: "object",
        properties: {
          project_title: { type: "string" },
          project_overview: {
            type: "object",
            properties: {
              goal: { type: "string" },
              target_audience: { type: "string" }
            }
          },
          creative_direction: {
            type: "object",
            properties: {
              visual_style: { type: "string" },
              tone: { type: "string" },
              key_elements: { type: "string" }
            }
          },
          production_requirements: {
            type: "object",
            properties: {
              video_length: { type: "string" },
              locations: { type: "string" },
              key_scenes: { type: "string" },
              talent: { type: "string" }
            }
          },
          technical_specifications: {
            type: "object",
            properties: {
              camera: { type: "string" },
              lighting: { type: "string" },
              audio: { type: "string" },
              post_production: { type: "string" }
            }
          },
          deliverables: {
            type: "object",
            properties: {
              formats: { type: "string" },
              social_versions: { type: "string" },
              additional_assets: { type: "string" }
            }
          },
          timeline: {
            type: "object",
            properties: {
              pre_production: { type: "string" },
              production: { type: "string" },
              post_production: { type: "string" }
            }
          },
          budget: {
            type: "object",
            properties: {
              range: { type: "string" },
              breakdown: { type: "string" }
            }
          },
          key_messages: {
            type: "object",
            properties: {
              main_message: { type: "string" },
              supporting_messages: { type: "string" },
              call_to_action: { type: "string" }
            }
          },
          success_metrics: { type: "string" },
          additional_notes: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["project_title", "project_overview", "creative_direction", "production_requirements", "technical_specifications", "deliverables", "timeline", "budget", "key_messages", "success_metrics", "tags"]
      },
      temperature: 0.7,
      max_tokens: 2000
    });

    if (!response?.data?.content) {
      throw new Error('Failed to re-generate project brief');
    }

    let briefData;
    try {
      briefData = typeof response.data.content === 'string' 
        ? JSON.parse(response.data.content) 
        : response.data.content;
    } catch (parseError) {
      console.error('Error parsing brief JSON:', parseError);
      throw new Error('Failed to parse re-generated brief');
    }

    return {
      success: true,
      brief: briefData,
      originalAnalysis: originalAnalysis
    };
  } catch (error) {
    console.error('Error re-generating project brief:', error);
    return {
      success: false,
      error: error.message || 'Failed to re-generate project brief'
    };
  }
};

/**
 * Saves analyzed project data to localStorage
 * @param {Object} projectData - The analyzed project data to save
 */
export const saveAnalyzedProjectToStorage = (projectData) => {
  try {
    const dataToSave = {
      url: projectData.url,
      analysis: projectData.analysis,
      brief: projectData.brief,
      projectType: projectData.projectType,
      additionalNotes: projectData.additionalNotes,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('studio22_analyzed_project', JSON.stringify(dataToSave));
    return { success: true };
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Loads analyzed project data from localStorage
 * @returns {Object|null} - The saved project data or null if not found
 */
export const loadAnalyzedProjectFromStorage = () => {
  try {
    const savedData = localStorage.getItem('studio22_analyzed_project');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

/**
 * Clears analyzed project data from localStorage
 */
export const clearAnalyzedProjectFromStorage = () => {
  try {
    localStorage.removeItem('studio22_analyzed_project');
    return { success: true };
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets the appropriate prompt template based on project type
 * @param {string} projectType - The type of project
 * @returns {string} - The prompt template
 */
const getPromptForProjectType = (projectType) => {
  const prompts = {
    commercial: `Visit the website at {{URL}} and analyze it for a commercial video project. Extract:
1. Business name and what they do
2. Their target audience
3. Their key products/services
4. Their brand voice and personality
5. Any existing video content or marketing materials
6. Their unique selling proposition
7. Their brand colors and visual style

Write a 3-5 sentence description of what kind of commercial video would work best for this business.`,

    music_video: `Visit the website at {{URL}} and analyze it for a music video project. Extract:
1. Artist/band name and genre
2. Their musical style and aesthetic
3. Their target audience
4. Any existing music videos or visual content
5. Their brand identity and image
6. Key themes in their music
7. Their visual preferences

Write a 3-5 sentence description of what kind of music video would suit this artist.`,

    short_film: `Visit the website at {{URL}} and analyze it for a short film project. Extract:
1. Production company or filmmaker information
2. Their genre preferences
3. Their storytelling style
4. Target audience
5. Any existing film work
6. Their creative vision
7. Technical capabilities

Write a 3-5 sentence description of what kind of short film project this would be.`,

    documentary: `Visit the website at {{URL}} and analyze it for a documentary project. Extract:
1. Subject matter or topic focus
2. Documentary style (observational, expository, etc.)
3. Target audience
4. Any existing documentary work
5. Their storytelling approach
6. Key themes or issues they cover
7. Their production capabilities

Write a 3-5 sentence description of what kind of documentary this would be.`,

    branded_content: `Visit the website at {{URL}} and analyze it for a branded content project. Extract:
1. Brand name and industry
2. Their brand values and mission
3. Target audience
4. Existing content marketing
5. Brand voice and personality
6. Key products/services
7. Visual brand identity

Write a 3-5 sentence description of what kind of branded content would work for this brand.`,

    corporate_video: `Visit the website at {{URL}} and analyze it for a corporate video project. Extract:
1. Company name and industry
2. Company size and structure
3. Target audience (internal/external)
4. Company culture and values
5. Key services or products
6. Existing video content
7. Corporate brand guidelines

Write a 3-5 sentence description of what kind of corporate video this company needs.`,

    event_coverage: `Visit the website at {{URL}} and analyze it for an event coverage project. Extract:
1. Event type and purpose
2. Event scale and audience
3. Key moments to capture
4. Existing event content
5. Brand or organization identity
6. Technical requirements
7. Distribution channels

Write a 3-5 sentence description of what kind of event coverage this would be.`,

    product_demo: `Visit the website at {{URL}} and analyze it for a product demo video project. Extract:
1. Product name and category
2. Key features and benefits
3. Target audience
4. Existing product videos
5. Brand identity
6. Product positioning
7. Technical specifications

Write a 3-5 sentence description of what kind of product demo video would work best.`,

    social_media: `Visit the website at {{URL}} and analyze it for a social media video project. Extract:
1. Brand or creator name
2. Social media platform focus
3. Target audience demographics
4. Content style and tone
5. Existing social media content
6. Brand guidelines
7. Engagement goals

Write a 3-5 sentence description of what kind of social media video content would work.`,

    animation: `Visit the website at {{URL}} and analyze it for an animation project. Extract:
1. Project or brand name
2. Animation style preferences
3. Target audience
4. Existing animated content
5. Brand identity
6. Story or concept
7. Technical requirements

Write a 3-5 sentence description of what kind of animation project this would be.`
  };

  return prompts[projectType] || prompts.commercial;
};

/**
 * Parses the raw analysis response to extract structured data
 * @param {string} analysis - The raw analysis text
 * @returns {Object} - Parsed analysis data
 */
const parseAnalysisResponse = (analysis) => {
  // This is a simple parser. In production, you might want more sophisticated parsing
  // or ask the LLM to return structured JSON directly.
  
  const parsed = {
    businessName: '',
    description: analysis,
    extractedData: {}
  };

  // Try to extract business name (simple heuristic)
  const nameMatch = analysis.match(/(?:business|company|brand|artist|organization)[\s:]+([^\n.]+)/i);
  if (nameMatch) {
    parsed.businessName = nameMatch[1].trim();
  }

  return parsed;
};
