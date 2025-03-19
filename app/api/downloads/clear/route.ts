import { getServerSupabaseClient } from "@/lib/supabase"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function POST() {
  try {
    const supabase = await getServerSupabaseClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return errorResponse("Not authenticated", 401)
    }

    const { error } = await supabase.from("downloaded_content").delete().eq("user_id", user.id)

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ message: "All downloads cleared successfully" })
  } catch (error: any) {
    return errorResponse(error.message || "Failed to clear downloads")
  }
}

