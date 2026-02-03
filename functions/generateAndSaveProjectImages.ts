import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const projects = await base44.asServiceRole.entities.Project.list();
    const projectsWithoutImages = projects.filter(p => !p.image_url);

    const results = [];

    for (const project of projectsWithoutImages) {
      try {
        const prompt = `Create an abstract, cinematic project image for a ${project.project_type} production. 
Focus on mood and tone rather than literal scenes. 
Style: Minimalist, neutral palette, atmospheric. 
No people, no text, no logos, no literal representations.
Company: ${project.project_owner_company || project.project_owner_name}
Brief: ${project.notes?.substring(0, 150) || ''}
Create something that evokes the essence of the project without being literal.`;

        const imageResponse = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: prompt
        });

        if (imageResponse?.url) {
          await base44.asServiceRole.entities.Project.update(project.id, {
            image_url: imageResponse.url
          });
          results.push({ id: project.id, status: 'success', url: imageResponse.url });
        }
      } catch (imgError) {
        results.push({ id: project.id, status: 'error', error: imgError.message });
      }
    }

    return Response.json({
      message: `Processed ${projectsWithoutImages.length} projects`,
      results: results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});