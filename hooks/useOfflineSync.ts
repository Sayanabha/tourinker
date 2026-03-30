'use client'

import { useState, useEffect } from 'react'
import { get, set, del, keys } from 'idb-keyval'
import { toast } from 'sonner'

export interface OfflineDraft {
  id: string
  trip_id: string
  date: string
  title?: string
  raw_notes: string
  mood?: string
  saved_at: string
}

const PREFIX = 'tourinker:draft:'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true)
  const [drafts, setDrafts] = useState<OfflineDraft[]>([])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const onOnline = () => { setIsOnline(true); toast.success('Back online') }
    const onOffline = () => { setIsOnline(false); toast.warning('You are offline — entries will be saved as drafts') }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  async function saveDraft(draft: Omit<OfflineDraft, 'id' | 'saved_at'>) {
    const id = `${draft.trip_id}-${draft.date}`
    const full: OfflineDraft = { ...draft, id, saved_at: new Date().toISOString() }
    await set(`${PREFIX}${id}`, full)
    await loadDrafts()
    toast.info('Saved as offline draft')
  }

  async function loadDrafts() {
    const allKeys = await keys()
    const draftKeys = (allKeys as string[]).filter((k) => k.startsWith(PREFIX))
    const loaded = await Promise.all(draftKeys.map((k) => get(k)))
    setDrafts(loaded.filter(Boolean) as OfflineDraft[])
  }

  async function deleteDraft(id: string) {
    await del(`${PREFIX}${id}`)
    await loadDrafts()
  }

  useEffect(() => { loadDrafts() }, [])

  return { isOnline, drafts, saveDraft, deleteDraft, loadDrafts }
}