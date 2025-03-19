import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { QuizForm } from "@/app/admin/components/quiz-form";

export default async function CreateQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await getServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  // Fetch the course
  const { data: course, error: courseError } = await supabase
    .from("content")
    .select("*")
    .eq("id", id)
    .eq("type", "course")
    .single();

  if (courseError || !course) {
    redirect("/admin/courses");
  }

  // Fetch languages for the dropdown
  const { data: languages } = await supabase
    .from("languages")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Create New Quiz</h1>
      <p className="text-muted-foreground mb-8">For course: {course.title}</p>
      <QuizForm courseId={id} languages={languages || []} />
    </div>
  );
}
