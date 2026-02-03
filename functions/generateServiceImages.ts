import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const MASTER_PROMPT_BASE = `Create a high end cinematic abstract image designed for a premium film studio website.

The image must be built from a field of small monochrome dots on a transparent background.
The dots subtly form a rectangular composition.
At first glance the image looks abstract and technical.

When observed longer, the dots align to reveal a realistic photographic scene related to professional film production.
The image must feel like a signal resolving into focus.

Style:
- Black, white, and gray only
- Transparent background
- No borders
- No icons
- No text
- No glow
- No gradients
- Minimal contrast
- Cinematic depth of field
- Film grain texture
- Editorial quality
- European cinema aesthetic

Subject for this image:
{SUBJECT}

Composition rules:
- No close up faces
- No direct eye contact
- Camera crew shown only partially or from behind
- Focus on equipment, environment, motion, or process
- Feels like an in production moment, not a finished scene
- Feels expensive, calm, controlled, intentional

Mood:
Minimal.
Technical.
Confident.
High end.
Timeless.

This image must look like it belongs to a world class film production company.`;

const SUBJECTS = {
  commercial: "A high end commercial film set with cinema cameras, lighting rigs, and a controlled studio environment, shot from behind the camera team.",
  film: "A documentary film crew capturing a real environment, natural light, handheld cinema camera, observed from a distance.",
  post: "A professional color grading and editing suite with reference monitors, waveform scopes, and a calm post production environment.",
  vfx: "A high end visual effects workspace with motion tracking markers, 3D scene previews, and technical displays, no people visible.",
  sound: "A cinematic sound design studio with mixing console, faders, and speakers, low light, technical focus.",
  web: "A digital production workspace showing interface layouts, grids, and interactive systems, abstract and technical."
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const results = [];

    for (const [key, subject] of Object.entries(SUBJECTS)) {
      const prompt = MASTER_PROMPT_BASE.replace('{SUBJECT}', subject);
      
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt
      });

      results.push({
        service: key,
        url
      });
    }

    return Response.json({ 
      success: true, 
      images: results 
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});