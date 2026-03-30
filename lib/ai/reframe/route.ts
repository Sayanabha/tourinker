import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reframeEntry } from '@/lib/ai/reframe'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { raw_notes } = body

    if (!raw_notes || typeof raw_notes !== 'string') {
      return NextResponse.json(
        { error: 'raw_notes is required' },
        { status: 400 }
      )
    }

    const result = await reframeEntry(raw_notes)

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Reframe failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}