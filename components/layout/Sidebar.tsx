'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  BookOpen,
  MapPin,
  LogOut, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import SearchBar from '@/components/shared/SearchBar'
const links = [
  { href: '/trips', label: 'My Trips', icon: BookOpen },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-stone-200 flex flex-col p-4 z-40">
      
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 py-3 mb-6">
        <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-stone-100" />
        </div>
        <span className="font-semibold text-stone-900 tracking-tight">
          Tourinker
        </span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <SearchBar />
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-stone-100 pt-4 mt-4">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-stone-500 truncate">
            {user.email}
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}