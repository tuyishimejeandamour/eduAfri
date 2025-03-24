"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllDownloads,
  clearAllDownloads,
  queueAction,
  getDownloadCount,
} from "@/lib/indexeddb";
import { useOffline } from "@/hooks/use-offline";
import { toast } from "sonner";

interface Download {
  id: string;
  content_id: string;
  url?: string;
  content?: any;
  assets?: string[];
}

export function useDownloads() {
  const queryClient = useQueryClient();
  const { isOnline } = useOffline();

  // Add a query to check download count
  const downloadCountQuery = useQuery({
    queryKey: ["downloadCount"],
    queryFn: async () => {
      try {
        return await getDownloadCount();
      } catch (error) {
        console.error("Error getting download count:", error);
        return 0;
      }
    },
    // Keep this data fresh
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const {
    data: downloads,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["downloads"],
    queryFn: async () => {
      // Always try IndexedDB first for fastest possible load
      try {
        const offlineDownloads = await getAllDownloads();
        if (offlineDownloads && offlineDownloads.length > 0) {
          // If we're online, trigger a background sync
          if (isOnline) {
            fetch("/api/downloads")
              .then(res => res.json())
              .then(data => {
                queryClient.setQueryData(["downloads"], data.data);
              })
              .catch(console.error);
          }
          return offlineDownloads;
        }
      } catch (error) {
        console.error("Error fetching offline downloads:", error);
      }

      // If no IndexedDB data and online, fetch from API
      if (isOnline) {
        const response = await fetch("/api/downloads");
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to fetch downloads");
        }
        const data = await response.json();
        
        // Cache the downloads in IndexedDB for offline access
        try {
          const downloads: Download[] = data.data;
          await Promise.all(downloads.map(async (download: Download) => {
            // Cache each download's content in IndexedDB if not already cached
            if (download.content) {
              // You might want to implement a cacheDownloadContent function
              // that stores the content in IndexedDB
              await cacheDownloadContent(download);
            }
          }));
        } catch (error) {
          console.error("Error caching downloads:", error);
        }

        return data.data;
      }

      // If offline and no IndexedDB data, return empty array
      return [];
    },
    // Keep cached data fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
  });

  const clearDownloadsMutation = useMutation({
    mutationFn: async () => {
      if (!isOnline) {
        toast.error("You need to be online to clear all downloads");
        return false;
      }

      // Clear from IndexedDB first
      await clearAllDownloads();

      // Then clear from server
      const response = await fetch("/api/downloads/clear", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to clear downloads");
      }

      return true;
    },
    onSuccess: () => {
      toast.success("All downloads cleared successfully");
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
      queryClient.invalidateQueries({ queryKey: ["downloadCount"] });

      // Notify service worker to update its cache
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "DOWNLOADS_CLEARED"
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear downloads");
      
      // If offline, queue the clear action for later
      if (!isOnline) {
        queueAction({
          url: "/api/downloads/clear",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).then(() => {
          toast.info("Clear downloads action queued for when you're back online");
        });
      }
    },
  });

  return {
    downloads,
    isLoading,
    error,
    clearDownloads: () => clearDownloadsMutation.mutate(),
    downloadCount: downloadCountQuery.data || 0,
  };
}

// Helper function to cache download content
async function cacheDownloadContent(download: any) {
  // Make sure we have a valid download object with content_id
  if (!download || !download.content_id) {
    console.error('Invalid download object for caching:', download);
    return;
  }

  if (navigator.serviceWorker.controller) {
    // Prepare the download data with content_id to be cached properly
    const downloadData = {
      ...download,
      // If URL not provided, construct it
      url: download.url || `/api/content/${download.content_id}`,
      // Include the content page URL for navigation
      content_page_url: `/content/${download.content_id}`
    };
    
    console.log('Caching download content:', downloadData);
    
    // Send to service worker for caching
    navigator.serviceWorker.controller.postMessage({
      type: "CACHE_DOWNLOAD_CONTENT",
      download: downloadData,
    });
  } else {
    console.warn('No active service worker found when trying to cache content');
  }
}
