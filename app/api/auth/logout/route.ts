import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    await supabase.auth.signOut()

    // Clear all cookies related to auth
    const response = new NextResponse(
      JSON.stringify({ message: "Logged out successfully" }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )

    // Clear auth cookies explicitly
    response.cookies.set('sb-access-token', '', { maxAge: 0 })
    response.cookies.set('sb-refresh-token', '', { maxAge: 0 })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to log out" },
      { status: 500 }
    )
  }
}
