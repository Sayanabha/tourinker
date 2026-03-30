import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatCurrency, getMoodEmoji, getCategoryIcon } from '@/lib/utils'

export default async function TripStatsPage({
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
    .select('*, costs(*)')
    .eq('trip_id', tripId)
    .order('date', { ascending: true })

  const { data: costs } = await supabase
    .from('costs')
    .select('*')
    .eq('trip_id', tripId)

  const totalSpent = costs?.reduce((s, c) => s + (c.amount_inr ?? c.amount), 0) ?? 0
  const avgPerDay = (days?.length ?? 0) > 0 ? totalSpent / days!.length : 0
  const budgetUsed = trip.budget ? (totalSpent / trip.budget) * 100 : null

  const spendByCategory = (costs ?? []).reduce((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + (c.amount_inr ?? c.amount)
    return acc
  }, {} as Record<string, number>)

  const moodBreakdown = (days ?? []).reduce((acc, d) => {
    if (d.mood) acc[d.mood] = (acc[d.mood] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const spendByDay = (days ?? []).map((d) => ({
    date: d.date,
    amount: (d.costs ?? []).reduce(
      (s: number, c: any) => s + (c.amount_inr ?? c.amount), 0
    ),
  }))

  const maxDaySpend = Math.max(...spendByDay.map((d) => d.amount), 1)

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
        <p className="text-sm text-stone-500 mt-0.5">Trip statistics</p>
      </div>

      <div className="space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Days logged', value: days?.length ?? 0 },
            { label: 'Total spent', value: formatCurrency(totalSpent, 'INR') },
            { label: 'Avg per day', value: formatCurrency(avgPerDay, 'INR') },
            { label: 'Budget', value: trip.budget ? formatCurrency(trip.budget, trip.currency) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-stone-200 p-4">
              <p className="text-xl font-semibold text-stone-900">{value}</p>
              <p className="text-xs text-stone-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Budget progress */}
        {budgetUsed !== null && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-stone-700">Budget used</h2>
              <span className={`text-sm font-semibold ${budgetUsed > 100 ? 'text-red-600' : 'text-stone-900'}`}>
                {Math.round(budgetUsed)}%
              </span>
            </div>
            <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-stone-400">
                {formatCurrency(totalSpent, 'INR')} spent
              </span>
              <span className="text-xs text-stone-400">
                {formatCurrency(trip.budget!, trip.currency)} budget
              </span>
            </div>
          </div>
        )}

        {/* Spend by day bar chart */}
        {spendByDay.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="text-sm font-medium text-stone-700 mb-4">Daily spend</h2>
            <div className="flex items-end gap-1.5 h-32">
              {spendByDay.map((d) => {
                const heightPct = maxDaySpend > 0
                  ? Math.max((d.amount / maxDaySpend) * 100, d.amount > 0 ? 4 : 0)
                  : 0
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }}>
                      <div
                        className="w-full bg-stone-900 rounded-t-sm group-hover:bg-stone-700 transition-colors"
                        style={{ height: `${heightPct}%` }}
                        title={`${d.date}: ${formatCurrency(d.amount, 'INR')}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-stone-400">
                {spendByDay[0]?.date}
              </span>
              <span className="text-xs text-stone-400">
                {spendByDay[spendByDay.length - 1]?.date}
              </span>
            </div>
          </div>
        )}

        {/* Spend by category */}
        {Object.keys(spendByCategory).length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="text-sm font-medium text-stone-700 mb-3">By category</h2>
            <div className="space-y-3">
              {Object.entries(spendByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amount]) => {
                  const pct = totalSpent > 0
                    ? Math.round((amount / totalSpent) * 100)
                    : 0
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-stone-600">
                          {getCategoryIcon(cat)} {cat}
                        </span>
                        <span className="text-sm font-medium text-stone-900">
                          {formatCurrency(amount, 'INR')}
                          <span className="text-xs text-stone-400 ml-1">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stone-900 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* Mood breakdown */}
        {Object.keys(moodBreakdown).length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="text-sm font-medium text-stone-700 mb-3">Mood log</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(moodBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([mood, count]) => (
                  <div
                    key={mood}
                    className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2"
                  >
                    <span className="text-xl">{getMoodEmoji(mood)}</span>
                    <div>
                      <p className="text-sm font-medium text-stone-700 capitalize">{mood}</p>
                      <p className="text-xs text-stone-400">
                        {count} {count === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}