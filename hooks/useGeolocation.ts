'use client'

import { useState } from 'react'
import { LocationData } from '@/types'
import { toast } from 'sonner'

export function useGeolocation() {
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)

  async function getCurrentLocation(): Promise<LocationData | null> {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported on this device')
      return null
    }

    setLoading(true)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords

          // Reverse geocode using free Nominatim API
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            )
            const data = await res.json()
            const name =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              'Unknown location'
            const country = data.address?.country ?? ''

            const loc: LocationData = { lat, lng, name, country }
            setLocation(loc)
            setLoading(false)
            resolve(loc)
          } catch {
            const loc: LocationData = { lat, lng, name: 'Current location' }
            setLocation(loc)
            setLoading(false)
            resolve(loc)
          }
        },
        (err) => {
          toast.error('Could not get location: ' + err.message)
          setLoading(false)
          resolve(null)
        },
        { timeout: 10000, enableHighAccuracy: false }
      )
    })
  }

  return { loading, location, setLocation, getCurrentLocation }
}