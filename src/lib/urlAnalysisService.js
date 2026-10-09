// URL Analysis Service
// Analyzes URLs to extract project information and generate project briefs
// TODO: Replace with actual AI service (Supabase Edge Functions or OpenAI)

/**
 * Analyzes a website URL to extract business information and project context
 * @param {string} url - The website URL to analyze
 * @param {string} projectType - The type of project (commercial, music_video, etc.)
 * @returns {Promise<Object>} - Analysis results including business info and project description
 */
export const analyzeWebsiteUrl = async (url, projectType = 'commercial') => {
  try {
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    const analysis = generateMockAnalysis(normalizedUrl, projectType)

    if (!analysis) {
      throw new Error('Failed to analyze website')
    }

    return {
      success: true,
      url: normalizedUrl,
      analysis: analysis,
      rawAnalysis: JSON.stringify(analysis, null, 2)
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to analyze website'
    }
  }
}

/**
 * Generates a project brief based on website analysis and attachments
 * @param {Object} analysisData - The website analysis data
 * @param {string} projectType - The type of project
 * @param {string} additionalNotes - Additional notes from the user
 * @param {Array} attachments - File attachments
 * @returns {Promise<Object>} - Generated project brief
 */
export const generateProjectBrief = async (analysisData, projectType, additionalNotes = '', attachments = []) => {
  try {
    const response = generateMockProjectBrief(projectType, additionalNotes)

    return {
      success: true,
      brief: response,
      originalAnalysis: analysisData
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to generate project brief'
    }
  }
}

/**
 * Re-generates project brief with updated context
 */
export const regenerateProjectBrief = async (currentBrief, newProjectType, newDescription, originalAnalysis) => {
  try {
    const response = generateMockProjectBrief(newProjectType, newDescription)
    return {
      success: true,
      brief: response,
      originalAnalysis: originalAnalysis
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to re-generate project brief'
    }
  }
}

/**
 * Saves analyzed project data to localStorage
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
    }
    localStorage.setItem('smartgigs_analyzed_project', JSON.stringify(dataToSave))
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Loads analyzed project data from localStorage
 */
export const loadAnalyzedProjectFromStorage = () => {
  try {
    const data = localStorage.getItem('smartgigs_analyzed_project')
    if (!data) return null
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

/**
 * Clears analyzed project data from localStorage
 */
export const clearAnalyzedProjectFromStorage = () => {
  try {
    localStorage.removeItem('smartgigs_analyzed_project')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Helper functions

function getPromptForProjectType(projectType) {
  const prompts = {
    commercial: 'Analyze this website for a commercial video production project. Extract business information, brand identity, target audience, and key messaging.',
    music_video: 'Analyze this website for a music video production. Extract artist information, music style, visual aesthetic, and target audience.',
    documentary: 'Analyze this website for a documentary project. Extract subject matter, story elements, interview subjects, and thematic focus.',
    corporate: 'Analyze this website for a corporate video project. Extract company information, corporate identity, key products/services, and business objectives.',
    narrative: 'Analyze this website for a narrative film project. Extract story elements, genre, character information, and thematic focus.'
  }
  return prompts[projectType] || prompts.commercial
}

function generateMockAnalysis(url, projectType) {
  return {
    businessName: 'SmartGigs Kenya',
    industry: 'Creative Production',
    website: url,
    businessType: 'Production Company',
    targetAudience: 'Film Industry Professionals',
    keyOfferings: 'Video Production, Talent Casting, Crew Services',
    brandIdentity: 'Professional, Creative, Kenya-focused',
    primaryColors: '#C9A962, #0A0A0A',
    tone: 'Professional and Creative'
  }
}

function generateMockProjectBrief(projectType, notes) {
  return {
    project_title: `SmartGigs ${projectType} Production`,
    project_overview: {
      goal: 'Create a professional video production showcasing SmartGigs Kenya services',
      target_audience: 'Kenya film industry professionals and creative talent'
    },
    creative_direction: {
      visual_style: 'Cinematic and professional',
      tone: 'Inspiring and trustworthy',
      key_elements: 'Kenya landscapes, creative professionals, production quality'
    },
    production_requirements: {
      video_length: '2-3 minutes',
      locations: 'Nairobi studio and on-location shoots',
      key_scenes: 'Talent showcase, crew operations, project highlights',
      talent: 'Local actors and crew members'
    },
    technical_specifications: {
      camera: '4K digital cinema cameras',
      lighting: 'Professional LED lighting packages',
      audio: 'Wireless microphone systems',
      post_production: 'Color grading, sound mixing, editing'
    },
    deliverables: {
      formats: '4K, 1080p, social media optimized',
      social_versions: 'Instagram, TikTok, YouTube',
      additional_assets: 'Behind-the-scenes footage, promotional images'
    },
    timeline: {
      pre_production: '2 weeks',
      production: '1 week',
      post_production: '2 weeks'
    },
    budget: {
      range: 'Medium',
      breakdown: 'Pre-production: 20%, Production: 50%, Post-production: 30%'
    },
    key_messages: {
      main_message: 'SmartGigs Kenya connects creative talent with opportunities',
      supporting_messages: 'Professional production quality, local talent focus, industry expertise',
      call_to_action: 'Join SmartGigs Kenya today'
    },
    success_metrics: 'Talent sign-ups, project completions, client satisfaction',
    additional_notes: notes || '',
    tags: ['video', 'production', 'kenya', 'creative', 'film', 'talent']
  }
}
