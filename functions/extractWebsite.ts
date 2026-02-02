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
            commercial: `You are a commercial director creating a 30-60 second ad concept for the brand/company at ${url}. Write ONLY the commercial concept as if pitching to a client. Describe the scenes, characters, emotions, and story arc. DO NOT explain what the company does. DO NOT include sources or citations. DO NOT mention the brand name until the very end. Focus purely on the creative narrative and visual storytelling.`,
            short: `You are a film director creating a 5-10 minute short film inspired by the brand/company at ${url}. Write ONLY the film concept. Describe the protagonist, their journey, the conflict, and resolution. DO NOT explain what the company does. Focus purely on the creative narrative.`,
            feature: `You are a producer creating a feature film concept inspired by the industry/brand at ${url}. Write ONLY the film concept. Describe the main characters, plot, themes, and dramatic arc. DO NOT explain what the company does. Focus purely on the cinematic story.`,
            music: `You are a music video director creating a concept inspired by the brand at ${url}. Write ONLY the music video treatment. Describe the visuals, symbolism, and artistic direction. DO NOT explain what the company does. Focus purely on the creative visuals.`,
            documentary: `You are a documentary filmmaker creating a concept about the industry/topic at ${url}. Write ONLY the documentary concept. Describe the story angle, subjects, and narrative structure. DO NOT explain what the company does. Focus purely on the investigative story.`
        };

        const promptContext = categoryContext[projectType] || `Create a production concept for ${url}`;

        const prompt = `${promptContext}

Write 3-4 sentences describing ONLY the creative concept. Start with the opening scene, describe the emotional journey, and end with how it concludes. Use plain conversational language without any formatting, citations, or explanations. Make it feel like a real creative pitch.

Example style: "We open on a woman staring at herself in the mirror, avoiding her own eyes. Cut to her workplace where colleagues chat easily while she sits alone. She makes a decision. Montage of her transformation journey - early morning workouts, medical consultations, small victories. Final scene: she walks into that same office, head high, radiant. Brand reveal."`;


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