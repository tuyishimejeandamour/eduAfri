import Link from "next/link"
import { getServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Plus, Settings, Users } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated and has admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth")
  }

  // Get counts for dashboard stats
  const { count: coursesCount } = await supabase
    .from("content")
    .select("*", { count: "exact", head: true })
    .eq("type", "course")

  const { count: lessonsCount } = await supabase
    .from("content")
    .select("*", { count: "exact", head: true })
    .eq("type", "lesson")

  const { count: quizzesCount } = await supabase
    .from("content")
    .select("*", { count: "exact", head: true })
    .eq("type", "quiz")

  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/courses/create">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount || 0}</div>
          </CardContent>
          <CardFooter>
            <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-primary">
              View all courses
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessonsCount || 0}</div>
          </CardContent>
          <CardFooter>
            <Link href="/admin/lessons" className="text-sm text-muted-foreground hover:text-primary">
              View all lessons
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzesCount || 0}</div>
          </CardContent>
          <CardFooter>
            <Link href="/admin/quizzes" className="text-sm text-muted-foreground hover:text-primary">
              View all quizzes
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount || 0}</div>
          </CardContent>
          <CardFooter>
            <Link href="/admin/users" className="text-sm text-muted-foreground hover:text-primary">
              View all users
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your educational content</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/admin/courses/create">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create New Course
              </Button>
            </Link>
            <Link href="/admin/quizzes/create">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create New Quiz
              </Button>
            </Link>
            <Link href="/admin/lessons/create">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create New Lesson
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates to your content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4">
              <p className="text-sm font-medium">New course created</p>
              <p className="text-sm text-muted-foreground">Introduction to Mathematics</p>
              <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm font-medium">Quiz updated</p>
              <p className="text-sm text-muted-foreground">Basic Math Quiz</p>
              <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
            </div>
            <div>
              <p className="text-sm font-medium">New user registered</p>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
              <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

