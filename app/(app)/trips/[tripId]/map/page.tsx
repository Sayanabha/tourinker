import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import MapWrapper from '@/components/map/MapWrapper'

export default async function TripMapPage({
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
    .select('*')
    .eq('id', tripId)
    .single()

  if (!trip || trip.user_id !== user.id) notFound()

  const { data: days } = await supabase
    .from('days')
    .select('id, date, title, mood, location')
    .eq('trip_id', tripId)
    .not('location', 'is', null)

  const pins = (days ?? [])
    .filter((d) => d.location?.lat && d.location?.lng)
    .map((d) => ({
      dayId: d.id,
      tripId,
      date: d.date,
      title: d.title,
      mood: d.mood,
      location: d.location,
    }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/trips/${tripId}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to trip
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">{trip.title}</h1>
        <p className="text-sm text-stone-500 mt-0.5">
          {pins.length} {pins.length === 1 ? 'location' : 'locations'} logged
        </p>
      </div>

      {pins.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
          <MapPin className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="font-medium text-stone-600 mb-1">No locations yet</p>
          <p className="text-sm text-stone-400">
            Tap Detect when logging a day to pin your location
          </p>
        </div>
      ) : (
        <div className="h-[70vh] rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
          <MapWrapper pins={pins} />
        </div>
      )}
    </div>
  )
}