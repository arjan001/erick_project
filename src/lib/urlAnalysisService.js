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
    // Normalize URL - handle plain domains like proton.me
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    console.log('Analyzing URL:', normalizedUrl);

    // Select prompt template based on project type
    const prompt = getPromptForProjectType(projectType);

    // Call Base44 AI with web search enabled
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt.replace('{{URL}}', normalizedUrl),
      add_context_from_internet: true, // This enables the AI to visit and read the website
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('Base44 response:', response);

    // Check multiple possible response structures
    let analysis = null;
    if (response?.data?.content) {
      analysis = response.data.content;
    } else if (response?.data?.text) {
      analysis = response.data.text;
    } else if (response?.content) {
      analysis = response.content;
    } else if (typeof response === 'string') {
      analysis = response;
    } else if (response?.message) {
      analysis = response.message;
    }

    if (!analysis) {
      console.error('No content in response:', response);
      throw new Error('Failed to analyze website - no content returned');
    }

    // Remove markdown formatting
    let cleanAnalysis = analysis
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '') // Remove italic
      .replace(/`/g, '') // Remove code
      .replace(/\n\n+/g, '\n\n') // Fix multiple newlines
      .trim();

    // Parse the analysis to extract structured data
    const parsedAnalysis = parseAnalysisResponse(cleanAnalysis);

    return {
      success: true,
      url: normalizedUrl,
      rawAnalysis: cleanAnalysis,
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
 * @param {Array} attachments - Array of uploaded file objects {name, type, url}
 * @returns {Promise<Object>} - Generated project brief
 */
export const generateProjectBrief = async (analysisData, projectType, additionalNotes = '', attachments = []) => {
  try {
    let attachmentAnalysis = '';
    
    // Analyze attachments if provided
    if (attachments && attachments.length > 0) {
      const imageAttachments = attachments.filter(att => 
        att.type?.startsWith('image/') || 
        att.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      );
      
      const pdfAttachments = attachments.filter(att => 
        att.type === 'application/pdf' || 
        att.name?.match(/\.pdf$/i)
      );
      
      const videoAttachments = attachments.filter(att => 
        att.type?.startsWith('video/') || 
        att.name?.match(/\.(mp4|mov|avi|hvec)$/i)
      );
      
      const audioAttachments = attachments.filter(att => 
        att.type?.startsWith('audio/') || 
        att.name?.match(/\.(mp3|wav)$/i)
      );
      
      if (imageAttachments.length > 0) {
        attachmentAnalysis += '\n\nIMAGE ATTACHMENTS ANALYSIS:\n';
        for (const img of imageAttachments) {
          try {
            const imgAnalysis = await base44.integrations.Core.InvokeLLM({
              prompt: `Analyze this image for a ${projectType} project. Extract: visual style, color palette, mood, key elements, any text visible, and how it could inform the production.`,
              file_urls: [img.url],
              max_tokens: 300
            });
            if (imgAnalysis?.data?.content) {
              attachmentAnalysis += `\n- ${img.name}: ${imgAnalysis.data.content}\n`;
            }
          } catch (err) {
            console.error('Error analyzing image:', err);
          }
        }
      }
      
      if (pdfAttachments.length > 0) {
        attachmentAnalysis += '\n\nPDF ATTACHMENTS:\n';
        for (const pdf of pdfAttachments) {
          attachmentAnalysis += `- ${pdf.name} (PDF document attached for reference)\n`;
        }
      }
      
      if (videoAttachments.length > 0) {
        attachmentAnalysis += '\n\nVIDEO ATTACHMENTS:\n';
        for (const vid of videoAttachments) {
          attachmentAnalysis += `- ${vid.name} (Video reference attached)\n`;
        }
      }
      
      if (audioAttachments.length > 0) {
        attachmentAnalysis += '\n\nAUDIO ATTACHMENTS:\n';
        for (const aud of audioAttachments) {
          attachmentAnalysis += `- ${aud.name} (Audio reference attached)\n`;
        }
      }
    }

    const prompt = `
You are a professional film production consultant. Based on the following website analysis, attachments, and project type, create a comprehensive project brief.

WEBSITE ANALYSIS:
${analysisData.rawAnalysis}

${attachmentAnalysis}

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
    localStorage.setItem('ericrabar_analyzed_project', JSON.stringify(dataToSave));
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
    const savedData = localStorage.getItem('ericrabar_analyzed_project');
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
    localStorage.removeItem('ericrabar_analyzed_project');
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
    commercial: `Visit {{URL}} and write a concise 2-3 sentence film production brief for a commercial video. Include: what to showcase (key selling points), target audience, visual style, brand integration (colors/logo), distribution platform, and call-to-action.

Example: "Create a high-impact commercial for [Brand] showcasing [key features]. Target [audience] with selling points like [features]. Use [visual style] featuring [specific visuals]. Integrate [brand elements] throughout, ending with CTA: '[action]'. Designed for [distribution platforms]."`,

    music_video: `Visit {{URL}} and write a concise 2-3 sentence film production brief for a music video. Include: what to showcase (song themes/artist personality), target audience, visual style, artist brand integration, distribution platform, and key visual elements.

Example: "Create a [visual style] music video for [Artist] showcasing [song themes]. Target [audience] with [key elements]. Use [visual approach] featuring [specific scenes]. Integrate [brand elements] throughout. Designed for [distribution platforms]."`,

    short_film: `Visit {{URL}} and write a concise 2-3 sentence film production brief for a short film. Include: what to explore (themes/story concept), target audience, visual style, key narrative elements, distribution platform, and production approach.

Example: "Create a [visual style] short film exploring [themes]. Target [audience] with [story approach]. Use [cinematic style] featuring [key scenes]. Designed for [distribution platforms]."`,

    documentary: `Visit {{URL}} and write a concise 2-3 sentence film production brief for a documentary. Include: what to cover (subject/themes), target audience, documentary style, key narrative elements, distribution platform, and production approach.

Example: "Create a [documentary style] documentary covering [subject]. Target [audience] with [storytelling approach]. Use [visual style] featuring [key elements]. Designed for [distribution platforms]."`,

    branded_content: `Visit {{URL}} and write a concise 2-3 sentence film production brief for branded content. Include: what to showcase (brand story/values), target audience, visual style, brand integration (logo/colors/messaging), distribution platform, and content format.

Example: "Create [visual style] branded content for [Brand] showcasing [brand story]. Target [audience] with [key messages]. Use [visual approach] featuring [specific content]. Integrate [brand elements] throughout. Designed for [distribution platforms]."`,

    corporate_video: `Visit {{URL}} and write a concise 2-3 sentence film production brief for a corporate video. Include: what to communicate (company story/values), target audience, visual style, brand integration, distribution platform, and key scenes.

Example: "Create a [visual style] corporate video for [Company] showcasing [company story]. Target [audience] with [key messages]. Use [visual approach] featuring [key scenes]. Integrate [brand elements] throughout. Designed for [distribution platforms]."`,

    event_coverage: `Visit {{URL}} and write a concise 2-3 sentence film production brief for event coverage. Include: what to capture (key moments/atmosphere), target audience, visual style, key moments to highlight, distribution platform, and production approach.

Example: "Create [visual style] event coverage for [Event] capturing [key moments]. Target [audience] with [coverage approach]. Use [visual style] featuring [specific content]. Designed for [distribution platforms]."`,

    product_demo: `Visit {{URL}} and write a concise 2-3 sentence film production brief for a product demo. Include: what to showcase (features/benefits), target audience, visual style, product integration, distribution platform, and demo format.

Example: "Create a [visual style] product demo for [Product] showcasing [key features]. Target [audience] with [selling points]. Use [visual approach] featuring [specific demonstrations]. Integrate [brand elements] throughout. Designed for [distribution platforms]."`,

    social_media: `Visit {{URL}} and write a concise 2-3 sentence film production brief for social media content. Include: what to achieve (engagement/awareness), target audience and platform, visual style, content format, distribution platform, and engagement strategy.

Example: "Create [visual style] social media content for [Brand/Creator] showcasing [content theme]. Target [audience] on [platform] with [engagement approach]. Use [visual style] featuring [key elements]. Designed for [distribution platforms]."`,

    animation: `Visit {{URL}} and write a concise 2-3 sentence film production brief for an animation. Include: what to convey (story/brand message), target audience, animation style, key visual elements and characters, distribution platform, and production approach.

Example: "Create a [animation style] animation for [Brand/Project] showcasing [story/message]. Target [audience] with [key elements]. Use [visual style] featuring [specific content]. Designed for [distribution platforms]."`
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
