import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient } from "@/lib/supabase"
import { markContentAsDownloaded } from "@/app/[lang]/actions"

export async function POST(request: NextRequest) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get content ID from query params
  const contentId = request.nextUrl.searchParams.get("id")
  if (!contentId) {
    return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
  }
  
  // Get language from query params
  const lang = request.nextUrl.searchParams.get("lang") || "en"

  // Fetch content
  const { data: content, error } = await supabase.from("content").select("*").eq("id", contentId).single()

  if (error || !content) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 })
  }

  // Simulate download size based on content type
  let sizeBytes = 0
  switch (content.type) {
    case "course":
      sizeBytes = 5 * 1024 * 1024 // 5 MB
      break
    case "lesson":
      sizeBytes = 2 * 1024 * 1024 // 2 MB
      break
    case "quiz":
      sizeBytes = 1 * 1024 * 1024 // 1 MB
      break
    default:
      sizeBytes = 1 * 1024 * 1024 // 1 MB
  }

  // Mark content as downloaded
  const result = await markContentAsDownloaded(contentId, sizeBytes)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.redirect(new URL(`/${lang}/downloads`, request.url))
}

