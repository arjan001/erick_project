import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const projectTypeLabels = {
  commercial: 'Commercial / Brand Film',
  short: 'Short Film',
  feature: 'Feature Film',
  music: 'Music Video',
  documentary: 'Documentary'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { url, projectType } = await req.json();

    if (!url || !projectType) {
      return Response.json({ error: 'URL and projectType required' }, { status: 400 });
    }

    // Fetch website content
    let pageContent = '';
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Studio22Bot/1.0)'
        }
      });
      const html = await response.text();
      
      // Extract text content from HTML
      const textMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (textMatch) {
        pageContent = textMatch[1]
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 3000);
      }
    } catch (fetchError) {
      pageContent = '';
    }

    // Use OpenAI to analyze and generate creative concept
    const analysisPrompt = `You are a creative film director and strategist for a production company.

I have scraped content from this website: ${url}

${pageContent ? `Website Content:\n${pageContent}` : 'Unable to fetch page content, but URL is: ' + url}

Based on this website and brand, generate an ORIGINAL and CREATIVE film concept for a ${projectTypeLabels[projectType] || projectType}.

This must NOT be a summary of the website or marketing copy. Instead, it should be a professional creative pitch that interprets the brand's essence into a compelling film idea.

Generate ONLY the description in this exact format (include all section headers, use professional film language):

Core Concept
[One powerful paragraph describing the artistic core idea for this film - what it's fundamentally about]

Story or Direction
[How the film unfolds or is structured - the narrative arc or visual journey]

Visual Style and Mood
[Cinematic references, atmosphere, color palette, pacing, tone - specific visual language for this film]

Audience and Impact
[Who this film is for and what emotional or behavioral response it should create]

Production Approach
[Suggested format (documentary/narrative/commercial style), scale, and key creative execution details]`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      add_context_from_internet: false
    });

    const description = typeof llmResponse === 'string' ? llmResponse : llmResponse?.toString() || '';

    return Response.json({
      success: true,
      description: description.trim()
    });
  } catch (error) {
    console.error('Extract and analyze error:', error);
    return Response.json({ 
      error: error.message || 'Failed to extract and analyze website',
      success: false
    }, { status: 500 });
  }
});