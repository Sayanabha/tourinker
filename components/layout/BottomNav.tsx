'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard, Settings, MapPin, LogOut, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
const links = [
  { href: '/trips', label: 'Trips', icon: BookOpen },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/dashboard', label: 'Stats', icon: LayoutDashboard },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                active ? 'text-stone-900' : 'text-stone-400'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'stroke-[2.5px]')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}