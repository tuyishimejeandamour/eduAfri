import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Extract language from the URL path
  const pathParts = requestUrl.pathname.split('/')
  const lang = pathParts[1] // This will be the language code from the [lang] directory
  
  // Redirect to dashboard with the same language
  return NextResponse.redirect(new URL(`/${lang}/dashboard`, request.url))
}

