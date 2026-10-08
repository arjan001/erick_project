import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : <Marker position={position} />
}

export default function LocationPicker({ initialPosition, onLocationChange, height = 300 }) {
  const [position, setPosition] = useState(initialPosition ? [initialPosition.lat, initialPosition.lng] : null)

  useEffect(() => {
    if (position) {
      onLocationChange({ lat: position[0], lng: position[1] })
    }
  }, [position, onLocationChange])

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude])
        },
        (err) => {
          
          alert('Unable to get your current location. Please click on the map to set your location.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Click on the map to set your location</p>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="text-xs bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800 transition-colors"
        >
          Use My Location
        </button>
      </div>
      <MapContainer
        center={position || [40.7128, -74.0060]}
        zoom={position ? 13 : 2}
        style={{ height: `${height}px`, width: '100%', borderRadius: '8px', zIndex: 1 }}
        className="border border-gray-200"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      {position && (
        <p className="text-xs text-gray-500">
          Selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      )}
    </div>
  )
}
