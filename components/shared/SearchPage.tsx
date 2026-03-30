'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { useRouter } from 'next/navigation'
import { Search, Loader2, BookOpen, Calendar, X } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { results, loading, search, clear } = useSearch()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  function handleSelect(href: string) {
    router.push(href)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-stone-900 mb-6">Search</h1>

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search trips and entries…"
          className="w-full pl-10 pr-10 py-3 text-sm bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); clear() }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-stone-500 py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Searching…
        </div>
      )}

      {!loading && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-stone-400 text-sm">No results for "{query}"</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r.href)}
              className="w-full flex items-start gap-3 px-5 py-4 hover:bg-stone-50 transition-colors text-left border-b border-stone-100 last:border-0"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                r.type === 'trip' ? 'bg-blue-50' : 'bg-stone-100'
              }`}>
                {r.type === 'trip'
                  ? <BookOpen className="w-4 h-4 text-blue-600" />
                  : <Calendar className="w-4 h-4 text-stone-600" />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-900">{r.title}</p>
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{r.subtitle}</p>
                {r.date && (
                  <p className="text-xs text-stone-300 mt-1">{r.date}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {!query && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-stone-200 mx-auto mb-3" />
          <p className="text-sm text-stone-400">
            Search across all your trips and journal entries
          </p>
        </div>
      )}
    </div>
  )
}