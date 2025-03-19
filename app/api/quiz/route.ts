import { getServerSupabaseClient } from "@/lib/supabase"
import { successResponse, errorResponse } from "@/lib/api-response"

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
    const { quizId, score, answers } = body

    const { error } = await supabase.from("user_quiz_results").insert({
      user_id: user.id,
      quiz_id: quizId,
      score,
      completed_at: new Date().toISOString(),
      answers,
    })

    if (error) {
      return errorResponse(error.message)
    }

    return successResponse({ message: "Quiz result submitted successfully" })
  } catch (error: any) {
    return errorResponse(error.message || "Failed to submit quiz result")
  }
}

