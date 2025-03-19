"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContent, saveProgress, queueAction } from "@/lib/indexeddb";
import {
  downloadContent as downloadToIndexedDB,
  getDownloadedContent,
} from "@/lib/download-service";
import { useAuth } from "@/hooks/use-auth";
import { useOffline } from "@/hooks/use-offline";
import { toast } from "sonner";

export function useContent() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const { isOnline } = useOffline();
  const userId = session?.user?.id;

  const fetchContent = async (params: Record<string, string> = {}) => {
    // If offline, try to get from IndexedDB
    if (!isOnline) {
      try {
        const offlineContent = await getContent("content_list");
        if (offlineContent) {
          // Filter based on params
          let filteredContent = offlineContent.items || [];

          if (params.type) {
            filteredContent = filteredContent.filter(
              (item: { type: string }) => item.type === params.type
            );
          }

          if (params.language) {
            filteredContent = filteredContent.filter(
              (item: { language: string }) => item.language === params.language
            );
          }

          if (params.subject) {
            filteredContent = filteredContent.filter(
              (item: { subject: string }) => item.subject === params.subject
            );
          }

          if (params.query) {
            const query = params.query.toLowerCase();
            filteredContent = filteredContent.filter(
              (item: { title: string; description?: string }) =>
                item.title.toLowerCase().includes(query) ||
                (item.description &&
                  item.description.toLowerCase().includes(query))
            );
          }

          return filteredContent;
        }
      } catch (error) {
        console.error("Error fetching offline content:", error);
      }
    }

    // If online or no offline content, fetch from API
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`/api/content?${searchParams}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch content");
    }
    const data = await response.json();
    return data.data;
  };

  const fetchContentById = async (id: string) => {
    // First try to get from IndexedDB if offline
    if (!isOnline) {
      try {
        const offlineContent = await getDownloadedContent(id);
        if (offlineContent) {
          // Return in the same format as the API
          return {
            content: offlineContent,
            lessons: offlineContent.lessons || [],
            questions: offlineContent.questions || [],
            progress: null, // We don't have progress offline yet
          };
        }
      } catch (error) {
        console.error("Error fetching offline content:", error);
      }
    }

    // If online or no offline content, fetch from API
    const response = await fetch(`/api/content/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch content");
    }
    const data = await response.json();
    return data.data;
  };

  const useContentList = (params: Record<string, string> = {}) => {
    return useQuery({
      queryKey: ["content", params],
      queryFn: () => fetchContent(params),
    });
  };

  const useContentDetail = (id: string) => {
    return useQuery({
      queryKey: ["content", id],
      queryFn: () => fetchContentById(id),
      enabled: !!id,
    });
  };

  const updateProgressMutation = useMutation({
    mutationFn: async ({
      contentId,
      progressPercentage,
      completed,
    }: {
      contentId: string;
      progressPercentage: number;
      completed: boolean;
    }) => {
      // Create progress object
      const progress = {
        id: `${userId}-${contentId}`,
        user_id: userId,
        content_id: contentId,
        progress_percentage: progressPercentage,
        completed,
        last_accessed: new Date().toISOString(),
      };

      // Save progress to IndexedDB
      await saveProgress(progress);

      // If online, send to server
      if (isOnline) {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contentId, progressPercentage, completed }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update progress");
        }
      } else {
        // If offline, queue for later
        await queueAction({
          url: "/api/progress",
          method: "POST",
          body: { contentId, progressPercentage, completed },
          headers: { "Content-Type": "application/json" },
        });
      }

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["content", variables.contentId],
      });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update progress");
    },
  });

  const downloadContentMutation = useMutation({
    mutationFn: async ({ contentId }: { contentId: string }) => {
      if (!userId) {
        throw new Error("You must be logged in to download content");
      }

      // Download content to IndexedDB
      const success = await downloadToIndexedDB(contentId, userId);

      if (!success) {
        throw new Error("Failed to download content");
      }

      return true;
    },
    onSuccess: () => {
      toast("Content downloaded successfully for offline use.");
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
    },
    onError: (error: Error) => {
      toast(error.message || "Failed to download content");
    },
  });

  const removeDownloadMutation = useMutation({
    mutationFn: async (contentId: string) => {
      // If online, send to server
      if (isOnline) {
        const response = await fetch(`/api/downloads?contentId=${contentId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to remove download");
        }
      } else {
        // If offline, queue for later
        await queueAction({
          url: `/api/downloads?contentId=${contentId}`,
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      }

      return true;
    },
    onSuccess: () => {
      toast("Download removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove download");
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async ({
      quizId,
      score,
      answers,
    }: {
      quizId: string;
      score: number;
      answers: any[];
    }) => {
      // Save to IndexedDB first
      const quizResult = {
        id: `${userId}-${quizId}-${Date.now()}`,
        user_id: userId,
        quiz_id: quizId,
        score,
        completed_at: new Date().toISOString(),
        answers,
      };

      // If online, send to server
      if (isOnline) {
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quizId, score, answers }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to submit quiz");
        }
      } else {
        // If offline, queue for later
        await queueAction({
          url: "/api/quiz",
          method: "POST",
          body: quizResult,
          headers: { "Content-Type": "application/json" },
        });
      }

      return true;
    },
    onSuccess: () => {
      toast("Quiz submitted successfully.");
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit quiz");
    },
  });

  return {
    useContentList,
    useContentDetail,
    updateProgress: (
      contentId: string,
      progressPercentage: number,
      completed: boolean
    ) =>
      updateProgressMutation.mutate({
        contentId,
        progressPercentage,
        completed,
      }),
    downloadContent: (contentId: string) =>
      downloadContentMutation.mutate({ contentId }),
    removeDownload: (contentId: string) =>
      removeDownloadMutation.mutate(contentId),
    submitQuiz: (quizId: string, score: number, answers: any[]) =>
      submitQuizMutation.mutate({ quizId, score, answers }),
  };
}
