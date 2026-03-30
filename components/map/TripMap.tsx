'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

// Fix default marker icon broken in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], 10)
    } else {
      map.fitBounds(positions.map((p) => [p[0], p[1]]))
    }
  }, [positions, map])
  return null
}

interface DayPin {
  dayId: string
  tripId: string
  date: string
  title?: string
  location: { lat: number; lng: number; name: string }
  mood?: string
}

export default function TripMap({ pins }: { pins: DayPin[] }) {
  const positions: [number, number][] = pins.map((p) => [p.location.lat, p.location.lng])
  const center: [number, number] = positions.length > 0 ? positions[0] : [20, 78]

  return (
    <MapContainer
      center={center}
      zoom={5}
      className="w-full h-full rounded-2xl z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={positions} />
      {pins.map((pin) => (
        <Marker key={pin.dayId} position={[pin.location.lat, pin.location.lng]} icon={icon}>
          <Popup>
            <div className="text-sm min-w-[160px]">
              <p className="font-medium text-stone-800">
                {pin.title ?? formatDate(pin.date, 'dd MMM yyyy')}
              </p>
              <p className="text-stone-500 text-xs mt-0.5">{pin.location.name}</p>
              <Link
                href={`/trips/${pin.tripId}/days/${pin.dayId}`}
                className="text-xs text-blue-600 hover:underline mt-2 block"
              >
                View entry →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}