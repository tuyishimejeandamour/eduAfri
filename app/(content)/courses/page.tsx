import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, BookOpen, FileText, HelpCircle } from "lucide-react";

export default async function CoursesPage() {
  const supabase = await getServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  // Fetch courses
  const { data: courses } = await supabase
    .from("content")
    .select("*")
    .eq("type", "course")
    .order("created_at", { ascending: false });

  // Fetch lessons
  const { data: lessons } = await supabase
    .from("content")
    .select("*")
    .eq("type", "lesson")
    .order("created_at", { ascending: false });

  // Fetch quizzes
  const { data: quizzes } = await supabase
    .from("content")
    .select("*")
    .eq("type", "quiz")
    .order("created_at", { ascending: false });

  // Fetch downloaded content
  const { data: downloads } = await supabase
    .from("downloaded_content")
    .select("content_id")
    .eq("user_id", user.id);

  const downloadedIds = downloads?.map((d) => d.content_id) || [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
            Educational Content
          </h1>
          <p
            className="text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Browse and download courses, lessons, and quizzes
          </p>
        </div>

        <Tabs
          defaultValue="courses"
          className="animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Courses
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Lessons
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" /> Quizzes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses && courses.length > 0 ? (
                courses.map((course, index) => (
                  <Card
                    key={course.id}
                    className="content-card animate-bounce-in"
                    style={{ animationDelay: `${0.1 * (index % 6)}s` }}
                  >
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>
                        {course.subject} • {course.grade_level} •{" "}
                        {course.language}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {course.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/content/${course.id}`}>
                        <Button variant="outline">View Course</Button>
                      </Link>
                      {downloadedIds.includes(course.id) ? (
                        <Button variant="ghost" size="icon" disabled>
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      ) : (
                        <form
                          action={`/api/download?id=${course.id}`}
                          method="POST"
                        >
                          <Button variant="ghost" size="icon" type="submit">
                            <Download className="h-4 w-4" />
                          </Button>
                        </form>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center h-40 text-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No courses available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lessons && lessons.length > 0 ? (
                lessons.map((lesson, index) => (
                  <Card
                    key={lesson.id}
                    className="content-card animate-bounce-in"
                    style={{ animationDelay: `${0.1 * (index % 6)}s` }}
                  >
                    <CardHeader>
                      <CardTitle>{lesson.title}</CardTitle>
                      <CardDescription>
                        Lesson • {lesson.language}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {lesson.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/content/${lesson.id}`}>
                        <Button variant="outline">View Lesson</Button>
                      </Link>
                      {downloadedIds.includes(lesson.id) ? (
                        <Button variant="ghost" size="icon" disabled>
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      ) : (
                        <form
                          action={`/api/download?id=${lesson.id}`}
                          method="POST"
                        >
                          <Button variant="ghost" size="icon" type="submit">
                            <Download className="h-4 w-4" />
                          </Button>
                        </form>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center h-40 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No lessons available</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quizzes && quizzes.length > 0 ? (
                quizzes.map((quiz, index) => (
                  <Card
                    key={quiz.id}
                    className="content-card animate-bounce-in"
                    style={{ animationDelay: `${0.1 * (index % 6)}s` }}
                  >
                    <CardHeader>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription>Quiz • {quiz.language}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {quiz.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/content/${quiz.id}`}>
                        <Button variant="outline">Take Quiz</Button>
                      </Link>
                      {downloadedIds.includes(quiz.id) ? (
                        <Button variant="ghost" size="icon" disabled>
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      ) : (
                        <form
                          action={`/api/download?id=${quiz.id}`}
                          method="POST"
                        >
                          <Button variant="ghost" size="icon" type="submit">
                            <Download className="h-4 w-4" />
                          </Button>
                        </form>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center h-40 text-center">
                  <HelpCircle className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No quizzes available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
