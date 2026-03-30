import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const projects = await base44.asServiceRole.entities.Project.list();
    const results = [];

    for (const project of projects) {
      try {
        // Create unique prompts based on project type and details
        const prompts = {
          commercial: [
            'Abstract luxury brand aesthetic, minimalist cinematic mood, dark tones with golden accents',
            'Modern advertising visual, geometric shapes, clean lines, premium corporate atmosphere',
            'High-end production energy, sleek and contemporary, monochromatic with highlights'
          ],
          short_film: [
            'Intimate character study visual mood, warm lighting, emotional depth, artistic cinematography',
            'Independent film aesthetic, indie cinema vibes, authentic and thoughtful',
            'Narrative cinema mood, character-driven atmosphere, textured and atmospheric'
          ],
          film: [
            'Epic cinematic landscape, grand production feel, dramatic lighting and atmosphere',
            'Feature film production energy, large scale, immersive and captivating',
            'Hollywood-inspired visual mood, dynamic composition, professional cinema aesthetic'
          ],
          music_video: [
            'Electronic music visual energy, abstract and rhythmic, neon and bold colors',
            'Music production mood, sound-visual harmony, experimental and creative energy',
            'Artistic music aesthetic, visual synchronicity with sound, dynamic and stylized'
          ],
          documentary: [
            'Documentary realism mood, observational cinema feel, authentic and grounded',
            'Social impact visual energy, meaningful storytelling atmosphere, genuine and raw',
            'Documentary cinema aesthetic, human-focused narrative, real-world relevance'
          ]
        };

        const typePrompts = prompts[project.project_type] || prompts.commercial;
        const selectedPrompt = typePrompts[Math.floor(Math.random() * typePrompts.length)];
        
        const finalPrompt = `${selectedPrompt}. Abstract, cinematic, no people, no text, no logos. Mood piece for ${project.project_owner_company || project.project_owner_name}.`;

        const imageResponse = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: finalPrompt
        });

        if (imageResponse?.url) {
          await base44.asServiceRole.entities.Project.update(project.id, {
            image_url: imageResponse.url
          });
          results.push({ id: project.id, type: project.project_type, status: 'success' });
        }
      } catch (err) {
        results.push({ id: project.id, status: 'error', msg: err.message });
      }
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});