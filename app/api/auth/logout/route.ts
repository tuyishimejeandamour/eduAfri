import { getServerSupabaseClient } from "@/lib/supabase";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST() {
  try {
    const supabase = await getServerSupabaseClient();
    await supabase.auth.signOut();
    return successResponse({ message: "Logged out successfully" });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to log out");
  }
}
