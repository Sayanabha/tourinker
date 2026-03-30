import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Sparkles, Wallet } from 'lucide-react'
import { formatDate, formatCurrency, getMoodEmoji, getCategoryIcon } from '@/lib/utils'
import DayActions from '@/components/days/DayActions'

export default async function DayDetailPage({
  params,
}: {
  params: Promise<{ tripId: string; dayId: string }>
}) {
  const { tripId, dayId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: day } = await supabase
    .from('days')
    .select('*, day_images(*), costs(*)')
    .eq('id', dayId)
    .single()

  if (!day) notFound()

  const isOwner = day.user_id === user.id
  const content = day.use_ai_version && day.ai_reframed ? day.ai_reframed : day.raw_notes
  const costs = day.costs ?? []
  const images = day.day_images ?? []
  const totalCost = costs.reduce((s: number, c: any) => s + (c.amount_inr ?? c.amount), 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href={`/trips/${tripId}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to trip
      </Link>

      {/* Hero image */}
      {images.length > 0 && (
        <div className="rounded-2xl overflow-hidden mb-6 h-64">
          <img
            src={images[0].url}
            alt={images[0].caption ?? ''}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-stone-400 font-medium uppercase tracking-wide mb-1">
            {formatDate(day.date, 'EEEE, dd MMMM yyyy')}
          </p>
          {day.title && (
            <h1 className="text-2xl font-semibold text-stone-900">{day.title}</h1>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {day.mood && (
              <span className="text-lg">{getMoodEmoji(day.mood)}</span>
            )}
            {day.location && (
              <span className="flex items-center gap-1 text-sm text-stone-500">
                <MapPin className="w-3.5 h-3.5" />
                {day.location.name}{day.location.country ? `, ${day.location.country}` : ''}
              </span>
            )}
            {day.weather && (
              <span className="text-sm text-stone-500">
                {day.weather.icon} {day.weather.temp_c}°C · {day.weather.condition}
              </span>
            )}
          </div>
        </div>
        {isOwner && <DayActions day={day} tripId={tripId} />}
      </div>

      {/* AI badge */}
      {day.use_ai_version && (
        <div className="flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 mb-4 w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          AI-reframed entry
        </div>
      )}

      {/* Journal content */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {/* Extra images */}
      {images.length > 1 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-stone-600 mb-3">Photos</h2>
          <div className="grid grid-cols-2 gap-2">
            {images.slice(1).map((img: any) => (
              <div key={img.id} className="rounded-xl overflow-hidden h-36">
                <img src={img.url} alt={img.caption ?? ''} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Costs */}
      {costs.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-stone-700 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Expenses
            </h2>
            <span className="text-sm font-semibold text-stone-900">
              {formatCurrency(totalCost, 'INR')}
            </span>
          </div>
          <div className="space-y-2">
            {costs.map((cost: any) => (
              <div key={cost.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{getCategoryIcon(cost.category)}</span>
                  <div>
                    <p className="text-sm text-stone-700 capitalize">{cost.category}</p>
                    {cost.note && (
                      <p className="text-xs text-stone-400">{cost.note}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-stone-900">
                  {formatCurrency(cost.amount, cost.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}