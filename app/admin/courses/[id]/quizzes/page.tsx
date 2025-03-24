import Link from "next/link";
import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { deleteQuiz } from "@/app/admin/actions";

export default async function CourseQuizzesPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
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

  // Fetch quizzes for this course
  const { data: quizzes, error: quizzesError } = await supabase
    .from("content")
    .select("*")
    .eq("type", "quiz")
    .eq("course_id", id)
    .order("created_at", { ascending: false });

  if (quizzesError) {
    console.error("Error fetching quizzes:", quizzesError);
  }

  return (
    <div className="container py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Quizzes for {course.title}</h1>
      </div>

      <div className="flex justify-between items-center mb-8">
        <p className="text-muted-foreground">Manage quizzes for this course</p>
        <Link href={`/admin/courses/${id}/quizzes/create`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Quiz
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes && quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>{quiz.language}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {quiz.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Link href={`/admin/courses/${id}/quizzes/${quiz.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </Link>
                  <form action={deleteQuiz}>
                    <input type="hidden" name="id" value={quiz.id} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </form>
                </div>
                <Link
                  href={`/admin/courses/${id}/quizzes/${quiz.id}/questions`}
                >
                  <Button variant="ghost" size="sm" className="h-8">
                    Questions
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No quizzes found for this course
            </p>
            <Link href={`/admin/courses/${id}/quizzes/create`}>
              <Button>Create your first quiz</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
