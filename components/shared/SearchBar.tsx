'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { useRouter } from 'next/navigation'
import { Search, Loader2, BookOpen, Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { results, loading, search, clear } = useSearch()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    setOpen(true)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      search(val)
    }, 300)
  }

  function handleSelect(href: string) {
    setQuery('')
    setOpen(false)
    clear()
    router.push(href)
  }

  function handleClear() {
    setQuery('')
    clear()
    setOpen(false)
    inputRef.current?.focus()
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const showDropdown = open && query.length >= 2

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="Search trips and entries…"
          className="w-full pl-9 pr-8 py-2 text-sm bg-stone-100 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden z-50">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-stone-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching…
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-stone-400">
              No results for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r.href)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left border-b border-stone-100 last:border-0"
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                    r.type === 'trip' ? 'bg-blue-50' : 'bg-stone-100'
                  )}>
                    {r.type === 'trip'
                      ? <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      : <Calendar className="w-3.5 h-3.5 text-stone-600" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">{r.title}</p>
                    <p className="text-xs text-stone-400 truncate mt-0.5">{r.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}