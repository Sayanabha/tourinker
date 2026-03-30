'use client'

import { useState } from 'react'
import { useReframe } from '@/hooks/useReframe'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, Check, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  rawNotes: string
  onAccept: (reframed: string) => void
  onReject: () => void
}

export default function ReframePanel({ rawNotes, onAccept, onReject }: Props) {
  const { loading, result, reframe, reset } = useReframe()
  const [accepted, setAccepted] = useState(false)

  async function handleReframe() {
    setAccepted(false)
    await reframe(rawNotes)
  }

  function handleAccept() {
    if (!result) return
    setAccepted(true)
    onAccept(result.reframed)
  }

  function handleReject() {
    reset()
    setAccepted(false)
    onReject()
  }

  return (
    <div className="space-y-3">
      {/* Trigger button */}
      {!result && (
        <Button
          type="button"
          variant="outline"
          onClick={handleReframe}
          disabled={loading || rawNotes.trim().length < 10}
          className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? 'Reframing with AI…' : 'Reframe with AI'}
        </Button>
      )}

      {/* Result panel */}
      {result && (
        <div className={cn(
          'rounded-xl border p-4 space-y-3 transition-all',
          accepted
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-violet-200 bg-violet-50'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700">
              <Sparkles className="w-3.5 h-3.5" />
              AI reframed
              <span className="text-violet-400 font-normal">
                via {result.model_used === 'gemini' ? 'Gemini 2.5 Flash' : 'Groq (fallback)'}
              </span>
            </div>
            {accepted && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Using this version
              </span>
            )}
          </div>

          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
            {result.reframed}
          </p>

          {!accepted && (
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                onClick={handleAccept}
                className="gap-1.5 bg-violet-700 hover:bg-violet-800 text-white"
              >
                <Check className="w-3.5 h-3.5" /> Use this
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleReframe}
                className="gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleReject}
                className="gap-1.5 text-stone-500"
              >
                <X className="w-3.5 h-3.5" /> Discard
              </Button>
            </div>
          )}

          {accepted && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleReject}
              className="gap-1.5 text-stone-500 text-xs"
            >
              <X className="w-3.5 h-3.5" /> Revert to original
            </Button>
          )}
        </div>
      )}
    </div>
  )
}