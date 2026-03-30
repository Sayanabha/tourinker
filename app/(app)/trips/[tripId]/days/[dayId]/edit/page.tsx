import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DayEditForm from '@/components/days/DayEditForm'

export default async function EditDayPage({
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

  if (!day || day.user_id !== user.id) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/trips/${tripId}/days/${dayId}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to entry
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">Edit entry</h1>
        <p className="text-sm text-stone-500 mt-1">{day.date}</p>
      </div>

      <DayEditForm tripId={tripId} day={day} userId={user.id} />
    </div>
  )
}