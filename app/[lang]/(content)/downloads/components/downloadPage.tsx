"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDownloads } from "@/hooks/use-downloads";
import { useOffline } from "@/hooks/use-offline";
import { toast } from "sonner";
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
import {
  Download,
  Trash2,
  WifiOff,
  Wifi,
  BookOpen,
  FileText,
  HelpCircle,
  Archive,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getDictionary } from "@/get-dictionary";

interface DownloadsProps {
   dictionary: Awaited<ReturnType<typeof getDictionary>>["downloads"]
}

// Group downloads by content type
interface Download {
  id: string;
  content?: {
    type: string;
    title: string;
    language: string;
  };
  content_id: string;
  downloaded_at: string;
  size_bytes?: number;
}

interface ContentType {
  type: 'course' | 'lesson' | 'quiz';
  title: string;
  language: string;
}

interface DownloadItem {
  id: string;
  content: ContentType;
  content_id: string;
  downloaded_at: string;
  size_bytes?: number;
}

export default function Downloads({ dictionary }: DownloadsProps) {
  const { downloads, clearDownloads, isLoading } = useDownloads();
  const { isOnline } = useOffline();
  const [lastSyncTime] = useState<string | null>(
    typeof window !== "undefined"
      ? localStorage.getItem("lastSyncTime")
      : null
  );
  
  // Track initialization state locally since it's not provided by the hook
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Create a removeDownload function since it's not provided by the hook
  const removeDownload = async (contentId: string) => {
    try {
      const response = await fetch(`/api/download?id=${contentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove download');
      }
      
      // Show success toast
      toast.success(dictionary.messages?.downloadRemoved || "Download removed successfully");
      
      // Refresh the downloads list
      window.location.reload();
    } catch (error) {
      console.error('Error removing download:', error);
      toast.error(dictionary.messages?.errorRemoving || "Failed to remove download");
    }
  };
  
  // Set initialized after component mounts
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Show loading state only if we're not initialized yet
  if (!isInitialized || (isLoading && !downloads?.length)) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-center">
          <p className="text-lg">{dictionary.loading}</p>
        </div>
      </div>
    );
  }

  const courses = downloads?.filter((d: Download) => d.content?.type === "course") || [];
  const lessons = downloads?.filter((d: Download) => d.content?.type === "lesson") || [];
  const quizzes = downloads?.filter((d: Download) => d.content?.type === "quiz") || [];

  const totalStorageBytes: number = downloads?.reduce(
    (total: number, d: DownloadItem) => total + (d.size_bytes || 0), 0) || 0;
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
              {dictionary.title}
            </h1>
            {!isOnline ? (
              <div className="flex items-center text-amber-500 text-sm rounded-full bg-amber-50 px-3 py-1">
                <WifiOff className="h-4 w-4 mr-1" /> {dictionary.offline.mode}
              </div>
            ) : (
              <div className="flex items-center text-green-500 text-sm rounded-full bg-green-50 px-3 py-1">
                <Wifi className="h-4 w-4 mr-1" /> {dictionary.offline.online}
              </div>
            )}
          </div>
          <p
            className="text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            {dictionary.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle>{dictionary.storage.title}</CardTitle>
              <CardDescription>
                {downloads?.length || 0} {dictionary.storage.description} {totalStorageMB} MB
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
                % {dictionary.storage.used}
              </p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <CardHeader>
              <CardTitle>{dictionary.contentTypes.title}</CardTitle>
              <CardDescription>
                {dictionary.contentTypes.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>{dictionary.contentTypes.courses}</span>
                </div>
                <span className="text-sm font-medium">{courses.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>{dictionary.contentTypes.lessons}</span>
                </div>
                <span className="text-sm font-medium">{lessons.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-500" />
                  <span>{dictionary.contentTypes.quizzes}</span>
                </div>
                <span className="text-sm font-medium">{quizzes.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle>{dictionary.sync.title}</CardTitle>
              <CardDescription>
                {isOnline ? dictionary.sync.online : dictionary.sync.offline}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {lastSyncTime 
                    ? `${dictionary.sync.lastSynced}: ${formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true })}` 
                    : dictionary.sync.notSyncedYet}
                </span>
              </div>
              {!isOnline && (
                <p className="text-xs text-amber-500">
                  {dictionary.sync.syncWhenOnline}
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
              {dictionary.tabs.all} ({downloads?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="courses">
              {dictionary.tabs.courses} ({courses.length})
            </TabsTrigger>
            <TabsTrigger value="lessons">
              {dictionary.tabs.lessons} ({lessons.length})
            </TabsTrigger>
            <TabsTrigger value="quizzes">
              {dictionary.tabs.quizzes} ({quizzes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {downloads && downloads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {downloads.map((download:DownloadItem, index:number) => (
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
                            {download.content?.type?.charAt(0).toUpperCase() +
                              download.content?.type?.slice(1)}{" "}
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
                        {dictionary.downloaded} {new Date(download.downloaded_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        {dictionary.size}: {((download.size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Link href={!isOnline ? `/offline/content/${download.content_id}` : `/content/${download.content_id}`}>
                        <Button variant="outline" size="sm">
                          {dictionary.actions.view}
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeDownload(download.content_id)
                        }
                        disabled={!isOnline}
                        title={!isOnline ? dictionary.messages?.needOnlineToRemove : dictionary.actions.remove}
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
                <p className="text-muted-foreground text-lg mb-2">{dictionary.empty.all}</p>
                <p className="text-muted-foreground mb-6 max-w-md">
                  {dictionary.description}
                </p>
                <Link href="/courses" className="mt-4">
                  <Button>{dictionary.empty.browseButton}</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-4 mt-6">
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((download:DownloadItem, index:number) => (
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
                            {dictionary.contentTypes.courses} • {download.content?.language}
                          </CardDescription>
                        </div>
                        <div className="bg-muted p-1 rounded-md">
                          <BookOpen className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {dictionary.downloaded} {new Date(download.downloaded_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        {dictionary.size}: {((download.size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Link href={!isOnline ? `/offline/content/${download.content_id}` : `/content/${download.content_id}`}>
                        <Button variant="outline" size="sm">
                          {dictionary.actions.view}
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeDownload(download.content_id)
                        }
                        disabled={!isOnline}
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
                <p className="text-muted-foreground text-lg mb-2">{dictionary.empty.courses}</p>
                <Link href="/courses" className="mt-4">
                  <Button>{dictionary.empty.browseButton}</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4 mt-6">
            {lessons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map((download:DownloadItem, index:number) => (
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
                            {dictionary.contentTypes.lessons} • {download.content?.language}
                          </CardDescription>
                        </div>
                        <div className="bg-muted p-1 rounded-md">
                          <FileText className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {dictionary.downloaded} {new Date(download.downloaded_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        {dictionary.size}: {((download.size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Link href={!isOnline ? `/offline/content/${download.content_id}` : `/content/${download.content_id}`}>
                        <Button variant="outline" size="sm">
                          {dictionary.actions.view}
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeDownload(download.content_id)
                        }
                        disabled={!isOnline}
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
                <p className="text-muted-foreground text-lg mb-2">{dictionary.empty.lessons}</p>
                <Link href="/courses" className="mt-4">
                  <Button>{dictionary.empty.browseButton}</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4 mt-6">
            {quizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((download:DownloadItem, index:number) => (
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
                            {dictionary.contentTypes.quizzes} • {download.content?.language}
                          </CardDescription>
                        </div>
                        <div className="bg-muted p-1 rounded-md">
                          <HelpCircle className="h-4 w-4" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        {dictionary.downloaded} {new Date(download.downloaded_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs">
                        {dictionary.size}: {((download.size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-0">
                      <Link href={!isOnline ? `/offline/content/${download.content_id}` : `/content/${download.content_id}`}>
                        <Button variant="outline" size="sm">
                          {dictionary.actions.view}
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeDownload(download.content_id)
                        }
                        disabled={!isOnline}
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
                <p className="text-muted-foreground text-lg mb-2">{dictionary.empty.quizzes}</p>
                <Link href="/courses" className="mt-4">
                  <Button>{dictionary.empty.browseButton}</Button>
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
              disabled={!isOnline}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {dictionary.actions.clearAll}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
