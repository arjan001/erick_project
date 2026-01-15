import React from 'react';
import { MapPin } from 'lucide-react';

const CITIES = [
  { name: 'Amsterdam', country: 'Netherlands', teams: 5, status: 'available', position: { left: '48%', top: '25%' } },
  { name: 'Brussels', country: 'Belgium', teams: 3, status: 'limited', position: { left: '47%', top: '30%' } },
  { name: 'Paris', country: 'France', teams: 6, status: 'available', position: { left: '45%', top: '35%' } },
  { name: 'Barcelona', country: 'Spain', teams: 4, status: 'available', position: { left: '42%', top: '50%' } },
  { name: 'Madrid', country: 'Spain', teams: 3, status: 'available', position: { left: '40%', top: '48%' } },
  { name: 'Berlin', country: 'Germany', teams: 5, status: 'available', position: { left: '52%', top: '28%' } },
  { name: 'Munich', country: 'Germany', teams: 3, status: 'limited', position: { left: '51%', top: '35%' } },
  { name: 'Milan', country: 'Italy', teams: 4, status: 'available', position: { left: '50%', top: '42%' } },
  { name: 'Rome', country: 'Italy', teams: 3, status: 'available', position: { left: '51%', top: '48%' } },
  { name: 'London', country: 'UK', teams: 7, status: 'available', position: { left: '44%', top: '28%' } },
  { name: 'Vienna', country: 'Austria', teams: 3, status: 'available', position: { left: '54%', top: '36%' } },
  { name: 'Luxembourg', country: 'Luxembourg', teams: 2, status: 'available', position: { left: '47%', top: '32%' } },
];

export default function EuropeanPresenceMap() {
  return (
    <section className="py-24 bg-zinc-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(201, 169, 98, 0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            European Network
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Curated teams across major production hubs
          </p>
        </div>

        {/* Map Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Stylized Map Background */}
          <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-2xl p-8 backdrop-blur-sm border border-zinc-700/50">
            {/* Stone lines effect connecting cities */}
            <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#C9A962', stopOpacity: 0.1 }} />
                  <stop offset="50%" style={{ stopColor: '#C9A962', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: '#C9A962', stopOpacity: 0.1 }} />
                </linearGradient>
              </defs>
              {/* Connect nearby cities with lines */}
              <line x1="48%" y1="25%" x2="47%" y2="30%" stroke="url(#lineGradient)" strokeWidth="1" />
              <line x1="47%" y1="30%" x2="45%" y2="35%" stroke="url(#lineGradient)" strokeWidth="1" />
              <line x1="48%" y1="25%" x2="52%" y2="28%" stroke="url(#lineGradient)" strokeWidth="1" />
              <line x1="52%" y1="28%" x2="54%" y2="36%" stroke="url(#lineGradient)" strokeWidth="1" />
              <line x1="45%" y1="35%" x2="42%" y2="50%" stroke="url(#lineGradient)" strokeWidth="1" />
              <line x1="44%" y1="28%" x2="48%" y2="25%" stroke="url(#lineGradient)" strokeWidth="1" />
            </svg>

            {/* City Markers */}
            {CITIES.map((city, index) => (
              <div
                key={index}
                className="absolute group cursor-pointer"
                style={{
                  left: city.position.left,
                  top: city.position.top,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10
                }}
              >
                {/* Pulse animation */}
                <div className={`absolute inset-0 rounded-full animate-ping ${
                  city.status === 'available' ? 'bg-amber-600/50' : 'bg-orange-600/50'
                }`} style={{ animationDuration: '3s' }} />
                
                {/* Pin */}
                <div className={`relative w-3 h-3 rounded-full ${
                  city.status === 'available' ? 'bg-amber-600' : 'bg-orange-600'
                } border-2 border-white shadow-lg`} />

                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                    <div className="font-semibold text-white text-sm">{city.name}</div>
                    <div className="text-xs text-gray-400">{city.teams} teams • {city.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-600"></div>
              <span className="text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span className="text-gray-400">Limited Availability</span>
            </div>
          </div>
        </div>

        {/* City List (Mobile) */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:hidden">
          {CITIES.map((city, index) => (
            <div key={index} className="text-center p-3 bg-zinc-800/50 rounded-lg">
              <MapPin className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <div className="text-sm font-semibold text-white">{city.name}</div>
              <div className="text-xs text-gray-400">{city.teams} teams</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}