import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { projectType, description, company } = await req.json();

    if (!projectType || !description) {
      return Response.json({ error: 'projectType and description required' }, { status: 400 });
    }

    const moodPrompts = {
      commercial: 'minimalist corporate aesthetic, clean geometric shapes, modern lighting, corporate blue or black tones, product showcase style',
      short_film: 'cinematic mood lighting, intimate character study, soft shadows, narrative tension, indie film aesthetic',
      film: 'epic cinematic landscape, rich color grading, depth of field, production scale, dramatic lighting',
      music_video: 'abstract motion, vibrant color palette, dynamic composition, artistic movement, concert or performance energy',
      documentary: 'documentary photography aesthetic, real world texture, authentic lighting, truth and presence, observational mood'
    };

    const mood = moodPrompts[projectType] || moodPrompts.commercial;

    const imagePrompt = `Generate a subtle, abstract cinematic mood image for a ${projectType} production project.

Project: "${company}"
Description: ${description.substring(0, 200)}

Style:
- ${mood}
- No people or faces
- No literal storytelling or narrative scenes
- Abstract and suggestive, not explicit
- Professional cinema color palette
- Editorial and refined
- Horizontal composition (16:9 aspect ratio)
- Atmospheric and moody

Generate ONE image that evokes the creative mood and intent of this project without being on-the-nose.`;

    const imageResponse = await base44.integrations.Core.GenerateImage({
      prompt: imagePrompt
    });

    return Response.json({
      success: true,
      image_url: imageResponse.url,
      project_type: projectType
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Failed to generate image',
      fallback_gradient: true
    }, { status: 500 });
  }
});