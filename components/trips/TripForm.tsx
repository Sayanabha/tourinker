'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTrips } from '@/hooks/useTrips'
import { Loader2 } from 'lucide-react'

export default function TripForm() {
  const router = useRouter()
  const { createTrip } = useTrips()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    destination: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
    currency: 'INR',
    status: 'active' as 'active' | 'planned' | 'completed',
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const trip = await createTrip({
      title: form.title,
      destination: form.destination,
      description: form.description || undefined,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      currency: form.currency,
    })

    setLoading(false)
    if (trip) router.push(`/trips/${trip.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title">Trip name *</Label>
        <Input
          id="title"
          placeholder="e.g. Rajasthan Ride, Tokyo Winter"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          required
          className="bg-stone-50"
        />
      </div>

      {/* Destination */}
      <div className="space-y-1.5">
        <Label htmlFor="destination">Destination *</Label>
        <Input
          id="destination"
          placeholder="e.g. Jaipur, India"
          value={form.destination}
          onChange={(e) => update('destination', e.target.value)}
          required
          className="bg-stone-50"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What's this trip about?"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          className="bg-stone-50 resize-none"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="start_date">Start date *</Label>
          <Input
            id="start_date"
            type="date"
            value={form.start_date}
            onChange={(e) => update('start_date', e.target.value)}
            required
            className="bg-stone-50"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_date">End date</Label>
          <Input
            id="end_date"
            type="date"
            value={form.end_date}
            onChange={(e) => update('end_date', e.target.value)}
            min={form.start_date}
            className="bg-stone-50"
          />
        </div>
      </div>

      {/* Budget + Currency */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            placeholder="0"
            value={form.budget}
            onChange={(e) => update('budget', e.target.value)}
            min="0"
            className="bg-stone-50"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select value={form.currency} onValueChange={(v) => update('currency', v)}>
            <SelectTrigger className="bg-stone-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR (₹)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
              <SelectItem value="THB">THB (฿)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(v) => update('status', v as any)}>
          <SelectTrigger className="bg-stone-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-stone-900 hover:bg-stone-800"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Create trip
      </Button>
    </form>
  )
}