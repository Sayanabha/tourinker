import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, MapPin, Calendar, Wallet,
  Globe, Lock, BarChart2, Map
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency, getMoodEmoji } from '@/lib/utils'
import TripDayCard from '@/components/days/DayCard'
import TripActions from '@/components/trips/TripActions'

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trip } = await supabase
    .from('trips')
    .select('*, days(*, day_images(*), costs(*))')
    .eq('id', tripId)
    .single()

  if (!trip) notFound()

  const isOwner = trip.user_id === user.id
  if (!isOwner && !trip.is_public) notFound()

  const days = (trip.days ?? []).sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalSpent = days.reduce((sum: number, day: any) => {
    const dayCost = (day.costs ?? []).reduce(
      (s: number, c: any) => s + (c.amount_inr ?? c.amount), 0
    )
    return sum + dayCost
  }, 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/trips"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        All trips
      </Link>

      {/* Trip header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold text-stone-900 truncate">
                {trip.title}
              </h1>
              {trip.is_public ? (
                <Globe className="w-4 h-4 text-stone-400 flex-shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-stone-300 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-sm text-stone-500">{trip.destination}</span>
            </div>
          </div>
          {isOwner && <TripActions trip={trip} />}
        </div>

        {trip.description && (
          <p className="text-sm text-stone-600 leading-relaxed mb-4">
            {trip.description}
          </p>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
          <div className="text-center">
            <p className="text-lg font-semibold text-stone-900">{days.length}</p>
            <p className="text-xs text-stone-500">days logged</p>
          </div>
          <div className="text-center border-x border-stone-100">
            <p className="text-lg font-semibold text-stone-900">
              {formatCurrency(totalSpent, 'INR')}
            </p>
            <p className="text-xs text-stone-500">total spent</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-stone-900">
              {trip.budget
                ? formatCurrency(trip.budget, trip.currency)
                : '—'}
            </p>
            <p className="text-xs text-stone-500">budget</p>
          </div>
        </div>
      </div>

      {/* Action bar */}
      {isOwner && (
        <div className="flex items-center gap-2 mb-6">
          <Link href={`/trips/${tripId}/days/new`} className="flex-1">
            <Button className="w-full bg-stone-900 hover:bg-stone-800 gap-2">
              <Plus className="w-4 h-4" />
              Log today
            </Button>
          </Link>
          <Link href={`/trips/${tripId}/stats`}>
            <Button variant="outline" size="icon">
              <BarChart2 className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/trips/${tripId}/map`}>
            <Button variant="outline" size="icon">
              <Map className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Day timeline */}
      {days.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">✍️</p>
          <h3 className="font-medium text-stone-600 mb-1">No entries yet</h3>
          <p className="text-sm text-stone-400 mb-5">
            Start logging your days — even a few lines count
          </p>
          {isOwner && (
            <Link href={`/trips/${tripId}/days/new`}>
              <Button variant="outline">Log your first day</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day: any) => (
            <TripDayCard key={day.id} day={day} tripId={tripId} isOwner={isOwner} />
          ))}
        </div>
      )}
    </div>
  )
}