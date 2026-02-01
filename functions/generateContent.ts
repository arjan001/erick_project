import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { section } = await req.json();

        let prompt = '';
        
        switch(section) {
            case 'nominees':
                prompt = `Generate 9 diverse video production project titles and descriptions for Studio22 (a European production network).
                Include: 3 commercials, 2 music videos, 2 short films, 1 documentary, 1 branded content.
                Return JSON array with: title (2-3 words, UPPERCASE), company (made up production company), type (genre), description (1 sentence).`;
                break;
            case 'winners':
                prompt = `Generate 6 award-winning video production projects for Studio22.
                Include variety: commercial, fashion film, documentary, music video, short film, branded content.
                Return JSON array with: title (UPPERCASE, 2-3 words), company, type, score (between 8.5-9.5), description (1 sentence about the creative approach).`;
                break;
            case 'creators':
                prompt = `Generate 8 diverse creative professionals for Studio22 directory.
                Include: directors, cinematographers, editors, vfx artists, sound designers.
                Return JSON array with: name, role, city (European cities), experience_years (5-20), specialty (1 sentence).`;
                break;
            case 'collections':
                prompt = `Generate 4 curated collections for Studio22 portfolio.
                Themes: "Cinematic Commercials", "Music Video Excellence", "Documentary Stories", "Experimental Films".
                Return JSON array with: title, description (1 sentence), project_count (5-12).`;
                break;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a creative content generator for a premium video production network. Always return valid JSON arrays."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = JSON.parse(response.choices[0].message.content);

        return Response.json({ success: true, data: content });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});