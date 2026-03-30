'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

const TEMPLATES = [
  {
    label: '🗺️ Full day',
    prompts: [
      'Where did I go today?',
      'What was the best moment?',
      'What did I eat?',
      'How did I feel overall?',
    ],
  },
  {
    label: '🍜 Food focus',
    prompts: [
      'What did I eat today?',
      'Best dish and where?',
      'Anything surprising or unusual?',
    ],
  },
  {
    label: '😌 Reflection',
    prompts: [
      'What surprised me today?',
      'What would I tell my past self?',
      'One thing I want to remember forever',
    ],
  },
  {
    label: '⚡ Quick log',
    prompts: [
      'Three things that happened:',
      'One word for today:',
    ],
  },
]

interface Props {
  onApply: (text: string) => void
}

export default function EntryTemplates({ onApply }: Props) {
  const [open, setOpen] = useState(false)

  function applyTemplate(prompts: string[]) {
    const text = prompts.map((p) => `${p}\n`).join('\n')
    onApply(text)
    setOpen(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
      >
        <Lightbulb className="w-3.5 h-3.5" />
        Use a template
        {open
          ? <ChevronUp className="w-3 h-3" />
          : <ChevronDown className="w-3 h-3" />
        }
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t.prompts)}
              className="text-left bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl p-3 transition-all group"
            >
              <p className="text-sm font-medium text-stone-700 mb-1.5">{t.label}</p>
              <div className="space-y-0.5">
                {t.prompts.slice(0, 2).map((p) => (
                  <p key={p} className="text-xs text-stone-400 truncate">• {p}</p>
                ))}
                {t.prompts.length > 2 && (
                  <p className="text-xs text-stone-300">+{t.prompts.length - 2} more</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}