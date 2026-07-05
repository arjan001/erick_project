import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';

export default function LocationMapSelector({ 
  onLocationSelect, 
  initialCity = '', 
  initialCountry = '',
  className = ''
}) {
  const [city, setCity] = useState(initialCity);
  const [country, setCountry] = useState(initialCountry);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    setCity(initialCity);
    setCountry(initialCountry);
  }, [initialCity, initialCountry]);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current) return;

    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (window.L) {
        initMap();
        return;
      }

      // Load Leaflet CSS and JS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  const initMap = () => {
    if (!window.L || !mapRef.current) return;

    const L = window.L;
    
    // Remove existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create map centered on a default location or selected location
    const defaultLat = selectedCoords?.lat || 40.7128;
    const defaultLng = selectedCoords?.lng || -74.0060;

    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Add marker if coordinates exist
    if (selectedCoords) {
      addMarker(selectedCoords.lat, selectedCoords.lng);
    }

    // Click on map to select location
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setSelectedCoords({ lat, lng });
      addMarker(lat, lng);
      reverseGeocode(lat, lng);
    });
  };

  const addMarker = (lat, lng) => {
    if (!window.L || !mapInstanceRef.current) return;

    const L = window.L;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new marker
    const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
    markersRef.current.push(marker);
  };

  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Using Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.address) {
        const newCity = data.address.city || data.address.town || data.address.village || '';
        const newCountry = data.address.country || '';
        
        setCity(newCity);
        setCountry(newCountry);
        
        if (onLocationSelect) {
          onLocationSelect({
            city: newCity,
            country: newCountry,
            lat,
            lng
          });
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const selectSearchResult = async (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setSelectedCoords({ lat, lng });
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 13);
      addMarker(lat, lng);
    }

    // Extract city and country from display_name or address
    const address = result.address || {};
    const newCity = address.city || address.town || address.village || address.municipality || '';
    const newCountry = address.country || '';

    setCity(newCity);
    setCountry(newCountry);
    setSearchQuery('');
    setSearchResults([]);

    if (onLocationSelect) {
      onLocationSelect({
        city: newCity,
        country: newCountry,
        lat,
        lng
      });
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchLocation(query);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search for a location..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
          {searchResults.map((result, idx) => (
            <button
              key={idx}
              onClick={() => selectSearchResult(result)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{result.display_name.split(',')[0]}</p>
                  <p className="text-xs text-gray-500 truncate">{result.display_name}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg border border-gray-300 overflow-hidden"
        style={{ minHeight: '256px' }}
      />

      {/* Selected Location Display */}
      {(city || country) && (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {city && country ? `${city}, ${country}` : city || country}
            </p>
            {selectedCoords && (
              <p className="text-xs text-gray-500">
                {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
