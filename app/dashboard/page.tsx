"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useProgress } from "@/hooks/use-progress";
import { useContent } from "@/hooks/use-content";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Award, Download } from "lucide-react";
import { useDownloads } from "@/hooks/use-downloads";

export default function DashboardPage() {
  const router = useRouter();
  const { session, profile, isAuthenticated } = useAuth();
  const { progress, isLoading: progressLoading } = useProgress();
  const { downloads } = useDownloads();
  const { data: recommendedCourses, isLoading: coursesLoading } =
    useContent().useContentList({
      type: "course",
      limit: "4",
    });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  if (!profile || progressLoading || coursesLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-center">
            <p className="text-lg">Loading dashboard...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
            Welcome back,{" "}
            {profile?.profile?.username ||
              session?.user?.email?.split("@")[0] ||
              "User"}
          </h1>
          <p
            className="text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Continue your learning journey with EduAfri
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="animate-bounce-in"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Courses in progress
              </p>
            </CardContent>
          </Card>
          <Card
            className="animate-bounce-in"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progress?.filter((p) => p.completed).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Completed courses</p>
            </CardContent>
          </Card>
          <Card
            className="animate-bounce-in"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Downloaded
              </CardTitle>
              <Download className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold">
                {downloads?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Items available offline
              </p>
            </CardContent>
          </Card>
          <Card
            className="animate-bounce-in"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Language
              </CardTitle>
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold">
                {profile?.profile?.language_preference || "English"}
              </div>
              <p className="text-xs text-muted-foreground">Current language</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card
            className="col-span-1 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">
                Continue Learning
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Pick up where you left off
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              {progress && progress.length > 0 ? (
                progress.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 rounded-md border p-3 sm:p-4"
                  >
                    <div className="flex-1 space-y-1 w-full">
                      <p className="text-sm font-medium leading-none">
                        {item.content?.title}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {item.progress_percentage}% complete
                      </p>
                      <div className="progress-bar mt-2">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${item.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <Link
                      href={`/content/${item.content_id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Continue
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-center px-4">
                  <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No courses in progress
                  </p>
                  <Link href="/courses" className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className="col-span-1 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">
                Recommended for You
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Based on your interests and progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
              {recommendedCourses && recommendedCourses.length > 0 ? (
                recommendedCourses.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 rounded-md border p-3 sm:p-4 content-card"
                  >
                    <div className="flex-1 space-y-1 w-full">
                      <p className="text-sm font-medium leading-none">
                        {item.title}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}{" "}
                        • {item.language}
                      </p>
                    </div>
                    <Link
                      href={`/content/${item.id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 sm:h-40 text-center">
                  <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No recommendations yet
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="px-4 sm:px-6">
              <Link href="/courses" className="w-full">
                <Button variant="outline" className="w-full">
                  Browse All Courses
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
