'use client'

import Link from 'next/link'
import { Day } from '@/types'
import { formatDate, formatCurrency, getMoodEmoji, getCategoryIcon } from '@/lib/utils'
import { MapPin, CloudSun, Wallet, ChevronRight, Sparkles } from 'lucide-react'

interface Props {
  day: Day & { day_images?: any[]; costs?: any[] }
  tripId: string
  isOwner: boolean
}

export default function DayCard({ day, tripId, isOwner }: Props) {
  const content = day.use_ai_version && day.ai_reframed ? day.ai_reframed : day.raw_notes
  const images = day.day_images ?? []
  const costs = day.costs ?? []
  const totalCost = costs.reduce((s: number, c: any) => s + (c.amount_inr ?? c.amount), 0)
  const preview = content.length > 120 ? content.slice(0, 120) + '…' : content

  return (
    <Link href={`/trips/${tripId}/days/${day.id}`}>
      <div className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-stone-300 hover:shadow-md transition-all duration-200 cursor-pointer">
        {/* Hero image */}
        {images.length > 0 && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={images[0].url}
              alt={images[0].caption ?? 'Day photo'}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
                +{images.length - 1} more
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          {/* Date + mood row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
                {formatDate(day.date, 'EEE, dd MMM')}
              </span>
              {day.use_ai_version && (
                <span className="flex items-center gap-0.5 text-[10px] text-violet-500 font-medium">
                  <Sparkles className="w-3 h-3" /> AI
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {day.mood && (
                <span className="text-base">{getMoodEmoji(day.mood)}</span>
              )}
              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
            </div>
          </div>

          {/* Title */}
          {day.title && (
            <h3 className="font-medium text-stone-900 mb-1.5">{day.title}</h3>
          )}

          {/* Preview text */}
          <p className="text-sm text-stone-500 leading-relaxed mb-3">{preview}</p>

          {/* Footer chips */}
          <div className="flex items-center gap-3 flex-wrap">
            {day.location && (
              <span className="flex items-center gap-1 text-xs text-stone-400">
                <MapPin className="w-3 h-3" />
                {day.location.name}
              </span>
            )}
            {day.weather && (
              <span className="flex items-center gap-1 text-xs text-stone-400">
                <span>{day.weather.icon}</span>
                {day.weather.temp_c}°C
              </span>
            )}
            {totalCost > 0 && (
              <span className="flex items-center gap-1 text-xs text-stone-400 ml-auto">
                <Wallet className="w-3 h-3" />
                {formatCurrency(totalCost, 'INR')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}