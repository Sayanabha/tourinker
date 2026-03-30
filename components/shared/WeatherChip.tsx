'use client'

import { WeatherData } from '@/types'

export default function WeatherChip({ weather }: { weather: WeatherData }) {
  return (
    <div className="flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5 text-sm">
      <span className="text-2xl">{weather.icon}</span>
      <div>
        <p className="font-medium text-sky-900">
          {weather.temp_c}°C · {weather.condition}
        </p>
        <p className="text-xs text-sky-600">
          💧 {weather.humidity}% humidity · 💨 {weather.wind_kph} km/h
        </p>
      </div>
    </div>
  )
}