import { getServerSupabaseClient } from "@/lib/supabase";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getServerSupabaseClient();
    const { id } = await params;

    const { data: content, error: contentError } = await supabase
      .from("content")
      .select("*")
      .eq("id", id)
      .single();

    if (contentError) {
      return errorResponse(contentError.message);
    }

    // If this is a course, fetch its lessons
    let lessons = null;
    if (content.type === "course") {
      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("type", "lesson")
        .eq("course_id", content.id)
        .order("order_in_course", { ascending: true });

      if (!error) {
        lessons = data;
      }
    }

    // If this is a quiz, fetch its questions
    let questions = null;
    if (content.type === "quiz") {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("quiz_id", content.id)
        .order("id", { ascending: true });

      if (!error) {
        questions = data;
      }
    }

    // Get user progress if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let progress = null;

    if (user) {
      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("content_id", id)
        .single();

      if (!error) {
        progress = data;
      }
    }

    return successResponse({
      content,
      lessons,
      questions,
      progress,
    });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch content");
  }
}
