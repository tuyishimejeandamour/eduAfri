import { getServerSupabaseClient } from "@/lib/supabase"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET(request: Request) {
  try {
    const supabase = await getServerSupabaseClient()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get("type") as "course" | "lesson" | "quiz" | undefined
    const language = searchParams.get("language") || undefined
    const subject = searchParams.get("subject") || undefined
    const query = searchParams.get("query") || undefined

    let dbQuery = supabase.from("content").select("*")

    if (type) {
      dbQuery = dbQuery.eq("type", type)
    }

    if (language) {
      dbQuery = dbQuery.eq("language", language)
    }

    if (subject) {
      dbQuery = dbQuery.eq("subject", subject)
    }

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    const { data, error } = await dbQuery.order("created_at", { ascending: false })

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse(data)
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch content")
  }
}

