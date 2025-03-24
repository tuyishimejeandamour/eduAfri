import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { QuizForm } from "@/app/admin/components/quiz-form";

export default async function EditQuizPage({
  params,
}: {
  params: { id: string; quizId: string };
}) {
  const { id, quizId } = params;
  const supabase = await getServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  // Fetch the quiz
  const { data: quiz, error: quizError } = await supabase
    .from("content")
    .select("*")
    .eq("id", quizId)
    .eq("type", "quiz")
    .single();

  if (quizError || !quiz) {
    redirect(`/admin/courses/${id}/quizzes`);
  }

  // Fetch languages for the dropdown
  const { data: languages } = await supabase
    .from("languages")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Edit Quiz</h1>
      <QuizForm quiz={quiz} courseId={id} languages={languages || []} />
    </div>
  );
}
