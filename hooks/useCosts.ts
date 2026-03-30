'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Cost } from '@/types'
import { toast } from 'sonner'

export function useCosts(tripId: string) {
  const [costs, setCosts] = useState<Cost[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchCosts = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false })

    if (error) toast.error('Failed to load costs')
    else setCosts(data ?? [])
    setLoading(false)
  }, [tripId])

  useEffect(() => { fetchCosts() }, [fetchCosts])

  async function addCost(payload: {
    day_id: string
    amount: number
    currency?: string
    category: Cost['category']
    note?: string
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Simple INR conversion — if currency is INR, amount_inr = amount
    // Otherwise store as-is (exchange rate feature can be added later)
    const amount_inr = payload.currency === 'INR' || !payload.currency
      ? payload.amount
      : payload.amount

    const { data, error } = await supabase
      .from('costs')
      .insert({
        ...payload,
        trip_id: tripId,
        user_id: user.id,
        currency: payload.currency ?? 'INR',
        amount_inr,
      })
      .select()
      .single()

    if (error) { toast.error('Failed to add cost'); return null }
    await fetchCosts()
    return data
  }

  async function deleteCost(costId: string) {
    const { error } = await supabase
      .from('costs')
      .delete()
      .eq('id', costId)

    if (error) { toast.error('Failed to delete cost'); return false }
    await fetchCosts()
    return true
  }

  const totalINR = costs.reduce((sum, c) => sum + (c.amount_inr ?? c.amount), 0)

  const byCategory = costs.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + (c.amount_inr ?? c.amount)
    return acc
  }, {} as Record<string, number>)

  return { costs, loading, totalINR, byCategory, fetchCosts, addCost, deleteCost }
}