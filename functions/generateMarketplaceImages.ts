import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const categories = [
      {
        name: 'Cinema Cameras',
        prompt: 'Professional cinema camera body only, large sensor cinema camera, matte black finish, isolated on pure white background, photorealistic studio lighting, premium catalog photography, sharp detail, clean edges, no rig, no cables, centered composition, single object'
      },
      {
        name: 'Lenses & Optics',
        prompt: 'High-end cinema lens standing upright, visible focus and aperture rings, premium glass reflections, isolated on pure white background, photorealistic studio lighting, catalog photography style, sharp detail, clean edges, centered composition, single object, no branding emphasized'
      },
      {
        name: 'Lighting',
        prompt: 'Professional film LED panel or spotlight, clean industrial design, studio-grade lighting fixture, isolated on pure white background, photorealistic studio lighting, premium catalog photography, sharp detail, clean edges, centered composition, single object, modern design'
      },
      {
        name: 'Audio Equipment',
        prompt: 'Professional shotgun microphone or field audio recorder, studio quality, minimal design, isolated on pure white background, photorealistic studio lighting, premium catalog photography, sharp detail, clean edges, centered composition, single object, no hands, no mounts'
      },
      {
        name: 'Locations',
        prompt: 'Clean architectural miniature or minimal studio location representation, abstract but realistic, neutral tones, isolated on pure white background, photorealistic studio lighting, premium catalog photography, sharp detail, clean edges, centered composition, no people, no scenery clutter'
      },
      {
        name: 'Studios',
        prompt: 'Minimal professional film studio interior element, cyclorama wall or lighting grid or camera rail system, neutral clean architectural, isolated on pure white background, photorealistic studio lighting, premium catalog photography, sharp detail, clean edges, centered composition, modern industrial design'
      }
    ];

    const images = await Promise.all(
      categories.map(async (category) => {
        const result = await base44.integrations.Core.GenerateImage({
          prompt: category.prompt
        });
        return {
          category: category.name,
          url: result.url
        };
      })
    );

    return Response.json({
      success: true,
      images
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});