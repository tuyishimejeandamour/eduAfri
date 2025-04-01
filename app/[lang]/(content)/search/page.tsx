import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import SearchPageClient from "./search-client";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const supabase = await getServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  // Fetch user profile to get language preference
  const { data: profile } = await supabase
    .from("profiles")
    .select("language_preference")
    .eq("id", user.id)
    .single();

  const language = profile?.language_preference || "en";

  // Search for content if query is provided
  let searchResults = null;
  if (q) {
    const { data } = await supabase
      .from("content")
      .select("*")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order("created_at", { ascending: false });

    searchResults = data;
  }

  // Fetch downloaded content
  const { data: downloads } = await supabase
    .from("downloaded_content")
    .select("content_id")
    .eq("user_id", user.id);

  const downloadedIds = downloads?.map((d) => d.content_id) || [];

  return (
    <Suspense fallback={<div>{dictionary.content.loading}</div>}>
      <SearchPageClient
        dictionary={dictionary.search}
        contentDictionary={dictionary.content}
        searchResults={searchResults}
        downloadedIds={downloadedIds}
        q={q || ""}
      />
    </Suspense>
  );
}
