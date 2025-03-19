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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, HelpCircle, ArrowLeft } from "lucide-react";

export default async function CourseDetailPage({
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

  // Fetch lessons for this course
  const { data: lessons, error: lessonsError } = await supabase
    .from("content")
    .select("*")
    .eq("type", "lesson")
    .eq("course_id", id)
    .order("order_in_course", { ascending: true });

  if (lessonsError) {
    console.error("Error fetching lessons:", lessonsError);
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
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{course.title}</h1>
      </div>

      <div className="mb-8">
        <p className="text-muted-foreground">
          {course.subject} • {course.grade_level} • {course.language}
        </p>
        <p className="mt-4">{course.description}</p>
      </div>

      <Tabs defaultValue="lessons">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Lessons
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" /> Quizzes
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Link href={`/dashboard/courses/${id}/lessons/create`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Lesson
              </Button>
            </Link>
            <Link href={`/dashboard/courses/${id}/quizzes/create`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Quiz
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value="lessons" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons && lessons.length > 0 ? (
              lessons.map((lesson, index) => (
                <Card key={lesson.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        {lesson.order_in_course || index + 1}
                      </span>
                      {lesson.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {lesson.description}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/dashboard/courses/${id}/lessons/${lesson.id}/edit`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        Edit Lesson
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl font-medium mb-2">No lessons yet</p>
                <p className="text-muted-foreground mb-6">
                  Add your first lesson to get started
                </p>
                <Link href={`/dashboard/courses/${id}/lessons/create`}>
                  <Button>Add Lesson</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quizzes" className="mt-0">
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
                  <CardFooter>
                    <Link
                      href={`/dashboard/courses/${id}/quizzes/${quiz.id}/edit`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full">
                        Edit Quiz
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <HelpCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-xl font-medium mb-2">No quizzes yet</p>
                <p className="text-muted-foreground mb-6">
                  Add your first quiz to get started
                </p>
                <Link href={`/dashboard/courses/${id}/quizzes/create`}>
                  <Button>Add Quiz</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
