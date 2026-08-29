import React from 'react';

const brands = ['Disney', 'YouTube', 'Hulu', 'Netflix', 'HBO', 'Amazon Studios'];

export default function TrustBar() {
  return (
    <section className="bg-[#F5F3EF] py-14">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-black/50">
          Trusted by top brands &amp; studios
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {brands.map((b) => (
            <div
              key={b}
              className="flex h-16 min-w-[120px] items-center justify-center rounded-xl bg-[#E8E6E2] px-8 text-lg font-bold text-black/40 grayscale"
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
