import React from 'react';
import { MapPin } from 'lucide-react';

// Simplified country data with approximate coordinates for visualization
const COUNTRY_COORDINATES = {
  'United States': { lat: 37.0902, lng: -95.7129 },
  'United Kingdom': { lat: 55.3781, lng: -3.4360 },
  'Canada': { lat: 56.1304, lng: -106.3468 },
  'Germany': { lat: 51.1657, lng: 10.4515 },
  'France': { lat: 46.2276, lng: 2.2137 },
  'Australia': { lat: -25.2744, lng: 133.7751 },
  'Japan': { lat: 36.2048, lng: 138.2529 },
  'India': { lat: 20.5937, lng: 78.9629 },
  'Brazil': { lat: -14.2350, lng: -51.9253 },
  'Italy': { lat: 41.8719, lng: 12.5674 },
  'Spain': { lat: 40.4637, lng: -3.7492 },
  'Netherlands': { lat: 52.1326, lng: 5.2913 },
  'Mexico': { lat: 23.6345, lng: -102.5528 },
  'South Korea': { lat: 35.9078, lng: 127.7669 },
  'China': { lat: 35.8617, lng: 104.1954 },
  'Russia': { lat: 61.5240, lng: 105.3188 },
  'South Africa': { lat: -30.5595, lng: 22.9375 },
  'Argentina': { lat: -38.4161, lng: -63.6167 },
  'Sweden': { lat: 60.1282, lng: 18.6435 },
  'Norway': { lat: 60.4720, lng: 8.4689 },
  'Poland': { lat: 51.9194, lng: 19.1451 },
  'Belgium': { lat: 50.5039, lng: 4.4699 },
  'Switzerland': { lat: 46.8182, lng: 8.2275 },
  'Austria': { lat: 47.5162, lng: 14.5501 },
  'Denmark': { lat: 56.2639, lng: 9.5018 },
  'Finland': { lat: 61.9241, lng: 25.7482 },
  'Ireland': { lat: 53.1424, lng: -7.6921 },
  'Portugal': { lat: 39.3999, lng: -8.2245 },
  'Greece': { lat: 39.0742, lng: 21.8243 },
  'Turkey': { lat: 38.9637, lng: 35.2433 },
  'Israel': { lat: 31.0461, lng: 34.8516 },
  'UAE': { lat: 23.4241, lng: 53.8478 },
  'Saudi Arabia': { lat: 23.8859, lng: 45.0792 },
  'Egypt': { lat: 26.8206, lng: 30.8025 },
  'Nigeria': { lat: 9.0820, lng: 8.6753 },
  'Kenya': { lat: -0.0236, lng: 37.9062 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Malaysia': { lat: 4.2105, lng: 101.9758 },
  'Indonesia': { lat: -0.7893, lng: 113.9213 },
  'Philippines': { lat: 12.8797, lng: 121.7740 },
  'Thailand': { lat: 15.8700, lng: 100.9925 },
  'Vietnam': { lat: 14.0583, lng: 108.2772 },
  'New Zealand': { lat: -40.9006, lng: 174.8860 },
  'Colombia': { lat: 4.5709, lng: -74.2973 },
  'Chile': { lat: -35.6751, lng: -71.5430 },
  'Peru': { lat: -9.1900, lng: -75.0152 },
  'Venezuela': { lat: 6.4238, lng: -66.5897 },
};

export default function WorldMap({ trafficData = [], onCountryClick = null }) {
  // Find max count for scaling
  const maxCount = Math.max(...trafficData.map(d => d.count), 1);

  // Convert lat/lng to SVG coordinates
  const latLngToXY = (lat, lng) => {
    const x = (lng + 180) * (800 / 360);
    const y = ((-lat) + 90) * (400 / 180);
    return { x, y };
  };

  const getDotSize = (count) => {
    const baseSize = 4;
    const maxSize = 20;
    const size = baseSize + ((count / maxCount) * (maxSize - baseSize));
    return Math.min(size, maxSize);
  };

  const getDotColor = (count) => {
    const intensity = count / maxCount;
    if (intensity > 0.7) return '#ef4444'; // red for high traffic
    if (intensity > 0.4) return '#f59e0b'; // orange for medium
    return '#3b82f6'; // blue for low
  };

  return (
    <div className="relative w-full">
      {/* SVG World Map */}
      <svg viewBox="0 0 800 400" className="w-full h-auto bg-blue-50 rounded-lg">
        {/* Simplified world map paths */}
        <g fill="#e5e7eb" stroke="#d1d5db" strokeWidth="0.5">
          {/* North America */}
          <path d="M 50 60 L 150 50 L 200 60 L 250 80 L 280 120 L 250 150 L 200 160 L 150 150 L 100 140 L 60 120 L 50 80 Z" />
          {/* South America */}
          <path d="M 200 180 L 280 170 L 320 200 L 300 280 L 260 320 L 220 300 L 200 240 L 190 200 Z" />
          {/* Europe */}
          <path d="M 380 60 L 450 50 L 480 70 L 470 100 L 440 110 L 400 100 L 380 80 Z" />
          {/* Africa */}
          <path d="M 380 120 L 450 110 L 500 140 L 490 220 L 440 260 L 390 240 L 370 180 L 370 140 Z" />
          {/* Asia */}
          <path d="M 480 50 L 650 40 L 720 80 L 750 140 L 720 200 L 650 220 L 580 200 L 520 180 L 490 140 L 480 100 Z" />
          {/* Australia */}
          <path d="M 620 260 L 720 250 L 750 280 L 740 320 L 700 340 L 640 330 L 620 290 Z" />
        </g>

        {/* Traffic dots */}
        {trafficData.map((data) => {
          const coords = COUNTRY_COORDINATES[data.country];
          if (!coords) return null;

          const { x, y } = latLngToXY(coords.lat, coords.lng);
          const size = getDotSize(data.count);
          const color = getDotColor(data.count);

          return (
            <g key={data.country}>
              {/* Glow effect */}
              <circle
                cx={x}
                cy={y}
                r={size * 2}
                fill={color}
                opacity="0.2"
                className="animate-pulse"
              />
              {/* Main dot */}
              <circle
                cx={x}
                cy={y}
                r={size}
                fill={color}
                opacity="0.8"
                className="cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => onCountryClick?.(data)}
              />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">Traffic Intensity</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-600">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-600">High</span>
          </div>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-semibold text-gray-700">Active Countries</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{trafficData.length}</div>
        <div className="text-xs text-gray-500 mt-1">
          {trafficData.reduce((sum, d) => sum + d.count, 0).toLocaleString()} visits
        </div>
      </div>
    </div>
  );
}

// Alternative: Simple heatmap-style bars component
export function TrafficHeatmap({ trafficData = [] }) {
  const maxCount = Math.max(...trafficData.map(d => d.count), 1);

  return (
    <div className="space-y-2">
      {trafficData.slice(0, 10).map((data) => {
        const percentage = (data.count / maxCount) * 100;
        return (
          <div key={data.country} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-32 truncate">{data.country}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentage > 70 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                  percentage > 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                  'bg-gradient-to-r from-blue-400 to-blue-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-800 w-16 text-right">
              {data.count.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
