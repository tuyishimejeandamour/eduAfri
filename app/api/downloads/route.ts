import { getServerSupabaseClient } from "@/lib/supabase"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET() {
  try {
    const supabase = await getServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse("Not authenticated", 401)
    }

    const { data, error } = await supabase.from("downloaded_content").select("*, content(*)").eq("user_id", user.id)

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse(data)
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch downloads")
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse("Not authenticated", 401)
    }

    const body = await request.json()
    const { contentId, sizeBytes } = body

    // Fetch content to make sure it exists
    const { data: content, error: contentError } = await supabase
      .from("content")
      .select("*")
      .eq("id", contentId)
      .single()

    if (contentError) {
      return errorResponse("Content not found")
    }

    // Calculate size if not provided
    let size = sizeBytes
    if (!size) {
      switch (content.type) {
        case "course":
          size = 5 * 1024 * 1024 // 5 MB
          break
        case "lesson":
          size = 2 * 1024 * 1024 // 2 MB
          break
        case "quiz":
          size = 1 * 1024 * 1024 // 1 MB
          break
        default:
          size = 1 * 1024 * 1024 // 1 MB
      }
    }

    const { error } = await supabase.from("downloaded_content").upsert(
      {
        user_id: user.id,
        content_id: contentId,
        downloaded_at: new Date().toISOString(),
        size_bytes: size,
      },
      {
        onConflict: "user_id,content_id",
      },
    )

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ message: "Content downloaded successfully" })
  } catch (error: any) {
    return errorResponse(error.message || "Failed to download content")
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await getServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse("Not authenticated", 401)
    }

    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get("contentId")

    if (!contentId) {
      return errorResponse("Content ID is required")
    }

    const { error } = await supabase
      .from("downloaded_content")
      .delete()
      .eq("user_id", user.id)
      .eq("content_id", contentId)

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ message: "Download removed successfully" })
  } catch (error: any) {
    return errorResponse(error.message || "Failed to remove download")
  }
}

