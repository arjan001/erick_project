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

        const { url } = await req.json();

        if (!url) {
            return Response.json({ error: 'URL is required' }, { status: 400 });
        }

        // Fetch website content
        let websiteContent = '';
        try {
            const response = await fetch(url);
            const html = await response.text();
            // Extract text content (simple approach - remove HTML tags)
            websiteContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 5000);
        } catch (error) {
            return Response.json({ error: 'Failed to fetch website content' }, { status: 400 });
        }

        // Use OpenAI to analyze and generate project description
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an expert production planner. Analyze website content and create a concise, professional project description for a video production. Focus on brand identity, target audience, visual style, and production needs. Keep it to 3-4 sentences maximum."
                },
                {
                    role: "user",
                    content: `Website URL: ${url}\n\nWebsite Content:\n${websiteContent}\n\nGenerate a project description for a video production based on this website.`
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        const description = completion.choices[0].message.content;

        return Response.json({ 
            success: true, 
            description: description 
        });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});