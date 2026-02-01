import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { url, projectType } = await req.json();

        if (!url) {
            return Response.json({ error: 'URL is required' }, { status: 400 });
        }

        const categoryMap = {
            commercial: 'commercial advertisement',
            short: 'short film',
            feature: 'feature film',
            music: 'music video',
            documentary: 'documentary'
        };

        const categoryLabel = categoryMap[projectType] || projectType;

        const prompt = `Analyze the website at ${url} and generate a professional project description for a ${categoryLabel} production. Focus on the brand's identity, target audience, visual style, tone, and production requirements based on what you find. Tailor the description specifically for a ${categoryLabel} context. Keep it to 3-4 sentences maximum.`;

        // Use OpenAI with web search capability
        const { data } = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true,
            response_json_schema: null
        });

        return Response.json({ 
            success: true, 
            description: data 
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});