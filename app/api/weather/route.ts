import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchWeather } from '@/lib/weather'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const date = searchParams.get('date') ?? ''

  if (isNaN(lat) || isNaN(lng) || !date) {
    return NextResponse.json(
      { error: 'lat, lng, and date are required' },
      { status: 400 }
    )
  }

  const weather = await fetchWeather(lat, lng, date)
  if (!weather) {
    return NextResponse.json({ error: 'Could not fetch weather' }, { status: 502 })
  }

  return NextResponse.json(weather)
}