"use client";

import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useContent } from "@/hooks/use-content";
import { useOffline } from "@/hooks/use-offline";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, CheckCircle, WifiOff, RefreshCw } from "lucide-react";
import { getDownloadByContentId } from "@/lib/indexeddb";
import { getDownloadedContent } from "@/lib/download-service";
import { toast } from "sonner";

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { isAuthenticated } = useAuth();
  const { isOnline } = useOffline();
  const { useContentDetail, updateProgress, downloadContent } = useContent();
  const { data, isLoading, refetch } = useContentDetail(id);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [offlineContent, setOfflineContent] = useState<any>(null);
  const [lastOnlineStatus, setLastOnlineStatus] = useState(isOnline);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Only redirect to auth if online and not authenticated
  useEffect(() => {
    if (!isAuthenticated && isOnline) {
      router.push("/auth");
    }
  }, [isAuthenticated, router, isOnline]);

  // Check if content is downloaded and load offline content when offline
  useEffect(() => {
    async function checkDownloadStatus() {
      try {
        const download = await getDownloadByContentId(id);
        setIsDownloaded(!!download);

        // If offline and the content is downloaded, get it from IndexedDB
        if (!isOnline && download) {
          console.log("Offline mode, loading downloaded content");
          const content = await getDownloadedContent(id);
          if (content) {
            setOfflineContent({
              content,
              lessons: content.lessons || [],
              questions: content.questions || [],
              progress: null, // Progress should be handled separately
            });
          }
        } else if (isOnline) {
          // If we're online, clear the offline content state to use fresh data
          setOfflineContent(null);
        }
      } catch (error) {
        console.error("Error checking download status:", error);
      }
    }

    checkDownloadStatus();
  }, [id, isOnline]);

  // Listen for online/offline changes
  useEffect(() => {
    if (isOnline !== lastOnlineStatus) {
      setLastOnlineStatus(isOnline);
      
      // If we're back online, refresh the data
      if (isOnline) {
        setIsRefreshing(true);
        refetch().then(() => {
          setIsRefreshing(false);
          toast.success("Content refreshed", {
            description: "Showing the latest content from the server."
          });
        }).catch(() => {
          setIsRefreshing(false);
        });
      }
    }
  }, [isOnline, lastOnlineStatus, refetch]);

  // Listen for service worker messages
  useEffect(() => {
    const handleMessage = (event:any) => {
      const { data } = event;
      
      if (data.type === 'BACK_ONLINE') {
        // If we received a back online message from service worker, refresh the data
        refetch().catch(console.error);
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [refetch]);

  // Show downloaded content when offline
  const contentData = !isOnline && offlineContent ? offlineContent : data;

  const handleRefresh = () => {
    if (!isOnline) {
      toast.error("You're offline", {
        description: "Cannot refresh content while offline."
      });
      return;
    }
    
    setIsRefreshing(true);
    refetch().then(() => {
      setIsRefreshing(false);
      toast.success("Content refreshed");
    }).catch(() => {
      setIsRefreshing(false);
      toast.error("Failed to refresh content");
    });
  };

  if (isLoading && !contentData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!contentData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <WifiOff className="h-12 w-12 text-amber-500" />
        <h2 className="text-xl font-bold">Content Unavailable Offline</h2>
        <p className="text-center text-muted-foreground">
          This content hasn't been downloaded for offline use.
        </p>
        <Link href="/downloads">
          <Button>Go to Downloads</Button>
        </Link>
      </div>
    );
  }

  const { content, lessons, questions, progress } = contentData;

  const handleUpdateProgress = () => {
    const newProgress = (progress?.progress_percentage || 0) + 10;
    updateProgress(content.id, newProgress, newProgress >= 100);
  };

  const handleDownload = () => {
    downloadContent(content.id);
    setIsDownloaded(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/courses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight animate-fade-in">
          {content.title}
        </h1>

        <div className="ml-auto flex items-center gap-2">
          {!isOnline && (
            <div className="flex items-center text-amber-500 text-sm">
              <WifiOff className="h-4 w-4 mr-1" /> Offline Mode
            </div>
          )}
          
          {isOnline && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          )}
        </div>
      </div>

      <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{content.title}</CardTitle>
              <CardDescription>
                {content.type.charAt(0).toUpperCase() + content.type.slice(1)} •{" "}
                {content.language}
                {content.subject && ` • ${content.subject}`}
                {content.grade_level && ` • Grade ${content.grade_level}`}
              </CardDescription>
            </div>
            {isDownloaded ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" /> Downloaded
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
                disabled={!isOnline}
              >
                <Download className="h-4 w-4" /> Download
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose max-w-none dark:prose-invert">
            <p>{content.description}</p>

            {content.content_html && (
              <div dangerouslySetInnerHTML={{ __html: content.content_html }} />
            )}
          </div>

          {progress && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-1">Your Progress</p>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress.progress_percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {progress.progress_percentage}% complete
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleUpdateProgress}>
            {progress ? "Continue Learning" : "Start Learning"}
          </Button>
          {progress?.progress_percentage === 100 ? (
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle className="h-4 w-4" /> Completed
            </div>
          ) : null}
        </CardFooter>
      </Card>

      {content.type === "course" && lessons && lessons.length > 0 && (
        <div
          className="space-y-4 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-xl font-bold">Course Lessons</h2>
          <div className="space-y-2">
            {lessons.map(
              (
                lesson: {
                  id: Key | null | undefined;
                  title:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                },
                index: number
              ) => (
                <Card key={lesson.id} className="content-card">
                  <CardHeader className="py-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {index + 1}. {lesson.title}
                      </CardTitle>
                      <Link href={`/content/${lesson.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                </Card>
              )
            )}
          </div>
        </div>
      )}

      {content.type === "quiz" && questions && questions.length > 0 && (
        <div
          className="space-y-4 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-xl font-bold">Quiz Questions</h2>
          <Card>
            <CardHeader>
              <CardTitle>Quiz Instructions</CardTitle>
              <CardDescription>
                This quiz contains {questions.length} questions. Answer all
                questions to complete the quiz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/quiz/${content.id}`}>
                <Button>Start Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
