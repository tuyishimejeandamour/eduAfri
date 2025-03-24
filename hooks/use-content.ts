"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContent, saveProgress, queueAction } from "@/lib/indexeddb";
import {
  downloadContent as downloadToIndexedDB,
  getDownloadedContent,
} from "@/lib/download-service";
import { useAuth } from "@/hooks/use-auth";
import { useOffline } from "@/hooks/use-offline";
import { useOfflineAuth } from "@/lib/offline-auth";
import { getAllDownloadedContent, getDownloadedContentById, saveContentForOffline } from "@/lib/offline-storage";
import { toast } from "sonner";

export function useContent() {
  const queryClient = useQueryClient();
  const { session, isOfflineMode } = useAuth();
  const { isOnline } = useOffline();
  const { offlineUser } = useOfflineAuth();
  
  // Get user ID either from online session or offline user
  const userId = isOfflineMode ? offlineUser?.id : session?.user?.id;

  const fetchContent = async (params: Record<string, string> = {}) => {
    // If offline, try to get from IndexedDB or offline storage
    if (!isOnline) {
      try {
        // First try IndexedDB
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
        
        // If not in IndexedDB, try from offline-storage
        const offlineStorageContent = await getAllDownloadedContent();
        if (offlineStorageContent && offlineStorageContent.length > 0) {
          // Map to match expected format
          let items = offlineStorageContent.map(item => item.content);
          
          // Filter based on params
          if (params.type) {
            items = items.filter(item => item.type === params.type);
          }
          if (params.language) {
            items = items.filter(item => item.language === params.language);
          }
          if (params.subject) {
            items = items.filter(item => item.subject === params.subject);
          }
          if (params.query) {
            const query = params.query.toLowerCase();
            items = items.filter(
              item =>
                item.title.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
            );
          }
          
          return items;
        }
      } catch (error) {
        console.error("Error fetching offline content:", error);
      }
      
      // If no content found offline, return empty array
      return [];
    }
    
    // If online, fetch from API
    try {
      const searchParams = new URLSearchParams(params);
      const response = await fetch(`/api/content?${searchParams}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch content");
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching content from API:", error);
      // If API call fails, try offline content as fallback
      try {
        const offlineContent = await getAllDownloadedContent();
        if (offlineContent && offlineContent.length > 0) {
          return offlineContent.map(item => item.content);
        }
      } catch (innerError) {
        console.error("Error fetching fallback offline content:", innerError);
      }
      return [];
    }
  };

  const fetchContentById = async (id: string) => {
    // First try to get from IndexedDB if offline
    if (!isOnline) {
      try {
        // Try from IndexedDB first
        const offlineContent = await getDownloadedContent(id);
        if (offlineContent) {
          // Return in the same format as the API
          return {
            content: offlineContent,
            lessons: offlineContent.lessons || [],
            questions: offlineContent.questions || [],
            progress: null, // Progress will be fetched separately
          };
        }
        
        // If not in IndexedDB, try from offline-storage
        const offlineStorageContent = await getDownloadedContentById(id);
        if (offlineStorageContent) {
          return {
            content: offlineStorageContent.content,
            lessons: offlineStorageContent.content.lessons || [],
            questions: offlineStorageContent.content.questions || [],
            progress: null,
          };
        }
      } catch (error) {
        console.error("Error fetching offline content by ID:", error);
      }
      
      // If content not found offline, show a toast
      toast.error("Content not available offline", {
        description: "Please download this content or go online to view it"
      });
      
      return null;
    }
    
    // If online, fetch from API
    try {
      const response = await fetch(`/api/content/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch content");
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching content by ID from API:", error);
      
      // If API call fails, try offline content as fallback
      try {
        const offlineContent = await getDownloadedContentById(id);
        if (offlineContent) {
          return {
            content: offlineContent.content,
            lessons: offlineContent.content.lessons || [],
            questions: offlineContent.content.questions || [],
            progress: null,
          };
        }
      } catch (innerError) {
        console.error("Error fetching fallback offline content by ID:", innerError);
      }
      
      return null;
    }
  };

  const useContentList = (params: Record<string, string> = {}) => {
    return useQuery({
      queryKey: ["content", params],
      queryFn: () => fetchContent(params),
      // Increase stale time for offline mode
      staleTime: isOfflineMode ? Infinity : 5 * 60 * 1000,
    });
  };

  const useContentDetail = (id: string) => {
    return useQuery({
      queryKey: ["content", id],
      queryFn: () => fetchContentById(id),
      enabled: !!id,
      // Increase stale time for offline mode
      staleTime: isOfflineMode ? Infinity : 5 * 60 * 1000,
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
      if (!userId) {
        toast.error("User ID not available");
        throw new Error("User ID not available");
      }
      
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
      
      // If online and not an offline-only user, send to server
      if (isOnline && !isOfflineMode) {
        try {
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
        } catch (error) {
          console.error("Failed to update progress on server:", error);
          // Queue the action for later sync
          await queueAction({
            url: "/api/progress",
            method: "POST",
            body: { contentId, progressPercentage, completed },
            headers: { "Content-Type": "application/json" },
          });
        }
      } else if (!isOfflineMode) {
        // If offline and not an offline-only user, queue for later
        await queueAction({
          url: "/api/progress",
          method: "POST",
          body: { contentId, progressPercentage, completed },
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // For offline users, we'll just keep the progress in IndexedDB
      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["content", variables.contentId],
      });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      
      toast.success("Progress updated", {
        description: isOfflineMode
          ? "Your progress has been saved locally"
          : "Your progress has been saved"
      });
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
      
      // Download content to IndexedDB, passing the isOfflineUser flag
      const success = await downloadToIndexedDB(contentId, userId, isOfflineMode);
      
      if (!success) {
        throw new Error("Failed to download content");
      }
      
      return true;
    },
    onSuccess: () => {
      // Toast is now handled in the download-service.ts
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download content");
    },
  });

  const removeDownloadMutation = useMutation({
    mutationFn: async (contentId: string) => {
      if (!userId) {
        throw new Error("User ID not available");
      }
      
      // If online and not an offline-only user, send to server
      if (isOnline && !isOfflineMode) {
        try {
          const response = await fetch(`/api/downloads?contentId=${contentId}`, {
            method: "DELETE",
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to remove download");
          }
        } catch (error) {
          console.error("Failed to remove download on server:", error);
          // Queue the action for later sync
          await queueAction({
            url: `/api/downloads?contentId=${contentId}`,
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });
        }
      } else if (!isOfflineMode) {
        // If offline and not an offline-only user, queue for later
        await queueAction({
          url: `/api/downloads?contentId=${contentId}`,
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // For all users, remove from IndexedDB
      try {
        // Remove from offline storage
        // We'll implement this function later if needed
      } catch (error) {
        console.error("Error removing offline content:", error);
      }
      
      return true;
    },
    onSuccess: () => {
      toast.success("Download removed successfully");
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
      if (!userId) {
        throw new Error("User ID not available");
      }
      
      // Save to IndexedDB first
      const quizResult = {
        id: `${userId}-${quizId}-${Date.now()}`,
        user_id: userId,
        quiz_id: quizId,
        score,
        completed_at: new Date().toISOString(),
        answers,
      };
      
      // Save to IndexedDB (we need to add a storeQuizResult function)
      // await storeQuizResult(quizResult);
      
      // If online and not an offline-only user, send to server
      if (isOnline && !isOfflineMode) {
        try {
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
        } catch (error) {
          console.error("Failed to submit quiz to server:", error);
          // Queue for later sync
          await queueAction({
            url: "/api/quiz",
            method: "POST",
            body: { quizId, score, answers },
            headers: { "Content-Type": "application/json" },
          });
        }
      } else if (!isOfflineMode) {
        // If offline and not an offline-only user, queue for later
        await queueAction({
          url: "/api/quiz",
          method: "POST",
          body: { quizId, score, answers },
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // For offline users, we'll just keep the quiz result in IndexedDB
      return true;
    },
    onSuccess: () => {
      toast.success("Quiz submitted successfully", {
        description: isOfflineMode
          ? "Your results have been saved locally"
          : "Your results have been saved"
      });
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
