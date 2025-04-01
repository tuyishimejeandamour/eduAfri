import Link from "next/link";
import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { getDictionary } from '@/get-dictionary';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/[lang]/components/ui/card";
import { Button } from "@/app/[lang]/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/[lang]/components/ui/tabs";
import { Download, BookOpen, FileText, HelpCircle } from "lucide-react";
import { Locale } from "@/i18n-config";

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
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
            {dict.courses.title}
          </h1>
          <p
            className="text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {dict.courses.description}
          </p>
        </div>

        <Tabs
          defaultValue="courses"
          className="animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> {dict.courses.coursesTab}
            </TabsTrigger>
            <TabsTrigger value="lessons" className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> {dict.courses.lessonsTab}
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" /> {dict.courses.quizzesTab}
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
                        <Button variant="outline">{dict.courses.viewCourse}</Button>
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
                  <p className="text-muted-foreground">{dict.courses.noCourses}</p>
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
                        {dict.courses.lesson} • {lesson.language}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {lesson.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/content/${lesson.id}`}>
                        <Button variant="outline">{dict.courses.viewLesson}</Button>
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
                  <p className="text-muted-foreground">{dict.courses.noLessons}</p>
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
                      <CardDescription>
                        {dict.courses.quiz} • {quiz.language}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {quiz.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Link href={`/content/${quiz.id}`}>
                        <Button variant="outline">{dict.courses.takeQuiz}</Button>
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
                  <p className="text-muted-foreground">{dict.courses.noQuizzes}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
