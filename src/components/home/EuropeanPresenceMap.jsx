import React, { useState, useEffect, useRef } from 'react';

const CITIES = [
  // Headquarters
  { name: 'Tenerife', country: 'Canary Islands', teams: 'HQ', status: 'headquarters', image: 'https://images.unsplash.com/photo-1584735175097-719d848f8449?q=80&w=400', x: 15, y: 85, lat: 28.29, lng: -16.63 },
  { name: 'Luxembourg', country: 'Luxembourg', teams: 'HQ', status: 'headquarters', image: 'https://images.unsplash.com/photo-1585880677320-659423bb4065?q=80&w=400', x: 48, y: 32, lat: 49.61, lng: 6.13 },
  { name: 'Andorra', country: 'Andorra', teams: 'HQ', status: 'headquarters', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=400', x: 41, y: 50, lat: 42.51, lng: 1.52 },
  
  // Europe
  { name: 'Amsterdam', country: 'Netherlands', teams: 3, status: 'active', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=400', x: 48, y: 25, lat: 52.37, lng: 4.89 },
  { name: 'Barcelona', country: 'Spain', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=400', x: 42, y: 52, lat: 41.39, lng: 2.17 },
  { name: 'Berlin', country: 'Germany', teams: 4, status: 'active', image: 'https://images.unsplash.com/photo-1560930950-5cc20e80e392?q=80&w=400', x: 55, y: 28, lat: 52.52, lng: 13.40 },
  { name: 'Paris', country: 'France', teams: 3, status: 'active', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=400', x: 42, y: 35, lat: 48.86, lng: 2.35 },
  { name: 'Brussels', country: 'Belgium', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1559113202-c916b8e44373?q=80&w=400', x: 45, y: 30, lat: 50.85, lng: 4.35 },
  { name: 'Milan', country: 'Italy', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1543429257-818c36605555?q=80&w=400', x: 52, y: 48, lat: 45.46, lng: 9.19 },
  { name: 'Vienna', country: 'Austria', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=400', x: 58, y: 38, lat: 48.21, lng: 16.37 },
  { name: 'Lisbon', country: 'Portugal', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=400', x: 28, y: 55, lat: 38.72, lng: -9.14 },
  { name: 'Copenhagen', country: 'Denmark', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?q=80&w=400', x: 54, y: 18, lat: 55.68, lng: 12.57 },
  { name: 'Zurich', country: 'Switzerland', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1506665531195-14828a5b7c48?q=80&w=400', x: 50, y: 42, lat: 47.38, lng: 8.54 },
  { name: 'London', country: 'United Kingdom', teams: 3, status: 'active', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=400', x: 38, y: 28, lat: 51.51, lng: -0.13 },
  { name: 'Rome', country: 'Italy', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=400', x: 54, y: 55, lat: 41.90, lng: 12.50 },
  { name: 'Budapest', country: 'Hungary', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?q=80&w=400', x: 62, y: 42, lat: 47.50, lng: 19.04 },
  { name: 'Madrid', country: 'Spain', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=400', x: 35, y: 55, lat: 40.42, lng: -3.70 },
  { name: 'Stockholm', country: 'Sweden', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?q=80&w=400', x: 60, y: 12, lat: 59.33, lng: 18.07 },
  { name: 'Dublin', country: 'Ireland', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?q=80&w=400', x: 32, y: 25, lat: 53.35, lng: -6.26 },
  { name: 'Prague', country: 'Czech Republic', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?q=80&w=400', x: 57, y: 35, lat: 50.08, lng: 14.44 },
  { name: 'Athens', country: 'Greece', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?q=80&w=400', x: 68, y: 58, lat: 37.98, lng: 23.73 },
  { name: 'Warsaw', country: 'Poland', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1601823984263-b8f0146c0c25?q=80&w=400', x: 63, y: 28, lat: 52.23, lng: 21.01 },
  { name: 'Helsinki', country: 'Finland', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1527838421806-817a8ceb89e4?q=80&w=400', x: 68, y: 8, lat: 60.17, lng: 24.94 },
  { name: 'Oslo', country: 'Norway', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1520034475321-cbe63696469a?q=80&w=400', x: 52, y: 12, lat: 59.91, lng: 10.75 },
  { name: 'Valencia', country: 'Spain', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=400', x: 38, y: 58, lat: 39.47, lng: -0.38 },
  { name: 'Lyon', country: 'France', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1557992260-ec58e38d363c?q=80&w=400', x: 46, y: 42, lat: 45.76, lng: 4.84 },
  { name: 'Munich', country: 'Germany', teams: 2, status: 'active', image: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=400', x: 53, y: 38, lat: 48.14, lng: 11.58 },
  { name: 'Hamburg', country: 'Germany', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?q=80&w=400', x: 52, y: 22, lat: 53.55, lng: 10.00 },
  { name: 'Nice', country: 'France', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=400', x: 48, y: 48, lat: 43.70, lng: 7.27 },
  { name: 'Gran Canaria', country: 'Canary Islands', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1600788907416-456578634209?q=80&w=400', x: 17, y: 87, lat: 27.93, lng: -15.60 },
  { name: 'Lanzarote', country: 'Canary Islands', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1591608971362-f08b2a75731a?q=80&w=400', x: 16, y: 83, lat: 29.05, lng: -13.59 },
  { name: 'La Gomera', country: 'Canary Islands', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=400', x: 14, y: 86, lat: 28.11, lng: -17.21 },
  { name: 'Sicily', country: 'Italy', teams: 1, status: 'active', image: 'https://images.unsplash.com/photo-1585155968002-365151f70fa9?q=80&w=400', x: 56, y: 62, lat: 37.60, lng: 14.01 },
  
  // Global
  { name: 'New York', country: 'USA', teams: 2, status: 'global', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=400', x: 5, y: 55, lat: 40.71, lng: -74.01 },
  { name: 'Las Vegas', country: 'USA', teams: 1, status: 'global', image: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?q=80&w=400', x: 2, y: 60, lat: 36.17, lng: -115.14 },
  { name: 'Buenos Aires', country: 'Argentina', teams: 1, status: 'global', image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?q=80&w=400', x: 10, y: 120, lat: -34.60, lng: -58.38 },
  { name: 'Singapore', country: 'Singapore', teams: 2, status: 'global', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=400', x: 90, y: 95, lat: 1.35, lng: 103.82 },
  { name: 'Abu Dhabi', country: 'UAE', teams: 1, status: 'global', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=400', x: 78, y: 75, lat: 24.47, lng: 54.37 }
];

export default function EuropeanPresenceMap() {
  const [hoveredCity, setHoveredCity] = useState(null);
  const [visibleCities, setVisibleCities] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const mapRef = useRef(null);

  // Rotate visible city names every 3 seconds
  useEffect(() => {
    const updateVisibleCities = () => {
      const shuffled = [...CITIES].sort(() => Math.random() - 0.5);
      setVisibleCities(shuffled.slice(0, 3));
    };
    
    updateVisibleCities();
    const interval = setInterval(updateVisibleCities, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* World map background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-white">
            Global Network
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Headquartered in Tenerife, Luxembourg & Andorra with clients across Europe, Americas, Middle East & Asia
          </p>
        </div>

        {/* Desktop Interactive Map */}
        <div 
          ref={mapRef}
          className="hidden lg:block relative h-[700px] mb-12"
          onMouseMove={handleMouseMove}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black rounded-3xl border border-zinc-800 overflow-hidden">
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-200" 
              style={{ 
                transform: `translate(${(mousePos.x - 50) * 0.05}px, ${(mousePos.y - 50) * 0.05}px)`
              }}
            >
              {/* Connection lines */}
              {CITIES.map((city, i) => 
                CITIES.slice(i + 1).map((otherCity, j) => (
                  <line
                    key={`${i}-${j}`}
                    x1={`${city.x}%`}
                    y1={`${city.y}%`}
                    x2={`${otherCity.x}%`}
                    y2={`${otherCity.y}%`}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                    className="transition-all duration-200"
                  />
                ))
              )}
            </svg>

            {/* Cities */}
            <div 
              className="relative w-full h-full transition-transform duration-200"
              style={{ 
                transform: `translate(${(mousePos.x - 50) * 0.08}px, ${(mousePos.y - 50) * 0.08}px)`
              }}
            >
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
                        ? 'bg-white ring-4 ring-white/30 shadow-lg shadow-white/50'
                        : city.status === 'global'
                        ? 'bg-blue-500 ring-2 ring-blue-500/30'
                        : 'bg-amber-500 ring-2 ring-amber-500/30'
                    } ${city.status === 'headquarters' ? '' : 'animate-pulse'}`} />
                    
                    {/* City Name Label (soft, rotating) */}
                    {visibleCities.includes(city) && !hoveredCity && (
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="text-xs text-white/40 font-light">{city.name}</span>
                      </div>
                    )}

                    {/* Hover Card */}
                    {hoveredCity?.name === city.name && (
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-72 bg-white rounded-lg shadow-2xl overflow-hidden z-50 animate-fadeInUp pointer-events-none">
                        <img 
                          src={city.image} 
                          alt={city.name}
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=400';
                          }}
                        />
                        <div className="p-4 bg-white">
                          <h3 className="font-bold text-black text-lg">{city.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{city.country}</p>
                          {city.status === 'headquarters' ? (
                            <div className="inline-block px-3 py-1 bg-black text-white text-xs font-semibold rounded-full">
                              HEADQUARTERS
                            </div>
                          ) : city.status === 'global' ? (
                            <div className="inline-block px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                              GLOBAL
                            </div>
                          ) : (
                            <p className="text-gray-500 text-xs">{city.teams} {city.teams === 1 ? 'Team' : 'Teams'}</p>
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

        {/* Mobile Grid */}
        <div className="lg:hidden grid grid-cols-2 gap-4">
          {CITIES.map((city, index) => (
            <div key={index} className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
              <img 
                src={city.image} 
                alt={city.name}
                className="w-full h-24 object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=400';
                }}
              />
              <div className="p-3">
                <h3 className="font-semibold text-white text-sm">{city.name}</h3>
                <p className="text-gray-400 text-xs">{city.country}</p>
                {city.status === 'headquarters' ? (
                  <div className="inline-block mt-2 px-2 py-1 bg-white text-black text-xs font-semibold rounded">
                    HQ
                  </div>
                ) : city.status === 'global' ? (
                  <div className="inline-block mt-2 px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded">
                    GLOBAL
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