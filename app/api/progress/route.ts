import { getServerSupabaseClient } from "@/lib/supabase";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const supabase = await getServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse("Not authenticated", 401);
    }

    const { data, error } = await supabase
      .from("user_progress")
      .select("*, content(*)")
      .eq("user_id", user.id)
      .order("last_accessed", { ascending: false });

    if (error) {
      return errorResponse(error.message);
    }

    return successResponse(data);
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch progress");
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse("Not authenticated", 401);
    }

    const body = await request.json();
    const { contentId, progressPercentage, completed } = body;

    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: user.id,
        content_id: contentId,
        progress_percentage: progressPercentage,
        completed,
        last_accessed: new Date().toISOString(),
      },
      {
        onConflict: "user_id,content_id",
      }
    );

    if (error) {
      return errorResponse(error.message);
    }

    return successResponse({ message: "Progress updated successfully" });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to update progress");
  }
}
