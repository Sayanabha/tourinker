import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_EMAILS = ['sayanabhachandraitsme@gmail.com']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
  const isPublicShare = request.nextUrl.pathname.startsWith('/share')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isCallback = request.nextUrl.pathname.startsWith('/callback')

  // Not logged in -- redirect to login
  if (!user && !isAuthPage && !isPublicShare && !isApiRoute && !isCallback) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Logged in but not on the allowlist -- sign them out and redirect
  if (user && !ALLOWED_EMAILS.includes(user.email ?? '')) {
    await supabase.auth.signOut()
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(url)
  }

  // Logged in and on allowlist but trying to access login page -- redirect to app
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/trips'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}