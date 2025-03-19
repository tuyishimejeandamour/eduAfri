"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllDownloads,
  clearAllDownloads,
  queueAction,
} from "@/lib/indexeddb";
import { useOffline } from "@/hooks/use-offline";
import { toast } from "sonner";

export function useDownloads() {
  const queryClient = useQueryClient();
  const { isOnline } = useOffline();

  const {
    data: downloads,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["downloads"],
    queryFn: async () => {
      // First try to get from IndexedDB
      try {
        const offlineDownloads = await getAllDownloads();
        if (offlineDownloads && offlineDownloads.length > 0) {
          return offlineDownloads;
        }
      } catch (error) {
        console.error("Error fetching offline downloads:", error);
      }

      // If online or no offline downloads, fetch from API
      if (isOnline) {
        const response = await fetch("/api/downloads");
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to fetch downloads");
        }
        const data = await response.json();
        return data.data;
      }

      // If offline and no IndexedDB data, return empty array
      return [];
    },
  });

  const clearDownloadsMutation = useMutation({
    mutationFn: async () => {
      // Clear from IndexedDB
      await clearAllDownloads();

      // If online, clear from server
      if (isOnline) {
        const response = await fetch("/api/downloads/clear", {
          method: "POST",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to clear downloads");
        }
      } else {
        // If offline, queue for later
        await queueAction({
          url: "/api/downloads/clear",
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }

      return true;
    },
    onSuccess: () => {
      toast("All downloads cleared successfully.");
      queryClient.invalidateQueries({ queryKey: ["downloads"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to clear downloads");
    },
  });

  return {
    downloads,
    isLoading,
    error,
    clearDownloads: () => clearDownloadsMutation.mutate(),
  };
}
