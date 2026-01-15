import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { url, description, projectType } = await req.json();

        let prompt = '';
        
        // Check if this is a refresh request (changing project type)
        if (url && url.startsWith('refresh-')) {
            if (!description || !projectType) {
                return Response.json({ error: 'Description and project type required' }, { status: 400 });
            }
            
            prompt = `Current project description: "${description}"\n\nRewrite this description to better fit a ${projectType} production. Keep the core concept but adjust the language, tone, and focus to match ${projectType} style. Keep it to 3-4 sentences maximum.`;
        } else {
            // Original extraction from URL using web search
            if (!url) {
                return Response.json({ error: 'URL is required' }, { status: 400 });
            }

            prompt = `Analyze the website at ${url} and generate a professional project description for a video production. Focus on the brand's identity, target audience, visual style, and production needs based on what you find. Keep it to 3-4 sentences maximum.`;
        }

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