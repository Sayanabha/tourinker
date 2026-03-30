import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TripForm from '@/components/trips/TripForm'

export default function NewTripPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/trips"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to trips
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-stone-900">New trip</h1>
        <p className="text-sm text-stone-500 mt-1">
          Set up your trip and start logging daily entries
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <TripForm />
      </div>
    </div>
  )
}