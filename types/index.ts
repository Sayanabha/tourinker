export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  home_currency: string
  created_at: string
}

export interface Trip {
  id: string
  user_id: string
  title: string
  description?: string
  cover_image_url?: string
  destination: string
  start_date: string
  end_date?: string
  status: 'active' | 'completed' | 'planned'
  is_public: boolean
  public_slug?: string
  budget?: number
  currency: string
  created_at: string
  updated_at: string
  days?: Day[]
  _count?: { days: number }
}

export interface Day {
  id: string
  trip_id: string
  user_id: string
  date: string
  title?: string
  raw_notes: string
  ai_reframed?: string
  use_ai_version: boolean
  mood?: 'amazing' | 'good' | 'okay' | 'tired' | 'rough'
  weather?: WeatherData
  location?: LocationData
  created_at: string
  updated_at: string
  images?: DayImage[]
  costs?: Cost[]
}

export interface DayImage {
  id: string
  day_id: string
  user_id: string
  url: string
  caption?: string
  tags: string[]
  storage_path: string
  created_at: string
}

export interface Cost {
  id: string
  day_id: string
  trip_id: string
  user_id: string
  amount: number
  currency: string
  amount_inr?: number
  category: 'food' | 'transport' | 'accommodation' | 'activities' | 'shopping' | 'misc'
  note?: string
  created_at: string
}

export interface WeatherData {
  temp_c: number
  condition: string
  icon: string
  humidity: number
  wind_kph: number
}

export interface LocationData {
  lat: number
  lng: number
  name: string
  country?: string
}

export interface TripStats {
  total_days: number
  total_spent_inr: number
  avg_daily_spend: number
  top_category: string
  countries_visited: string[]
  mood_breakdown: Record<string, number>
  spend_by_category: Record<string, number>
  spend_by_day: { date: string; amount: number }[]
}

export interface ReframeResult {
  reframed: string
  model_used: 'gemini' | 'groq'
  success: boolean
}