import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // In a real app, this would sync user progress and downloaded content
  // For now, we'll just redirect back to the dashboard

  return NextResponse.redirect(new URL("/dashboard", request.url))
}

