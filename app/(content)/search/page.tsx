import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, FileText, HelpCircle, SearchIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const { q } = await searchParams;
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
  console.log("User language preference:", language);

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
    <Suspense fallback={<div>Loading...</div>}>
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
            Search Content
          </h1>
          <p
            className="text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Find courses, lessons, and quizzes
          </p>
        </div>

        <form
          action="/search"
          className="animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex w-full items-center space-x-2">
            <Input
              type="search"
              name="q"
              placeholder="Search for content..."
              defaultValue={q || ""}
              className="flex-1"
            />
            <Button type="submit" className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4" /> Search
            </Button>
          </div>
        </form>

        {q && (
          <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-xl font-medium mb-4">
              Search results for &quot;{q}&quot;
            </h2>

            {searchResults && searchResults.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((result, index) => (
                  <Card
                    key={result.id}
                    className="content-card animate-bounce-in"
                    style={{ animationDelay: `${0.1 * (index % 6)}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-2">
                        {result.type === "course" ? (
                          <BookOpen className="h-5 w-5 text-primary mt-1" />
                        ) : result.type === "lesson" ? (
                          <FileText className="h-5 w-5 text-primary mt-1" />
                        ) : (
                          <HelpCircle className="h-5 w-5 text-primary mt-1" />
                        )}
                        <div>
                          <CardTitle>{result.title}</CardTitle>
                          <CardDescription>
                            {result.type.charAt(0).toUpperCase() +
                              result.type.slice(1)}{" "}
                            • {result.language}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {result.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/content/${result.id}`}>
                        <Button variant="outline">View Content</Button>
                      </Link>
                      {downloadedIds.includes(result.id) ? (
                        <Button variant="ghost" size="icon" disabled>
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      ) : (
                        <form
                          action={`/api/download?id=${result.id}`}
                          method="POST"
                        >
                          <Button variant="ghost" size="icon" type="submit">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </form>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <SearchIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No results found for {q}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try different keywords or browse all content
                </p>
                <Link href="/courses" className="mt-4">
                  <Button variant="outline">Browse All Content</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {!q && (
          <div
            className="space-y-6 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <h2 className="text-xl font-medium">Popular Searches</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/search?q=mathematics">
                <Button variant="outline" size="sm">
                  Mathematics
                </Button>
              </Link>
              <Link href="/search?q=science">
                <Button variant="outline" size="sm">
                  Science
                </Button>
              </Link>
              <Link href="/search?q=history">
                <Button variant="outline" size="sm">
                  History
                </Button>
              </Link>
              <Link href="/search?q=language">
                <Button variant="outline" size="sm">
                  Language
                </Button>
              </Link>
              <Link href="/search?q=programming">
                <Button variant="outline" size="sm">
                  Programming
                </Button>
              </Link>
              <Link href="/search?q=quiz">
                <Button variant="outline" size="sm">
                  Quizzes
                </Button>
              </Link>
            </div>

            <h2 className="text-xl font-medium mt-8">Browse by Subject</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Card
                className="content-card animate-bounce-in"
                style={{ animationDelay: "0.1s" }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> Mathematics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Algebra, Geometry, Calculus, and more
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/search?q=mathematics" className="w-full">
                    <Button variant="outline" className="w-full">
                      Browse
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card
                className="content-card animate-bounce-in"
                style={{ animationDelay: "0.2s" }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> Science
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Physics, Chemistry, Biology, and more
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/search?q=science" className="w-full">
                    <Button variant="outline" className="w-full">
                      Browse
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card
                className="content-card animate-bounce-in"
                style={{ animationDelay: "0.3s" }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" /> Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    English, French, Swahili, and more
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/search?q=language" className="w-full">
                    <Button variant="outline" className="w-full">
                      Browse
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}
