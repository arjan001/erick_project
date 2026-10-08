import React, { useState, useEffect } from 'react'
import { listPartnerLogos } from '@/services/partnerLogoService'

export default function PartnersCarousel({ tone = 'light', fade = '#F5F3EF' }) {
  const [partners, setPartners] = useState([])

  useEffect(() => {
    listPartnerLogos().then(setPartners).catch(() => setPartners([]))
  }, [])

  if (partners.length === 0) {
    return null
  }

  // Duplicate for seamless infinite scroll
  const allPartners = [...partners, ...partners, ...partners]

  return (
    <div className="relative overflow-hidden">
      {/* Edge fade gradients */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r"
        style={{ background: `linear-gradient(to right, ${fade}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l"
        style={{ background: `linear-gradient(to left, ${fade}, transparent)` }}
      />

      <div className="flex w-max animate-[scroll_30s_linear_infinite] items-center gap-12">
        {allPartners.map((partner, i) => (
          <div
            key={`${partner.id}-${i}`}
            className="flex h-16 min-w-[160px] items-center justify-center px-8"
          >
            <img
              src={partner.logo_url}
              alt={partner.name}
              className="h-10 w-auto max-w-[160px] object-contain opacity-40 grayscale"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
