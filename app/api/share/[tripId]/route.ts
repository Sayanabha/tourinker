import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params
  const supabase = await createClient()

  const { data: trip } = await supabase
    .from('trips')
    .select('id, public_slug')
    .eq('id', tripId)
    .eq('is_public', true)
    .single()

  if (!trip?.public_slug) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.redirect(
    new URL(`/share/${trip.public_slug}`, request.url)
  )
}