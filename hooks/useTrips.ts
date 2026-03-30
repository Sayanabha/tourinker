'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trip } from '@/types'
import { toast } from 'sonner'
import { generateSlug } from '@/lib/utils'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select('*, days(count)')
      .order('start_date', { ascending: false })

    if (error) {
      toast.error('Failed to load trips')
    } else {
      setTrips(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  async function createTrip(payload: {
    title: string
    destination: string
    description?: string
    start_date: string
    end_date?: string
    budget?: number
    currency?: string
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('trips')
      .insert({
        ...payload,
        user_id: user.id,
        currency: payload.currency ?? 'INR',
        public_slug: generateSlug(payload.title),
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase createTrip error:', JSON.stringify(error, null, 2))
      toast.error(`Failed to create trip: ${error.message}`)
      return null
    }

    toast.success('Trip created!')
    await fetchTrips()
    return data
  }

  async function updateTrip(id: string, payload: Partial<Trip>) {
    const { error } = await supabase
      .from('trips')
      .update(payload)
      .eq('id', id)

    if (error) { toast.error('Failed to update trip'); return false }
    toast.success('Trip updated')
    await fetchTrips()
    return true
  }

  async function deleteTrip(id: string) {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id)

    if (error) { toast.error('Failed to delete trip'); return false }
    toast.success('Trip deleted')
    await fetchTrips()
    return true
  }

  return { trips, loading, fetchTrips, createTrip, updateTrip, deleteTrip }
}

export function useTrip(tripId: string) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTrip = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trips')
      .select('*, days(*, day_images(*), costs(*))')
      .eq('id', tripId)
      .single()

    if (error) {
      toast.error('Failed to load trip')
    } else {
      setTrip(data)
    }
    setLoading(false)
  }, [tripId])

  useEffect(() => { fetchTrip() }, [fetchTrip])

  return { trip, loading, fetchTrip }
}