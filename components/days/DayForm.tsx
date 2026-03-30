'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useDays } from '@/hooks/useDays'
import { useGeolocation } from '@/hooks/useGeolocation'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { useDraftAutosave } from '@/hooks/useDraftAutosave'
import { LocationData, WeatherData } from '@/types'
import MoodPicker from '@/components/shared/MoodPicker'
import WeatherChip from '@/components/shared/WeatherChip'
import ReframePanel from '@/components/ai/ReframePanel'
import CostForm, { CostEntry } from '@/components/costs/CostForm'
import ImageUploader, { UploadedImage } from '@/components/images/ImageUploader'
import EntryTemplates from '@/components/days/EntryTemplates'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Loader2, MapPin, Wallet,
  Image as ImageIcon, Sparkles, LocateFixed
} from 'lucide-react'

interface Props {
  tripId: string
  userId: string
  initialDate?: string
}

export default function DayForm({ tripId, userId, initialDate }: Props) {
  const router = useRouter()
  const { createDay } = useDays(tripId)
  const { getCurrentLocation, loading: geoLoading } = useGeolocation()
  const { isOnline, saveDraft } = useOfflineSync()
  const supabase = createClient()

  const today = initialDate ?? new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    date: today,
    title: '',
    raw_notes: '',
    mood: '' as any,
  })

  const { saveNow, loadDraft, clearDraft } = useDraftAutosave(tripId, form)

  const [aiReframed, setAiReframed] = useState('')
  const [useAi, setUseAi] = useState(false)
  const [location, setLocation] = useState<LocationData | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [costs, setCosts] = useState<CostEntry[]>([])
  const [images, setImages] = useState<UploadedImage[]>([])
  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState<'write' | 'costs' | 'photos'>('write')

  // Restore draft
  useEffect(() => {
    const draft = loadDraft()
    if (draft && draft.raw_notes.trim()) {
      setForm({
        date: draft.date ?? today,
        title: draft.title ?? '',
        raw_notes: draft.raw_notes,
        mood: draft.mood ?? '',
      })

      toast.info('Draft restored', {
        description: `Last saved ${new Date(draft.saved_at).toLocaleTimeString()}`,
        action: {
          label: 'Discard',
          onClick: () => {
            clearDraft()
            setForm({ date: today, title: '', raw_notes: '', mood: '' })
          },
        },
      })
    }
  }, [])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function fetchWeather(loc: LocationData) {
    setWeatherLoading(true)
    try {
      const res = await fetch(
        `/api/weather?lat=${loc.lat}&lng=${loc.lng}&date=${form.date}`
      )
      if (res.ok) {
        const data = await res.json()
        setWeather(data)
      }
    } catch {
      toast.error('Could not fetch weather')
    }
    setWeatherLoading(false)
  }

  async function handleDetectLocation() {
    const loc = await getCurrentLocation()
    if (loc) {
      setLocation(loc)
      toast.success(`📍 ${loc.name}`)
      await fetchWeather(loc)
    }
  }

  function handleAiAccept(reframed: string) {
    setAiReframed(reframed)
    setUseAi(true)
  }

  function handleAiReject() {
    setAiReframed('')
    setUseAi(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.raw_notes.trim()) {
      toast.error('Please write something about your day')
      return
    }

    if (!isOnline) {
      await saveDraft({
        trip_id: tripId,
        date: form.date,
        title: form.title,
        raw_notes: form.raw_notes,
        mood: form.mood,
      })
      return
    }

    setSaving(true)

    const day = await createDay({
      date: form.date,
      title: form.title || undefined,
      raw_notes: form.raw_notes,
      ai_reframed: aiReframed || undefined,
      use_ai_version: useAi,
      mood: form.mood || undefined,
      location: location ?? undefined,
      weather: weather ?? undefined,
    })

    if (!day) {
      setSaving(false)
      return
    }

    if (images.length > 0) {
      const imageRows = images.map((img) => ({
        day_id: day.id,
        user_id: userId,
        url: img.url,
        storage_path: img.storage_path,
        caption: img.caption || null,
        tags: img.tags,
      }))
      const { error } = await supabase.from('day_images').insert(imageRows)
      if (error) toast.error('Some images failed to save')
    }

    if (costs.length > 0) {
      const costRows = costs
        .filter((c) => c.amount && parseFloat(c.amount) > 0)
        .map((c) => ({
          day_id: day.id,
          trip_id: tripId,
          user_id: userId,
          amount: parseFloat(c.amount),
          currency: c.currency,
          amount_inr: parseFloat(c.amount),
          category: c.category,
          note: c.note || null,
        }))

      if (costRows.length > 0) {
        const { error } = await supabase.from('costs').insert(costRows)
        if (error) toast.error('Some costs failed to save')
      }
    }

    setSaving(false)
    clearDraft()
    router.push(`/trips/${tripId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Write */}
      {section === 'write' && (
        <div className="bg-white rounded-2xl border p-5 space-y-4">

          {/* ✅ Templates */}
          <EntryTemplates
            onApply={(text) =>
              update(
                'raw_notes',
                form.raw_notes
                  ? form.raw_notes + '\n\n' + text
                  : text
              )
            }
          />

          <Textarea
            value={form.raw_notes}
            onChange={(e) => update('raw_notes', e.target.value)}
            rows={8}
            required
          />

          <p className="text-xs text-right text-stone-400">
            {form.raw_notes.length} characters
          </p>

          <button
            type="button"
            onClick={() => saveNow(form)}
            className="text-xs text-stone-400 hover:text-stone-600"
          >
            Save draft
          </button>

          <Separator />

          <ReframePanel
            rawNotes={form.raw_notes}
            onAccept={handleAiAccept}
            onReject={handleAiReject}
          />
        </div>
      )}

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? 'Saving…' : isOnline ? 'Save entry' : 'Save as draft'}
      </Button>
    </form>
  )
}