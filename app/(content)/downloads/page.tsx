"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useDownloads } from "@/hooks/use-downloads";
import { useContent } from "@/hooks/use-content";
import { useOffline } from "@/hooks/use-offline";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Trash2, 
  WifiOff, 
  Wifi, 
  BookOpen, 
  FileText,
  HelpCircle,
  Archive, 
  Clock
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

export default function DownloadsPage() {
  const router = useRouter();
  const { isAuthenticated, isOfflineMode } = useAuth();
  const { isOnline } = useOffline();
  const { downloads, isLoading, clearDownloads } = useDownloads();
  const { removeDownload } = useContent();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only redirect if we're not in offline mode and user is not authenticated
    if (!isAuthenticated && !isOfflineMode && !downloads?.length) {
      router.push("/auth");
    }
    
    // Try to get the last sync time from localStorage
    const storedSyncTime = localStorage.getItem('lastSyncTime');
    if (storedSyncTime) {
      setLastSyncTime(storedSyncTime);
    }
    
    setIsInitialized(true);
  }, [isAuthenticated, router, isOfflineMode, downloads]);

  // Listen for sync events
  useEffect(() => {
    const handleSyncComplete = () => {
      const now = new Date().toISOString();
      localStorage.setItem('lastSyncTime', now);
      setLastSyncTime(now);
    };

    window.addEventListener('sync-completed', handleSyncComplete);
    return () => {
      window.removeEventListener('sync-completed', handleSyncComplete);
    };
  }, []);

  // Show loading state only if we're not initialized yet
  if (!isInitialized || (isLoading && !downloads?.length)) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading downloads...</p>
        </div>
      </div>
    );
  }

  // Group downloads by content type
  const courses = downloads?.filter(d => d.content?.type === "course") || [];
  const lessons = downloads?.filter(d => d.content?.type === "lesson") || [];
  const quizzes = downloads?.filter(d => d.content?.type === "quiz") || [];

  // Calculate total storage used
  const totalStorageBytes = downloads?.reduce(
    (total, d) => total + (d.size_bytes || 0), 0) || 0;
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
              Downloaded Content
            </h1>
            {!isOnline ? (
              <div className="flex items-center text-amber-500 text-sm rounded-full bg-amber-50 px-3 py-1">
                <WifiOff className="h-4 w-4 mr-1" /> Offline Mode
              </div>
            ) : (
              <div className="flex items-center text-green-500 text-sm rounded-full bg-green-50 px-3 py-1">
                <Wifi className="h-4 w-4 mr-1" /> Online
              </div>
            )}
          </div>
          <p
            className="text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Access your content offline anytime, anywhere
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>
                {downloads?.length || 0} items using{" "}
                {totalStorageMB} MB of storage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(
                      (totalStorageBytes / (100 * 1024 * 1024)) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.min(
                  (totalStorageBytes / (100 * 1024 * 1024)) * 100,
                  100
                ).toFixed(0)}
                % of 100 MB used
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <CardHeader>
              <CardTitle>Content Types</CardTitle>
              <CardDescription>
                Breakdown of your downloaded content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Courses</span>
                </div>
                <span className="text-sm font-medium">{courses.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Lessons</span>
                </div>
                <span className="text-sm font-medium">{lessons.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  <span>Quizzes</span>
                </div>
                <span className="text-sm font-medium">{quizzes.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle>Sync Status</CardTitle>
              <CardDescription>
                {isOnline ? "Your content is synced with the cloud" : "Offline mode active"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {lastSyncTime 
                    ? `Last synced: ${formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}` 
                    : "Not synced yet"}
                </span>
              </div>
              {!isOnline && (
                <p className="text-xs text-amber-500">
                  Your changes will be synced when you're back online
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs
          defaultValue="all"
          className="animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({downloads?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="courses">
              Courses ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="lessons">
              Lessons ({lessons.length})
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              Quizzes ({quizzes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {downloads && downloads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {downloads.map((download, index) => (
                  <Card
                    key={download.id}
                    className="animate-bounce-in overflow-hidden"
                    style={{ animationDelay: `${0.1 * (index % 6)}s` }}
                  >
                    <CardHeader className="py-4 pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{download.content?.title}</CardTitle>
                          <CardDescription>
                            {download.content?.type.charAt(0).toUpperCase() +
                              download.content?.type.slice(1)}{" "}
                            • {download.content?.language}
                          </CardDescription>
                        </div>
                        <div className="bg-muted p-1 rounded-md">
                          {download.content?.type === "course" && <BookOpen className="h-4 w-4" />}
                          {download.content?.type === "lesson" && <FileText className="h-4 w-4" />}
                          {download.content?.type === "quiz" && <HelpCircle className="h-4 w-4" />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Downloaded {new Date(download.downloaded_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        Size: {((download.size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Link href={`/content/${download.content_id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeDownload(download.content_id)
                        }
                        disabled={!isOnline && !isOfflineMode}
                        title={!isOnline && !isOfflineMode ? "You need to be online to remove downloads" : "Remove download"}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <Archive className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground text-lg mb-2">No downloaded content</p>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Download courses, lessons and quizzes to access them offline
                </p>
                <Link href="/courses" className="mt-4">
                  <Button>Browse Content</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-4 mt-6">
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((download, index) => (
                  <Card
                    key={download.id}
                    className="animate-bounce-in overflow-hidden"
                    style={{ animationDelay: `${0.1 * (index % 6)}s` }}
                  >
                    <CardHeader className="py-4 pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{download.content?.title}</CardTitle>
                          <CardDescription>
                            Course • {download.content?.language}
                          </CardDescription>
                        </div>
                        <div className="bg-muted p-1 rounded-md">
                          <BookOpen className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Downloaded {new Date(download.downloaded_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        Size: {((download.size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Link href={`/content/${download.content_id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeDownload(download.content_id)
                        }
                        disabled={!isOnline && !isOfflineMode}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground text-lg mb-2">No courses downloaded</p>
                <Link href="/courses" className="mt-4">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4 mt-6">
            {lessons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((download, index) => (
                  <Card
                    key={download.id}
                    className="animate-bounce-in overflow-hidden"
                    style={{ animationDelay: `${0.1 * (index % 6)}s` }}
                  >
                    <CardHeader className="py-4 pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{download.content?.title}</CardTitle>
                          <CardDescription>
                            Lesson • {download.content?.language}
                          </CardDescription>
                        </div>
                        <div className="bg-muted p-1 rounded-md">
                          <FileText className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Downloaded {new Date(download.downloaded_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        Size: {((download.size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Link href={`/content/${download.content_id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeDownload(download.content_id)
                        }
                        disabled={!isOnline && !isOfflineMode}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground text-lg mb-2">No lessons downloaded</p>
                <Link href="/courses" className="mt-4">
                  <Button>Browse Lessons</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4 mt-6">
            {quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((download, index) => (
                  <Card
                    key={download.id}
                    className="animate-bounce-in overflow-hidden"
                    style={{ animationDelay: `${0.1 * (index % 6)}s` }}
                  >
                    <CardHeader className="py-4 pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{download.content?.title}</CardTitle>
                          <CardDescription>
                            Quiz • {download.content?.language}
                          </CardDescription>
                        </div>
                        <div className="bg-muted p-1 rounded-md">
                          <HelpCircle className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Downloaded {new Date(download.downloaded_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        Size: {((download.size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Link href={`/content/${download.content_id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeDownload(download.content_id)
                        }
                        disabled={!isOnline && !isOfflineMode}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-center">
                <HelpCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground text-lg mb-2">No quizzes downloaded</p>
                <Link href="/courses" className="mt-4">
                  <Button>Browse Quizzes</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {downloads?.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              variant="destructive"
              onClick={clearDownloads}
              disabled={!isOnline && !isOfflineMode}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Downloads
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
