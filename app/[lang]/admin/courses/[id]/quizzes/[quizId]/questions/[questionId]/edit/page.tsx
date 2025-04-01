import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { QuestionForm } from "@/app/[lang]/admin/components/question-form";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; quizId: string; questionId: string }>;
}) {
  const { id, quizId, questionId } = await params;
  const supabase = await getServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  // Fetch the question
  const { data: question, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("id", questionId)
    .eq("quiz_id", quizId)
    .single();

  if (questionError || !question) {
    redirect(`/admin/courses/${id}/quizzes/${quizId}/questions`);
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Edit Question</h1>
      <QuestionForm question={question} quizId={quizId} courseId={id} />
    </div>
  );
}
