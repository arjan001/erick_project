import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import OpenAI from 'npm:openai@4.77.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { section } = await req.json();

        // Initialize inside the handler — module-top-level init throws on missing secrets and crashes boot
        const openai = new OpenAI({
            apiKey: Deno.env.get("OPENAI_API_KEY"),
        });

        let prompt = '';
        
        switch(section) {
            case 'inproduction':
                prompt = `Generate 9 high-end cinematic production projects currently in development for Studio22.
                Include: 3 feature films, 2 commercials, 2 virtual productions, 1 immersive experience, 1 brand film.
                Each must sound prestigious and cinematic. Return JSON with "projects" array.
                Each project: title (2-3 words, UPPERCASE, cinematic), studio (European production studio name), type (Film/Commercial/Virtual Production/etc), status (In Production), description (1 cinematic sentence about the vision).`;
                break;
            case 'released':
                prompt = `Generate 6 completed flagship productions for Studio22.
                Include: 2 feature films, 2 high-end commercials, 1 immersive space, 1 virtual production.
                Return JSON with "projects" array.
                Each: title (UPPERCASE, 2-3 words, cinematic), studio (European studio), type, score (8.5-9.8), description (1 sentence about the cinematic achievement and visual impact).`;
                break;
            case 'creators':
                prompt = `Generate 12 world-class creators for Studio22 network.
                Include: 3 directors, 2 cinematographers, 2 3D artists, 2 VFX supervisors, 2 technical artists, 1 producer.
                Return JSON with "creators" array.
                Each: name (realistic European names), role (exact title), city (major European city), country, specialty (1 sentence about their expertise and style).`;
                break;
            case 'collections':
                prompt = `Generate 6 prestigious curated collections for Studio22.
                Themes: Virtual Production, 3D Environments, Brand Films, Feature Concepts, Immersive Spaces, AR Experiences.
                Return JSON with "collections" array.
                Each: title (collection theme), description (1 editorial sentence positioning it), project_count (8-15).`;
                break;
            case 'recent':
                prompt = `Generate 8 recently updated/completed productions for Studio22.
                Mix of: commercials, shorts, virtual productions, brand films, 3D projects.
                Return JSON with "projects" array.
                Each: title (UPPERCASE, 2-3 words), studio, type, updated_date (recent 2026), description (1 sentence).`;
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