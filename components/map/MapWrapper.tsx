'use client'

import dynamic from 'next/dynamic'

const TripMap = dynamic(() => import('@/components/map/TripMap'), { ssr: false })

interface DayPin {
  dayId: string
  tripId: string
  date: string
  title?: string
  location: { lat: number; lng: number; name: string }
  mood?: string
}

export default function MapWrapper({ pins }: { pins: DayPin[] }) {
  return <TripMap pins={pins} />
}