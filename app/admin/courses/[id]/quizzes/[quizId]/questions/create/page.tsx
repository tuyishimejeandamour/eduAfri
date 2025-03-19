import { getServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { QuestionForm } from "@/app/admin/components/question-form"

export default async function CreateQuestionPage({ params }: { params: { id: string; quizId: string } }) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth")
  }

  // Fetch the quiz
  const { data: quiz, error: quizError } = await supabase
    .from("content")
    .select("*")
    .eq("id", params.quizId)
    .eq("type", "quiz")
    .single()

  if (quizError || !quiz) {
    redirect(`/admin/courses/${params.id}/quizzes`)
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Add Question</h1>
      <p className="text-muted-foreground mb-8">For quiz: {quiz.title}</p>
      <QuestionForm quizId={params.quizId} courseId={params.id} />
    </div>
  )
}

