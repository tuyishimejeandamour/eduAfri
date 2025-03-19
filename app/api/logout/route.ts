import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabaseClient()

  await supabase.auth.signOut()

  return NextResponse.redirect(new URL("/", request.url))
}

