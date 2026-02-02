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

        const categoryContext = {
            commercial: 'You are a creative director pitching a commercial concept. Based on this brand, create an original 30-60 second commercial script concept.',
            short: 'You are a film director pitching a short film. Based on this company, create an original 5-10 minute narrative film concept.',
            feature: 'You are a producer pitching a feature film. Based on this brand or industry, create an original full-length cinematic story concept.',
            music: 'You are a music video director pitching a concept. Based on this brand aesthetic, create an original music video treatment.',
            documentary: 'You are a documentary filmmaker pitching a story. Based on this company or industry, create an original documentary concept.'
        };

        const promptContext = categoryContext[projectType] || 'Create an original production concept based on this brand.';

        const prompt = `Analyze website: ${url}

${promptContext}

Write a SHORT CONCEPT PITCH (2-3 sentences). Focus on the core idea, visual approach, and emotional tone. Write in plain text without any markdown formatting, asterisks, or special characters. Make it feel like a real production pitch.`;

        // Use OpenAI with web search capability
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true
        });

        // Clean up markdown formatting
        const cleanedDescription = response
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/—/g, '-')
            .replace(/––/g, '-')
            .replace(/###/g, '')
            .replace(/##/g, '')
            .replace(/#/g, '')
            .trim();

        return Response.json({ 
            success: true, 
            description: cleanedDescription 
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});