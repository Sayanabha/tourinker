import { WeatherData } from '@/types'

const WMO_CODES: Record<number, { condition: string; icon: string }> = {
  0:  { condition: 'Clear sky', icon: '☀️' },
  1:  { condition: 'Mainly clear', icon: '🌤️' },
  2:  { condition: 'Partly cloudy', icon: '⛅' },
  3:  { condition: 'Overcast', icon: '☁️' },
  45: { condition: 'Foggy', icon: '🌫️' },
  48: { condition: 'Icy fog', icon: '🌫️' },
  51: { condition: 'Light drizzle', icon: '🌦️' },
  53: { condition: 'Drizzle', icon: '🌦️' },
  55: { condition: 'Heavy drizzle', icon: '🌧️' },
  61: { condition: 'Light rain', icon: '🌧️' },
  63: { condition: 'Rain', icon: '🌧️' },
  65: { condition: 'Heavy rain', icon: '🌧️' },
  71: { condition: 'Light snow', icon: '🌨️' },
  73: { condition: 'Snow', icon: '❄️' },
  75: { condition: 'Heavy snow', icon: '❄️' },
  80: { condition: 'Rain showers', icon: '🌦️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
}

export async function fetchWeather(
  lat: number,
  lng: number,
  date: string
): Promise<WeatherData | null> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', lat.toString())
    url.searchParams.set('longitude', lng.toString())
    url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max')
    url.searchParams.set('hourly', 'relativehumidity_2m')
    url.searchParams.set('timezone', 'auto')
    url.searchParams.set('start_date', date)
    url.searchParams.set('end_date', date)

    const res = await fetch(url.toString())
    if (!res.ok) throw new Error('Weather fetch failed')

    const data = await res.json()
    const daily = data.daily
    const index = 0

    const wmoCode = daily.weathercode[index] as number
    const meta = WMO_CODES[wmoCode] ?? { condition: 'Unknown', icon: '🌡️' }

    const maxTemp = daily.temperature_2m_max[index]
    const minTemp = daily.temperature_2m_min[index]
    const avgTemp = Math.round((maxTemp + minTemp) / 2)

    // Average humidity from hourly (first 24 values = that day)
    const hourlyHumidity: number[] = data.hourly.relativehumidity_2m.slice(0, 24)
    const avgHumidity = Math.round(
      hourlyHumidity.reduce((a, b) => a + b, 0) / hourlyHumidity.length
    )

    return {
      temp_c: avgTemp,
      condition: meta.condition,
      icon: meta.icon,
      humidity: avgHumidity,
      wind_kph: Math.round(daily.windspeed_10m_max[index]),
    }
  } catch (err) {
    console.error('[Tourinker] Weather fetch error:', err)
    return null
  }
}