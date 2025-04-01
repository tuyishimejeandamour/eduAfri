import Link from "next/link";
import { getServerSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/[lang]/components/ui/card";
import { Button } from "@/app/[lang]/components/ui/button";
import { 
  FileText, 
  Plus, 
  BookOpen, 
  Users, 
  GraduationCap, 
  HelpCircle,
  BarChart3,
  Activity 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/[lang]/components/ui/tabs";

export default async function AdminDashboardPage() {
  const supabase = await getServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth");
  }

  // Fetch summary statistics
  const { count: courseCount } = await supabase
    .from("content")
    .select("*", { count: "exact", head: true })
    .eq("type", "course");

  const { count: quizCount } = await supabase
    .from("content")
    .select("*", { count: "exact", head: true })
    .eq("type", "quiz");

  const { count: questionCount } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Fetch latest courses
  const { data: latestCourses } = await supabase
    .from("content")
    .select("*")
    .eq("type", "course")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Link href="/admin/courses/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Course
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Educational materials available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Knowledge assessments created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questionCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Quiz questions in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered platform users
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Latest Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestCourses && latestCourses.length > 0 ? (
                    <div className="rounded-md border">
                      <div className="p-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="flex border-b">
                              <th className="flex-1 font-medium text-left pb-3">Title</th>
                              <th className="w-[100px] font-medium text-left pb-3 hidden md:table-cell">Subject</th>
                              <th className="w-[150px] font-medium text-right pb-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {latestCourses.map((course) => (
                              <tr key={course.id} className="flex items-center border-b last:border-0">
                                <td className="flex-1 py-3 truncate">{course.title}</td>
                                <td className="w-[100px] py-3 hidden md:table-cell">{course.subject}</td>
                                <td className="w-[150px] py-3 text-right space-x-2">
                                  <Link href={`/admin/courses/${course.id}/edit`}>
                                    <Button variant="outline" size="sm">View</Button>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No courses found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/admin/courses/create">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Create New Course
                  </Button>
                </Link>
                <Link href="/admin/courses">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" /> Manage Courses
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" /> Manage Users
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center items-center">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground mb-3 mx-auto" />
                <p className="text-muted-foreground">Analytics module will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center items-center">
              <div className="text-center">
                <Activity className="h-10 w-10 text-muted-foreground mb-3 mx-auto" />
                <p className="text-muted-foreground">Reports module will be available soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

