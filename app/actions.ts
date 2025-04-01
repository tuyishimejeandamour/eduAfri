"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabaseClient } from "@/lib/supabase"

// Admin actions
export async function setAdminRole() {
  const supabase = await getServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: "admin",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}

// User profile actions
export async function updateUserProfile(formData: FormData) {
  const supabase = await getServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const username = formData.get("username") as string;
  const languagePreference = formData.get("language_preference") as string;
  const downloadPreference = formData.get("download_preference") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      language_preference: languagePreference,
      download_preference: downloadPreference,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

// Content actions
export async function fetchContentByType(
  type: "course" | "lesson" | "quiz",
  language?: string
) {
  const supabase = await getServerSupabaseClient();

  let query = supabase.from("content").select("*").eq("type", type);

  if (language) {
    query = query.eq("language", language);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function fetchContentById(id: string) {
  const supabase = await getServerSupabaseClient();

  const { data, error } = await supabase
    .from("content")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function searchContent(query: string, language?: string) {
  const supabase = await getServerSupabaseClient();

  let searchQuery = supabase
    .from("content")
    .select("*")
    .ilike("title", `%${query}%`);

  if (language) {
    searchQuery = searchQuery.eq("language", language);
  }

  const { data, error } = await searchQuery;

  if (error) {
    return { error: error.message };
  }

  return { data };
}

// Progress tracking
export async function updateUserProgress(
  contentId: string,
  progressPercentage: number,
  completed: boolean
) {
  const supabase = await getServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

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
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

// Download management
export async function markContentAsDownloaded(
  contentId: string,
  sizeBytes: number
) {
  const supabase = await getServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("downloaded_content").upsert(
    {
      user_id: user.id,
      content_id: contentId,
      downloaded_at: new Date().toISOString(),
      size_bytes: sizeBytes,
    },
    {
      onConflict: "user_id,content_id",
    }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/downloads");
  return { success: true };
}

export async function removeDownloadedContent(contentId: string) {
  const supabase = await getServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("downloaded_content")
    .delete()
    .eq("user_id", user.id)
    .eq("content_id", contentId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/downloads");
  return { success: true };
}

// Quiz submission
export async function submitQuizResult(
  quizId: string,
  score: number,
  answers: {
    question_id: string;
    selected_option: number;
    is_correct: boolean;
  }[]
) {
  const supabase = await getServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("user_quiz_results").insert({
    user_id: user.id,
    quiz_id: quizId,
    score,
    completed_at: new Date().toISOString(),
    answers,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
