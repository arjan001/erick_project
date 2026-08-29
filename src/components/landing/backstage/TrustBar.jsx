import React from 'react';

// Brand logos as styled text/SVG representations
const brands = [
  { name: 'Disney', render: () => <span className="text-2xl font-bold italic tracking-tight text-black/40">Disney</span> },
  { name: 'YouTube', render: () => (
    <div className="flex items-center gap-1.5">
      <svg viewBox="0 0 90 20" className="h-5 w-auto" fill="none">
        <path d="M27.7 2.8C27.5 2.1 26.9 1.5 26.2 1.3C25 1 20 1 20 1C20 1 15 1 13.8 1.3C13.1 1.5 12.5 2.1 12.3 2.8C12 4 12 8.5 12 8.5C12 8.5 12 13 12.3 14.2C12.5 14.9 13.1 15.5 13.8 15.7C15 16 20 16 20 16C20 16 25 16 26.2 15.7C26.9 15.5 27.5 14.9 27.7 14.2C28 13 28 8.5 28 8.5C28 8.5 28 4 27.7 2.8Z" fill="#000" opacity="0.35"/>
        <path d="M18 5.5L22.5 8.5L18 11.5V5.5Z" fill="#fff"/>
      </svg>
      <span className="text-lg font-medium text-black/40">YouTube</span>
    </div>
  )},
  { name: 'Hulu', render: () => <span className="text-2xl font-bold lowercase tracking-tight text-black/40">hulu</span> },
  { name: 'Netflix', render: () => <span className="text-2xl font-extrabold tracking-tight text-black/40">NETFLIX</span> },
  { name: 'HBO', render: () => <span className="text-2xl font-bold tracking-tight text-black/30">HBO</span> },
  { name: 'Amazon Studios', render: () => (
    <span className="text-lg font-bold text-black/35">amazon studios</span>
  )},
];

// Duplicate for seamless infinite scroll
const allBrands = [...brands, ...brands, ...brands];

export default function TrustBar() {
  return (
    <section className="overflow-hidden bg-[#F5F3EF] py-12">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-black/50">
          Trusted by top brands &amp; studios
        </p>
      </div>

      {/* Infinite carousel */}
      <div className="relative mt-8">
        {/* Edge fade gradients */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#F5F3EF] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#F5F3EF] to-transparent" />

        <div className="flex w-max animate-[scroll_30s_linear_infinite] gap-4">
          {allBrands.map((b, i) => (
            <div
              key={`${b.name}-${i}`}
              className="flex h-16 min-w-[160px] items-center justify-center rounded-xl bg-[#E8E6E2] px-8"
            >
              {b.render()}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
