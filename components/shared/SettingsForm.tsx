'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut } from 'lucide-react'

export default function SettingsForm({
  profile,
  userEmail,
}: {
  profile: any
  userEmail: string
}) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    home_currency: profile?.home_currency ?? 'INR',
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name, home_currency: form.home_currency })
      .eq('id', profile.id)

    setLoading(false)
    if (error) toast.error('Failed to save settings')
    else toast.success('Settings saved')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="text-sm font-medium text-stone-700 mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={userEmail} disabled className="bg-stone-100 text-stone-500" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Display name</Label>
            <Input
              id="full_name"
              placeholder="Your name"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              className="bg-stone-50"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Home currency</Label>
            <Select
              value={form.home_currency}
              onValueChange={(v) => setForm((p) => ({ ...p, home_currency: v }))}
            >
              <SelectTrigger className="bg-stone-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-800"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Save settings
          </Button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="text-sm font-medium text-stone-700 mb-4">Account</h2>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full gap-2 text-stone-600"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </Button>
      </div>
    </div>
  )
}