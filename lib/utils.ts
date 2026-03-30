import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'dd MMM yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern)
}

export function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50) +
    '-' +
    Math.random().toString(36).slice(2, 7)
  )
}

export function getMoodEmoji(mood: string) {
  const map: Record<string, string> = {
    amazing: '🤩',
    good: '😊',
    okay: '😐',
    tired: '😴',
    rough: '😓',
  }
  return map[mood] ?? '😐'
}

export function getCategoryIcon(category: string) {
  const map: Record<string, string> = {
    food: '🍜',
    transport: '🚌',
    accommodation: '🏨',
    activities: '🎯',
    shopping: '🛍️',
    misc: '💸',
  }
  return map[category] ?? '💸'
}

export function truncate(str: string, length: number) {
  return str.length > length ? str.slice(0, length) + '...' : str
}