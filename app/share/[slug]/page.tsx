import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency, getMoodEmoji } from '@/lib/utils'
import { MapPin, Calendar, Wallet, Globe } from 'lucide-react'
import Link from 'next/link'

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('*, days(*, day_images(*), costs(*))')
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single()

  if (!trip) notFound()

  const days = (trip.days ?? []).sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalSpent = days.reduce((sum: number, day: any) => {
    return sum + (day.costs ?? []).reduce(
      (s: number, c: any) => s + (c.amount_inr ?? c.amount), 0
    )
  }, 0)

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-stone-900 rounded-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-stone-900 text-sm">Tourinker</span>
          </div>
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <Globe className="w-3.5 h-3.5" /> Public trip
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Trip header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h1 className="text-2xl font-semibold text-stone-900 mb-1">{trip.title}</h1>
          <div className="flex items-center gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-sm text-stone-500">{trip.destination}</span>
          </div>
          {trip.description && (
            <p className="text-sm text-stone-600 leading-relaxed mb-4">
              {trip.description}
            </p>
          )}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900">{days.length}</p>
              <p className="text-xs text-stone-500">days</p>
            </div>
            <div className="text-center border-x border-stone-100">
              <p className="text-lg font-semibold text-stone-900">
                {formatCurrency(totalSpent, 'INR')}
              </p>
              <p className="text-xs text-stone-500">spent</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-stone-900">
                {formatDate(trip.start_date, 'MMM yy')}
              </p>
              <p className="text-xs text-stone-500">started</p>
            </div>
          </div>
        </div>

        {/* Days */}
        <div className="space-y-4">
          {days.map((day: any) => {
            const content = day.use_ai_version && day.ai_reframed
              ? day.ai_reframed
              : day.raw_notes
            const images = day.day_images ?? []
            const costs = day.costs ?? []
            const dayCost = costs.reduce(
              (s: number, c: any) => s + (c.amount_inr ?? c.amount), 0
            )

            return (
              <div key={day.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                {images.length > 0 && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={images[0].url}
                      alt={images[0].caption ?? ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
                      {formatDate(day.date, 'EEE, dd MMM yyyy')}
                    </span>
                    {day.mood && (
                      <span className="text-lg">{getMoodEmoji(day.mood)}</span>
                    )}
                  </div>
                  {day.title && (
                    <h3 className="font-semibold text-stone-900 mb-2">{day.title}</h3>
                  )}
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                    {content}
                  </p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100 flex-wrap">
                    {day.location && (
                      <span className="flex items-center gap-1 text-xs text-stone-400">
                        <MapPin className="w-3 h-3" /> {day.location.name}
                      </span>
                    )}
                    {day.weather && (
                      <span className="text-xs text-stone-400">
                        {day.weather.icon} {day.weather.temp_c}°C
                      </span>
                    )}
                    {dayCost > 0 && (
                      <span className="flex items-center gap-1 text-xs text-stone-400 ml-auto">
                        <Wallet className="w-3 h-3" />
                        {formatCurrency(dayCost, 'INR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-stone-400 mb-2">Made with Tourinker</p>
          <Link
            href="/login"
            className="text-xs text-stone-600 underline underline-offset-2 hover:text-stone-900"
          >
            Start your own travel journal →
          </Link>
        </div>
      </div>
    </div>
  )
}