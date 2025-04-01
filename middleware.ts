import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const response = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if exists
  const { data: { session }, error } = await supabase.auth.getSession()

  // Handle authentication for protected routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isPublicRoute = ['/'].includes(request.nextUrl.pathname)

  // Exclude static assets and API routes from middleware processing
  if (request.nextUrl.pathname.startsWith('/_next/static') || request.nextUrl.pathname.startsWith('/api')) {
    return response;
  }

  if (!session && !isAuthRoute && !isPublicRoute) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (session && isAuthRoute) {
    // Redirect authenticated users to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For admin routes, check role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session?.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}