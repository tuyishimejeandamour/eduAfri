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
import { Download, ArrowLeft, CheckCircle, WifiOff } from "lucide-react";
import { getDownloadByContentId } from "@/lib/indexeddb";

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { isAuthenticated } = useAuth();
  const { isOnline } = useOffline();
  const { useContentDetail, updateProgress, downloadContent } = useContent();
  const { data, isLoading } = useContentDetail(id);
  const [isDownloaded, setIsDownloaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  // Check if content is downloaded
  useEffect(() => {
    async function checkDownloadStatus() {
      try {
        const download = await getDownloadByContentId(id);
        setIsDownloaded(!!download);
      } catch (error) {
        console.error("Error checking download status:", error);
      }
    }

    checkDownloadStatus();
  }, [id]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading content...</p>
        </div>
      </div>
    );
  }

  const { content, lessons, questions, progress } = data;

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

        {!isOnline && (
          <div className="ml-auto flex items-center text-amber-500 text-sm">
            <WifiOff className="h-4 w-4 mr-1" /> Offline Mode
          </div>
        )}
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
                disabled={!isOnline && !isDownloaded}
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
