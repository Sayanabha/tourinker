'use client'

import { useState } from 'react'
import { ReframeResult } from '@/types'
import { toast } from 'sonner'

export function useReframe() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReframeResult | null>(null)

  async function reframe(rawNotes: string): Promise<ReframeResult | null> {
    if (!rawNotes || rawNotes.trim().length < 10) {
      toast.error('Write at least a few sentences before reframing')
      return null
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/ai/reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_notes: rawNotes }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error ?? 'Reframe failed')
        return null
      }

      setResult(data)
      toast.success(
        `Reframed using ${data.model_used === 'gemini' ? 'Gemini' : 'Groq (fallback)'}`
      )
      return data
    } catch {
      toast.error('Network error — please try again')
      return null
    } finally {
      setLoading(false)
    }
  }

  function reset() { setResult(null) }

  return { loading, result, reframe, reset }
}