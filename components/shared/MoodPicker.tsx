'use client'

import { cn } from '@/lib/utils'

const MOODS = [
  { value: 'amazing', emoji: '🤩', label: 'Amazing' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'rough', emoji: '😓', label: 'Rough' },
]

interface Props {
  value?: string
  onChange: (mood: string) => void
}

export default function MoodPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value === value ? '' : mood.value)}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium transition-all',
            value === mood.value
              ? 'border-stone-900 bg-stone-900 text-white scale-105'
              : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
          )}
        >
          <span className="text-lg">{mood.emoji}</span>
          <span>{mood.label}</span>
        </button>
      ))}
    </div>
  )
}