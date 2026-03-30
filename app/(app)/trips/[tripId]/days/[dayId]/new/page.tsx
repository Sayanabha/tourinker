import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DayForm from '@/components/days/DayForm'

export default async function NewDayPage({
  params,
}: {
  params: Promise<{ tripId: string }>
}) {
  const { tripId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
        <h1 className="text-2xl font-semibold text-stone-900">Log a day</h1>
        <p className="text-sm text-stone-500 mt-1">
          Write freely — AI can help polish it after
        </p>
      </div>

      <DayForm tripId={tripId} userId={user.id} />
    </div>
  )
}