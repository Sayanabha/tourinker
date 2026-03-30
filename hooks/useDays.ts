'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Day } from '@/types'
import { toast } from 'sonner'

export function useDays(tripId: string) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function createDay(payload: {
    date: string
    title?: string
    raw_notes: string
    ai_reframed?: string
    use_ai_version?: boolean
    mood?: Day['mood']
    location?: Day['location']
    weather?: Day['weather']
  }) {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return null }

    const { data, error } = await supabase
      .from('days')
      .insert({ ...payload, trip_id: tripId, user_id: user.id })
      .select()
      .single()

    setLoading(false)
    if (error) {
      if (error.code === '23505') {
        toast.error('You already have an entry for this date')
      } else {
        toast.error('Failed to save entry')
      }
      return null
    }
    toast.success('Entry saved!')
    return data
  }

  async function updateDay(dayId: string, payload: Partial<Day>) {
    setLoading(true)
    const { data, error } = await supabase
      .from('days')
      .update(payload)
      .eq('id', dayId)
      .select()
      .single()

    setLoading(false)
    if (error) { toast.error('Failed to update entry'); return null }
    toast.success('Entry updated')
    return data
  }

  async function deleteDay(dayId: string) {
    const { error } = await supabase
      .from('days')
      .delete()
      .eq('id', dayId)

    if (error) { toast.error('Failed to delete entry'); return false }
    toast.success('Entry deleted')
    return true
  }

  async function fetchDay(dayId: string) {
    const { data, error } = await supabase
      .from('days')
      .select('*, day_images(*), costs(*)')
      .eq('id', dayId)
      .single()

    if (error) { toast.error('Failed to load entry'); return null }
    return data as Day
  }

  return { loading, createDay, updateDay, deleteDay, fetchDay }
}