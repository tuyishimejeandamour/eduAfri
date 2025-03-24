import Link from "next/link"
import { getServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, FileText, GraduationCap, Globe } from "lucide-react"
import { deleteCourse } from "@/app/admin/actions"

export default async function CoursesPage() {
  const supabase = await getServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth");
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Fetch courses with language details
  const { data: courses, error: coursesError } = await supabase
    .from("content")
    .select(`
      *,
      languages (
        name
      )
    `)
    .eq("type", "course")
    .order("created_at", { ascending: false });

  if (coursesError) {
    console.error("Error fetching courses:", coursesError);
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage your educational courses</p>
        </div>
        <Link href="/admin/courses/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses && courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.subject}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {course.description}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {course.grade_level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {course.languages?.name || course.language}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </Link>
                  <form action={deleteCourse as unknown as string}>
                    <input type="hidden" name="id" value={course.id} />
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
                <Link href={`/admin/courses/${course.id}/quizzes`}>
                  <Button variant="ghost" size="sm" className="h-8">
                    Quizzes
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No courses found</p>
            <Link href="/admin/courses/create">
              <Button>Create your first course</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

