import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, getMoodEmoji, getCategoryIcon } from '@/lib/utils'
import { Compass, TrendingUp, Calendar, Wallet } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: trips } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)

  const { data: days } = await supabase
    .from('days')
    .select('*')
    .eq('user_id', user.id)

  const { data: costs } = await supabase
    .from('costs')
    .select('*')
    .eq('user_id', user.id)

  const totalTrips = trips?.length ?? 0
  const totalDays = days?.length ?? 0
  const totalSpent = costs?.reduce((s, c) => s + (c.amount_inr ?? c.amount), 0) ?? 0
  const avgPerDay = totalDays > 0 ? totalSpent / totalDays : 0

  const moodBreakdown: Record<string, number> = (days ?? []).reduce(
    (acc: Record<string, number>, d) => {
      if (d.mood) acc[d.mood] = (acc[d.mood] ?? 0) + 1
      return acc
    },
    {}
  )

  const spendByCategory: Record<string, number> = (costs ?? []).reduce(
    (acc: Record<string, number>, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + (c.amount_inr ?? c.amount)
      return acc
    },
    {}
  )

  const destinations = [...new Set((trips ?? []).map((t) => t.destination))]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-0.5">Your travel story in numbers</p>
      </div>

      {totalTrips === 0 ? (
        <div className="text-center py-20">
          <Compass className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No trips yet — start exploring!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Trips', value: totalTrips, icon: Compass, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Days logged', value: totalDays, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Total spent', value: formatCurrency(totalSpent, 'INR'), icon: Wallet, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Avg per day', value: formatCurrency(avgPerDay, 'INR'), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-stone-200 p-4">
                <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-xl font-semibold text-stone-900">{value}</p>
                <p className="text-xs text-stone-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Destinations */}
          {destinations.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="text-sm font-medium text-stone-700 mb-3">Places visited</h2>
              <div className="flex flex-wrap gap-2">
                {destinations.map((d) => (
                  <span key={d} className="text-sm bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
                    📍 {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mood breakdown */}
          {Object.keys(moodBreakdown).length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="text-sm font-medium text-stone-700 mb-3">Mood across days</h2>
              <div className="flex gap-3 flex-wrap">
                {(Object.entries(moodBreakdown) as [string, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, count]) => (
                    <div key={mood} className="flex items-center gap-1.5 bg-stone-50 rounded-xl px-3 py-2">
                      <span className="text-lg">{getMoodEmoji(mood)}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-700 capitalize">{mood}</p>
                        <p className="text-xs text-stone-400">{count} {count === 1 ? 'day' : 'days'}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Spend by category */}
          {Object.keys(spendByCategory).length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="text-sm font-medium text-stone-700 mb-3">Spend by category</h2>
              <div className="space-y-2">
                {(Object.entries(spendByCategory) as [string, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => {
                    const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
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
        </div>
      )}
    </div>
  )
}