"use client";

import {
  saveContent,
  saveDownload,
  getContent,
  getDownloadByContentId,
  queueAction,
  getAllDownloads,
} from "./indexeddb";
import { saveContentForOffline } from "./offline-storage";
import { toast } from "sonner";

/**
 * Download content and store it in IndexedDB
 * @param contentId ID of the content to download
 * @param userId ID of the user downloading the content
 * @param isOfflineUser Whether the user is authenticated offline
 * @returns Promise resolving to true if download was successful
 */
export async function downloadContent(
  contentId: string,
  userId: string,
  isOfflineUser: boolean = false
): Promise<boolean> {
  try {
    // First check if we already have this content downloaded
    const existingDownload = await getDownloadByContentId(contentId);
    if (existingDownload) {
      toast.info("Content already available for offline use");
      return true;
    }

    // Show a loading toast
    const toastId = toast.loading("Downloading content for offline use...");

    // Fetch the content details
    const contentResponse = await fetch(`/api/content/${contentId}`);
    if (!contentResponse.ok) {
      toast.error("Failed to download content", {
        id: toastId,
        description: "Could not retrieve content data from server"
      });
      throw new Error("Failed to fetch content");
    }

    const contentData = await contentResponse.json();
    const { content, lessons, questions } = contentData.data;

    // Calculate total size
    let sizeBytes = 0;
    switch (content.type) {
      case "course":
        sizeBytes = 5 * 1024 * 1024 + // Base course size
          (lessons?.length || 0) * 2 * 1024 * 1024 + // Lessons size
          (lessons?.filter((l: { quiz_id?: string }) => l.quiz_id)?.length || 0) * 1 * 1024 * 1024; // Quizzes size
        break;
      case "lesson":
        sizeBytes = 2 * 1024 * 1024;
        break;
      case "quiz":
        sizeBytes = 1 * 1024 * 1024;
        break;
      default:
        sizeBytes = 1 * 1024 * 1024;
    }

    // Save the main content to IndexedDB
    await saveContent(content);

    // Also save to offline-storage for future use
    await saveContentForOffline({
      id: content.id,
      title: content.title,
      type: content.type,
      downloaded: true,
      downloadedAt: new Date().toISOString(),
      downloaded_at: new Date().toISOString(),
      user_id: userId,
      content_id: content.id,
      size_bytes: sizeBytes,
      content: content,
    });

    // For courses, download all related lessons and their quizzes
    if (content.type === "course" && lessons && lessons.length > 0) {
      toast.loading("Downloading related lessons...", { id: toastId });
      
      for (const lesson of lessons) {
        // Save lesson content
        await saveContent(lesson);
        await saveContentForOffline({
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          downloaded: true,
          downloadedAt: new Date().toISOString(),
          downloaded_at: new Date().toISOString(),
          user_id: userId,
          content_id: lesson.id,
          size_bytes: 2 * 1024 * 1024,
          content: lesson,
        });

        // Create download record for lesson
        const lessonDownload = {
          id: `${userId}-${lesson.id}`,
          title: lesson.title,
          type: lesson.type,
          user_id: userId,
          content_id: lesson.id,
          downloaded: true,
          downloadedAt: new Date().toISOString(),
          downloaded_at: new Date().toISOString(),
          size_bytes: 2 * 1024 * 1024, // 2MB for lessons
          content: lesson,
        };
        await saveDownload(lessonDownload);

        // If the lesson has a quiz, download it too
        if (lesson.quiz_id) {
          const quizResponse = await fetch(`/api/content/${lesson.quiz_id}`);
          if (quizResponse.ok) {
            const quizData = await quizResponse.json();
            const quiz = quizData.data.content;
            const questions = quizData.data.questions;

            // Save quiz with its questions
            quiz.questions = questions;
            await saveContent(quiz);
            await saveContentForOffline({
              id: quiz.id,
              title: quiz.title,
              type: "quiz",
              downloaded: true,
              downloadedAt: new Date().toISOString(),
              downloaded_at: new Date().toISOString(),
              user_id: userId,
              content_id: quiz.id,
              size_bytes: 1 * 1024 * 1024,
              content: quiz,
            });

            // Create download record for quiz
            const quizDownload = {
              id: `${userId}-${quiz.id}`,
              title: quiz.title,
              type: "quiz",
              user_id: userId,
              content_id: quiz.id,
              downloaded: true,
              downloadedAt: new Date().toISOString(),
              downloaded_at: new Date().toISOString(),
              size_bytes: 1 * 1024 * 1024, // 1MB for quizzes
              content: quiz,
            };
            await saveDownload(quizDownload);
          }
        }
      }
    }

    // If this is a quiz, save its questions
    if (content.type === "quiz" && questions && questions.length > 0) {
      content.questions = questions;
      await saveContent(content);
    }

    // Record the download in IndexedDB
    const download = {
      id: `${userId}-${contentId}`,
      title: content.title,
      type: content.type,
      user_id: userId,
      content_id: contentId,
      downloaded: true,
      downloadedAt: new Date().toISOString(),
      downloaded_at: new Date().toISOString(),
      size_bytes: sizeBytes,
      content: content,
    };
    await saveDownload(download);

    toast.success("Content downloaded successfully", {
      id: toastId,
      description: content.type === "course" 
        ? "Course and all related content is now available offline" 
        : "Now available for offline use"
    });

    // For online users, sync with server
    if (!isOfflineUser) {
      try {
        const response = await fetch("/api/downloads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ contentId, sizeBytes }),
        });
        
        if (!response.ok) {
          await queueAction({
            url: "/api/downloads",
            method: "POST",
            body: { contentId, sizeBytes },
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (_error) {
        console.error("Failed to record download on server:", _error);
        await queueAction({
          url: "/api/downloads",
          method: "POST",
          body: { contentId, sizeBytes },
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error downloading content:", error);
    toast.error("Download failed", {
      description: "There was a problem downloading this content"
    });
    return false;
  }
}

/**
 * Get downloaded content from IndexedDB
 * @param contentId ID of the content to retrieve
 * @returns Promise resolving to the content data or null
 */
export async function getDownloadedContent(
  contentId: string
): Promise<any | null> {
  try {
    // First check if we have this content downloaded
    const download = await getDownloadByContentId(contentId);
    if (!download) {
      return null;
    }

    // Get the content from IndexedDB
    const content = await getContent(contentId);
    return content;
  } catch (error) {
    console.error("Error getting downloaded content:", error);
    return null;
  }
}

/**
 * Get all downloads for a specific user
 * @param userId ID of the user
 * @returns Promise resolving to an array of downloads
 */
export async function getUserDownloads(userId: string): Promise<any[]> {
  try {
    const allDownloads = await getAllDownloads();
    return allDownloads.filter(download => download.user_id === userId);
  } catch (error) {
    console.error("Error getting user downloads:", error);
    return [];
  }
}

/**
 * Calculate the total storage used by downloads
 * @returns Promise resolving to the total size in bytes
 */
export async function getTotalStorageUsed(): Promise<number> {
  try {
    const allDownloads = await getAllDownloads();
    return allDownloads.reduce((total, download) => {
      return total + (download.size_bytes || 0);
    }, 0);
  } catch (error) {
    console.error("Error calculating storage used:", error);
    return 0;
  }
}
