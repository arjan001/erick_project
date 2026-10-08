import React, { useState, useEffect } from 'react';
import { FeaturedBrand } from '@/lib/supabaseEntities';

const fallbackBrands = [
  '/brands/brand1.svg',
  '/brands/brand2.svg',
  '/brands/brand3.svg',
  '/brands/brand4.svg',
  '/brands/brand5.svg',
  '/brands/brand6.svg',
];

export default function TrustBar() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedBrands();
  }, []);

  const loadFeaturedBrands = async () => {
    try {
      const data = await FeaturedBrand.filter({ is_active: true }, 'order_index', 50);
      if (data && data.length > 0) {
        // Use backend brand logos
        const brandLogos = data.map(b => b.logo_url).filter(Boolean);
        setBrands(brandLogos);
      } else {
        // Fallback to static SVG files
        setBrands(fallbackBrands);
      }
    } catch (err) {
      console.error('Error loading featured brands:', err);
      // Fallback to static SVG files on error
      setBrands(fallbackBrands);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="overflow-hidden bg-[#F5F3EF] py-12">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-black/50">
            Trusted by top brands &amp; studios
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  // Duplicate for seamless infinite scroll
  const allBrands = [...brands, ...brands, ...brands];

  return (
    <section className="overflow-hidden bg-[#F5F3EF] py-12">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-black/50">
          Trusted by top brands &amp; studios
        </p>
      </div>

      {/* Infinite auto-scroll carousel — no controls */}
      <div className="relative mt-8">
        {/* Edge fade gradients */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#F5F3EF] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#F5F3EF] to-transparent" />

        <div className="flex w-max animate-[scroll_30s_linear_infinite] items-center gap-12">
          {allBrands.map((src, i) => (
            <div
              key={i}
              className="flex h-16 min-w-[160px] items-center justify-center px-8"
            >
              <img
                src={src}
                alt={`Brand ${i % brands.length + 1}`}
                className="h-10 w-auto max-w-[160px] object-contain opacity-40 grayscale"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
