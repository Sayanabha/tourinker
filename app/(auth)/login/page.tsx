'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, MapPin, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
const supabase = useMemo(() => createClient(), [])
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/callback` },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setMagicSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
      <div className="mb-10 flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center">
          <MapPin className="w-6 h-6 text-stone-100" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Tourinker
        </h1>
        <p className="text-sm text-stone-500">Your personal travel journal</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        {magicSent ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-4xl">📬</div>
            <p className="font-medium text-stone-900">Check your inbox</p>
            <p className="text-sm text-stone-500">
              We sent a magic link to{' '}
              <span className="font-medium text-stone-700">{email}</span>
            </p>
            <p className="text-xs text-stone-400">
              Click the link in the email to sign in. It expires in 1 hour.
            </p>
            <button
              onClick={() => { setMagicSent(false); setEmail('') }}
              className="text-xs text-stone-400 underline underline-offset-2 mt-2 hover:text-stone-600 transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-stone-900">Sign in</h2>
              <p className="text-sm text-stone-500">
                We'll send a magic link to your email — no password needed.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-stone-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-stone-50 border-stone-200"
              />
            </div>

            <Button
  type="submit"
  className="w-full bg-stone-900 hover:bg-stone-800 gap-2 font-medium"
  disabled={loading}
>
  {loading ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Sending…
    </>
  ) : (
    <>
      <Mail className="w-4 h-4" />
      Send magic link
    </>
  )}
</Button>
          </form>
        )}
      </div>

      <p className="mt-6 text-xs text-stone-400 text-center max-w-xs">
        Your travel memories are private and stored securely.
      </p>
    </div>
  )
}