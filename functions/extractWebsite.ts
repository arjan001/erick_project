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
            commercial: 'Think like a creative director for advertising. Based on this brand, what ORIGINAL commercial concept would perfectly showcase them? Consider their identity and values. Propose a bold, memorable campaign idea that would make people stop and watch.',
            short: 'Think like a film director. Based on this company, what compelling SHORT FILM story could be created? Develop an original narrative concept inspired by their world that captures attention.',
            feature: 'Think like a feature film producer. Based on this brand or industry, what FULL-LENGTH CINEMATIC story could be developed? Create an original film concept with dramatic potential and character depth.',
            music: 'Think like a music video director. Based on this brand\'s aesthetic, what visually STRIKING MUSIC VIDEO concept would work? Propose an original creative direction with bold visual metaphors.',
            documentary: 'Think like a documentary filmmaker. What FASCINATING DOCUMENTARY story could explore this company or industry? Propose an original investigative angle that reveals something surprising.'
        };

        const promptContext = categoryContext[projectType] || 'Based on this brand, what original production concept would work best?';

        const prompt = `You are a visionary creative producer analyzing this website: ${url}

${promptContext}

Generate an ORIGINAL PROJECT CONCEPT (3-4 sentences). Be creative, cinematic, and specific. This is a NEW PRODUCTION PITCH, not a description of what they already do. Think outside the box.`;

        // Use OpenAI with web search capability
        const response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            add_context_from_internet: true
        });

        return Response.json({ 
            success: true, 
            description: response 
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});