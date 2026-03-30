'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SearchResult {
  type: 'day' | 'trip'
  id: string
  tripId?: string
  title: string
  subtitle: string
  date?: string
  href: string
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const search = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      return
    }

    setLoading(true)

    const [{ data: days }, { data: trips }] = await Promise.all([
      supabase
        .from('days')
        .select('id, trip_id, date, title, raw_notes')
        .textSearch('search_vector', query, { type: 'websearch' })
        .limit(5),
      supabase
        .from('trips')
        .select('id, title, destination')
        .textSearch('search_vector', query, { type: 'websearch' })
        .limit(3),
    ])

    const dayResults: SearchResult[] = (days ?? []).map((d) => ({
      type: 'day',
      id: d.id,
      tripId: d.trip_id,
      title: d.title ?? `Entry — ${d.date}`,
      subtitle: d.raw_notes.slice(0, 80) + '…',
      date: d.date,
      href: `/trips/${d.trip_id}/days/${d.id}`,
    }))

    const tripResults: SearchResult[] = (trips ?? []).map((t) => ({
      type: 'trip',
      id: t.id,
      title: t.title,
      subtitle: t.destination,
      href: `/trips/${t.id}`,
    }))

    setResults([...tripResults, ...dayResults])
    setLoading(false)
  }, [])

  function clear() { setResults([]) }

  return { results, loading, search, clear }
}