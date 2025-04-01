import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { CourseForm } from "@/app/[lang]/admin/components/course-form";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } =  await params;
  const supabase = await getServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  // Fetch the course
  const { data: course, error } = await supabase
    .from("content")
    .select("*")
    .eq("id", id)
    .eq("type", "course")
    .single();

  if (error || !course) {
    redirect("/admin/courses");
  }

  // Fetch languages for the dropdown
  const { data: languages } = await supabase
    .from("languages")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Edit Course</h1>
      <CourseForm course={course} languages={languages || []} />
    </div>
  );
}
