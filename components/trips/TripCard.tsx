'use client'

import Link from 'next/link'
import { Trip } from '@/types'
import { formatDate, formatCurrency, truncate } from '@/lib/utils'
import { MapPin, Calendar, Wallet, Globe, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-stone-100 text-stone-600 border-stone-200',
  planned: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function TripCard({ trip }: { trip: Trip }) {
  const dayCount = (trip as any).days?.[0]?.count ?? 0
  const totalSpent = (trip as any).costs?.reduce(
    (sum: number, c: any) => sum + (c.amount_inr ?? c.amount), 0
  ) ?? 0

  return (
    <Link href={`/trips/${trip.id}`}>
      <div className="group bg-white rounded-2xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-md transition-all duration-200 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 truncate group-hover:text-stone-700 transition-colors">
              {trip.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span className="text-sm text-stone-500 truncate">{trip.destination}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {trip.is_public ? (
              <Globe className="w-3.5 h-3.5 text-stone-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-stone-300" />
            )}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[trip.status]}`}
            >
              {trip.status}
            </span>
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <p className="text-sm text-stone-500 mb-3 leading-relaxed">
            {truncate(trip.description, 100)}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs text-stone-500">
              {formatDate(trip.start_date, 'dd MMM yy')}
              {trip.end_date && ` → ${formatDate(trip.end_date, 'dd MMM yy')}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-stone-400">
              {dayCount} {dayCount === 1 ? 'day' : 'days'}
            </span>
          </div>

          {trip.budget && (
            <div className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-xs text-stone-500">
                {formatCurrency(trip.budget, trip.currency)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}