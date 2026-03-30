'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useDays } from '@/hooks/useDays'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import MoodPicker from '@/components/shared/MoodPicker'
import ReframePanel from '@/components/ai/ReframePanel'
import CostForm, { CostEntry } from '@/components/costs/CostForm'
import ImageUploader, { UploadedImage } from '@/components/images/ImageUploader'
import WeatherChip from '@/components/shared/WeatherChip'
import { Loader2, Sparkles, Wallet, Image as ImageIcon } from 'lucide-react'

interface Props {
  tripId: string
  day: any
  userId: string
}

export default function DayEditForm({ tripId, day, userId }: Props) {
  const router = useRouter()
  const { updateDay } = useDays(tripId)
  const supabase = createClient()

  const [form, setForm] = useState({
    date: day.date,
    title: day.title ?? '',
    raw_notes: day.raw_notes,
    mood: day.mood ?? '',
  })

  const [aiReframed, setAiReframed] = useState(day.ai_reframed ?? '')
  const [useAi, setUseAi] = useState(day.use_ai_version ?? false)

  const [costs, setCosts] = useState<CostEntry[]>(
    (day.costs ?? []).map((c: any) => ({
      id: c.id,
      amount: c.amount.toString(),
      currency: c.currency ?? 'INR',
      category: c.category,
      note: c.note ?? '',
    }))
  )

  const [images, setImages] = useState<UploadedImage[]>(
    (day.day_images ?? []).map((img: any) => ({
      url: img.url,
      storage_path: img.storage_path,
      caption: img.caption ?? '',
      tags: img.tags ?? [],
    }))
  )

  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState<'write' | 'costs' | 'photos'>('write')

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
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
      toast.error('Notes cannot be empty')
      return
    }

    setSaving(true)

    // Update day core fields
    const updated = await updateDay(day.id, {
      title: form.title || undefined,
      raw_notes: form.raw_notes,
      ai_reframed: aiReframed || undefined,
      use_ai_version: useAi,
      mood: form.mood || undefined,
    })

    if (!updated) { setSaving(false); return }

    // Delete old costs and re-insert
    await supabase.from('costs').delete().eq('day_id', day.id)
    const validCosts = costs.filter((c) => c.amount && parseFloat(c.amount) > 0)
    if (validCosts.length > 0) {
      await supabase.from('costs').insert(
        validCosts.map((c) => ({
          day_id: day.id,
          trip_id: tripId,
          user_id: userId,
          amount: parseFloat(c.amount),
          currency: c.currency ?? 'INR',
          amount_inr: parseFloat(c.amount),
          category: c.category,
          note: c.note || null,
        }))
      )
    }

    // Handle new images (ones without existing storage_path in DB)
    const existingPaths = (day.day_images ?? []).map((i: any) => i.storage_path)
    const newImages = images.filter((img) => !existingPaths.includes(img.storage_path))
    if (newImages.length > 0) {
      await supabase.from('day_images').insert(
        newImages.map((img) => ({
          day_id: day.id,
          user_id: userId,
          url: img.url,
          storage_path: img.storage_path,
          caption: img.caption || null,
          tags: img.tags,
        }))
      )
    }

    setSaving(false)
    router.push(`/trips/${tripId}/days/${day.id}`)
  }

  const tabs = [
    { key: 'write', label: '✍️ Write' },
    { key: 'costs', label: '💸 Costs' },
    { key: 'photos', label: '📷 Photos' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date + Title */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date}
              disabled
              className="bg-stone-100 text-stone-500"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Lost in Udaipur"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="bg-stone-50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Mood</Label>
          <div className="overflow-x-auto pb-1">
            <MoodPicker value={form.mood} onChange={(m) => update('mood', m)} />
          </div>
        </div>

        {day.weather && <WeatherChip weather={day.weather} />}
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSection(tab.key as any)}
            className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all ${
              section === tab.key
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Write */}
      {section === 'write' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="raw_notes">Your notes</Label>
            <Textarea
              id="raw_notes"
              value={form.raw_notes}
              onChange={(e) => update('raw_notes', e.target.value)}
              rows={8}
              className="bg-stone-50 resize-none leading-relaxed"
              required
            />
            <p className="text-xs text-stone-400 text-right">
              {form.raw_notes.length} characters
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-stone-600">
              <Sparkles className="w-4 h-4 text-violet-500" /> AI Reframe
            </Label>
            <ReframePanel
              rawNotes={form.raw_notes}
              onAccept={handleAiAccept}
              onReject={handleAiReject}
            />
            {useAi && (
              <p className="text-xs text-emerald-600 font-medium">
                ✓ AI version will be saved
              </p>
            )}
          </div>
        </div>
      )}

      {/* Costs */}
      {section === 'costs' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
          <Label className="flex items-center gap-1.5">
            <Wallet className="w-4 h-4" /> Expenses
          </Label>
          <CostForm costs={costs} onChange={setCosts} />
          {costs.length > 0 && (
            <div className="pt-2 border-t border-stone-100 text-sm text-stone-600 font-medium">
              Total: ₹{costs
                .reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
                .toLocaleString('en-IN')}
            </div>
          )}
        </div>
      )}

      {/* Photos */}
      {section === 'photos' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3">
          <Label className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" /> Photos
          </Label>
          <ImageUploader images={images} onChange={setImages} userId={userId} />
        </div>
      )}

      <Button
        type="submit"
        disabled={saving}
        className="w-full bg-stone-900 hover:bg-stone-800 h-12 text-base font-medium"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
        ) : (
          'Save changes'
        )}
      </Button>
    </form>
  )
}