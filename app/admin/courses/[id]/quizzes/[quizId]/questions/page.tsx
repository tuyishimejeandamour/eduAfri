import Link from "next/link";
import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { deleteQuestion } from "@/app/admin/actions";

export default async function QuizQuestionsPage({
  params,
}: {
  params: { id: string; quizId: string };
}) {
  const { id, quizId } = await params;
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

  // Fetch questions for this quiz
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("id", { ascending: true });

  if (questionsError) {
    console.error("Error fetching questions:", questionsError);
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link href={`/admin/courses/${id}/quizzes`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Questions for {quiz.title}</h1>
      </div>

      <div className="flex justify-between items-center mb-8">
        <p className="text-muted-foreground">Manage questions for this quiz</p>
        <Link href={`/admin/courses/${id}/quizzes/${quizId}/questions/create`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Question
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {questions && questions.length > 0 ? (
          questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                  {question.question_text}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options.map(
                    (option: string, optionIndex: number) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-md border ${
                          optionIndex === question.correct_answer
                            ? "bg-green-50 border-green-200"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span>{option}</span>
                          {optionIndex === question.correct_answer && (
                            <span className="ml-auto text-sm text-green-600 font-medium">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>

                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-700">
                      Explanation:
                    </p>
                    <p className="text-sm text-blue-600">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link
                  href={`/admin/courses/${id}/quizzes/${quizId}/questions/${question.id}/edit`}
                >
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                <form action={deleteQuestion}>
                  <input type="hidden" name="id" value={question.id} />
                  <input type="hidden" name="quizId" value={quizId} />
                  <input type="hidden" name="courseId" value={id} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </form>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No questions found for this quiz
            </p>
            <Link
              href={`/admin/courses/${id}/quizzes/${quizId}/questions/create`}
            >
              <Button>Add your first question</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
