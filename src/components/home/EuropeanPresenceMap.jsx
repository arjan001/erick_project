import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

const CITIES = [
  { name: 'Tenerife', country: 'Canary Islands', teams: 'HQ', status: 'headquarters', image: 'https://images.unsplash.com/photo-1584735175097-719d848f8449?q=80&w=400', x: 15, y: 85 },
  { name: 'Amsterdam', country: 'Netherlands', teams: 3, status: 'active', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=400', x: 48, y: 25 },
  { name: 'Barcelona', country: 'Spain', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=400', x: 42, y: 52 },
  { name: 'Berlin', country: 'Germany', teams: 4, status: 'active', image: 'https://images.unsplash.com/photo-1560930950-5cc20e80e392?q=80&w=400', x: 55, y: 28 },
  { name: 'Paris', country: 'France', teams: 3, status: 'active', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=400', x: 42, y: 35 },
  { name: 'Brussels', country: 'Belgium', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1559113202-c916b8e44373?q=80&w=400', x: 45, y: 30 },
  { name: 'Milan', country: 'Italy', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1543429257-818c36605555?q=80&w=400', x: 52, y: 48 },
  { name: 'Vienna', country: 'Austria', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=400', x: 58, y: 38 },
  { name: 'Lisbon', country: 'Portugal', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=400', x: 28, y: 55 },
  { name: 'Copenhagen', country: 'Denmark', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?q=80&w=400', x: 54, y: 18 },
  { name: 'Zurich', country: 'Switzerland', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1506665531195-14828a5b7c48?q=80&w=400', x: 50, y: 42 },
  { name: 'London', country: 'United Kingdom', teams: 3, status: 'active', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=400', x: 38, y: 28 },
  { name: 'Rome', country: 'Italy', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=400', x: 54, y: 55 },
  { name: 'Budapest', country: 'Hungary', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?q=80&w=400', x: 62, y: 42 },
  { name: 'Madrid', country: 'Spain', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=400', x: 35, y: 55 },
  { name: 'Stockholm', country: 'Sweden', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=400', x: 60, y: 12 },
  { name: 'Dublin', country: 'Ireland', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1548690596-55342a7c99d8?q=80&w=400', x: 32, y: 25 },
  { name: 'Prague', country: 'Czech Republic', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?q=80&w=400', x: 57, y: 35 },
  { name: 'Athens', country: 'Greece', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?q=80&w=400', x: 68, y: 58 },
  { name: 'Warsaw', country: 'Poland', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1601823984263-b8f0146c0c25?q=80&w=400', x: 63, y: 28 },
  { name: 'Helsinki', country: 'Finland', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1554827187-dd7d0e0eb4c5?q=80&w=400', x: 68, y: 8 },
  { name: 'Oslo', country: 'Norway', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1520034475321-cbe63696469a?q=80&w=400', x: 52, y: 12 },
  { name: 'Valencia', country: 'Spain', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=400', x: 38, y: 58 },
  { name: 'Lyon', country: 'France', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1557992260-ec58e38d363c?q=80&w=400', x: 46, y: 42 },
  { name: 'Munich', country: 'Germany', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=400', x: 53, y: 38 },
  { name: 'Hamburg', country: 'Germany', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=400', x: 52, y: 22 },
  { name: 'Nice', country: 'France', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=400', x: 48, y: 48 }
];

export default function EuropeanPresenceMap() {
  const [hoveredCity, setHoveredCity] = useState(null);

  return (
    <section className="py-32 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_70%)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
            Global Network
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Headquartered in Tenerife, Canary Islands, with curated teams across 27 European cities
          </p>
        </div>

        {/* Desktop Map */}
        <div className="hidden lg:block relative h-[600px] mb-12">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black rounded-3xl border border-zinc-800">
            {/* Map Container */}
            <div className="relative w-full h-full">
              {CITIES.map((city, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${city.x}%`, top: `${city.y}%` }}
                  onMouseEnter={() => setHoveredCity(city)}
                  onMouseLeave={() => setHoveredCity(null)}
                >
                  {/* City Marker */}
                  <div className={`relative cursor-pointer group ${
                    city.status === 'headquarters' ? 'scale-150' : ''
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      city.status === 'headquarters'
                        ? 'bg-white ring-4 ring-white/30'
                        : 'bg-amber-500 ring-2 ring-amber-500/30'
                    } animate-pulse`} />
                    
                    {/* Hover Card */}
                    {hoveredCity?.name === city.name && (
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-lg shadow-2xl overflow-hidden z-50 animate-fadeInUp">
                        <img 
                          src={city.image} 
                          alt={city.name}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-4 bg-white">
                          <h3 className="font-bold text-black text-lg">{city.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{city.country}</p>
                          {city.status === 'headquarters' ? (
                            <div className="inline-block px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                              HEADQUARTERS
                            </div>
                          ) : (
                            <p className="text-gray-500 text-xs">{city.teams} {city.teams === 1 ? 'Team' : 'Teams'} Available</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile List */}
        <div className="lg:hidden grid grid-cols-2 gap-4">
          {CITIES.map((city, index) => (
            <div key={index} className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
              <img 
                src={city.image} 
                alt={city.name}
                className="w-full h-24 object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold text-white text-sm">{city.name}</h3>
                <p className="text-gray-400 text-xs">{city.country}</p>
                {city.status === 'headquarters' ? (
                  <div className="inline-block mt-2 px-2 py-1 bg-white text-black text-xs font-semibold rounded">
                    HQ
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs mt-1">{city.teams} teams</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}