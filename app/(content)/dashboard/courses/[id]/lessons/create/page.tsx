import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { LessonForm } from "@/components/lesson-form";

export default async function CreateLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    redirect("/dashboard");
  }

  // Get the count of existing lessons to determine the order
  const { count } = await supabase
    .from("content")
    .select("*", { count: "exact", head: true })
    .eq("type", "lesson")
    .eq("course_id", id);

  const nextOrder = (count || 0) + 1;

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold mb-2">Add Lesson</h1>
      <p className="text-muted-foreground mb-8">For course: {course.title}</p>
      <LessonForm courseId={id} nextOrder={nextOrder} />
    </div>
  );
}
