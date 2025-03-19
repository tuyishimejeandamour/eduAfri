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

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return errorResponse(error.message);
    }

    return successResponse({ user, profile });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch profile");
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await getServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return errorResponse("Not authenticated", 401);
    }

    const body = await request.json();
    const { username, language_preference, download_preference } = body;

    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        language_preference,
        download_preference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      return errorResponse(error.message);
    }

    return successResponse({ message: "Profile updated successfully" });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to update profile");
  }
}
