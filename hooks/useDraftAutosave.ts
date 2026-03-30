'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

const DRAFT_KEY_PREFIX = 'tourinker:autosave:'

export interface DraftData {
  date: string
  title: string
  raw_notes: string
  mood: string
}

export function useDraftAutosave(tripId: string, data: DraftData) {
  const key = `${DRAFT_KEY_PREFIX}${tripId}`
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Autosave every 30 seconds if there's content
  useEffect(() => {
    if (!data.raw_notes.trim()) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ ...data, saved_at: new Date().toISOString() }))
        toast.info('Draft autosaved', { duration: 1500, id: 'autosave' })
      } catch {
        // localStorage full or unavailable — fail silently
      }
    }, 30000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [data, key])

  function saveNow(d: DraftData) {
    try {
      localStorage.setItem(key, JSON.stringify({ ...d, saved_at: new Date().toISOString() }))
    } catch {}
  }

  function loadDraft(): (DraftData & { saved_at: string }) | null {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(key)
    } catch {}
  }

  return { saveNow, loadDraft, clearDraft }
}