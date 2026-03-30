import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import TripCard from '@/components/trips/TripCard'

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trips } = await supabase
    .from('trips')
    .select('*, days(count)')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">My Trips</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {trips?.length
              ? `${trips.length} ${trips.length === 1 ? 'trip' : 'trips'} logged`
              : 'No trips yet'}
          </p>
        </div>
        <Link href="/trips/new">
          <Button className="bg-stone-900 hover:bg-stone-800 gap-2">
            <Plus className="w-4 h-4" />
            New trip
          </Button>
        </Link>
      </div>

      {/* Trips list */}
      {!trips || trips.length === 0 ? (
        <div className="text-center py-20">
          <Compass className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="font-medium text-stone-600 mb-1">No trips yet</h3>
          <p className="text-sm text-stone-400 mb-6">
            Start logging your first adventure
          </p>
          <Link href="/trips/new">
            <Button variant="outline">Create your first trip</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip as any} />
          ))}
        </div>
      )}
    </div>
  )
}