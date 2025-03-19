"use client";

import { useState, useEffect, useCallback } from "react";
import { processActionQueue, retryFailedActions } from "@/lib/sync-service";
import { getPendingActions } from "@/lib/indexeddb";
import { useToast } from "./use-toast";

export function useOffline() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingActions, setPendingActions] = useState<number>(0);
  const { toast } = useToast();

  // Check for pending actions on mount
  useEffect(() => {
    const checkPendingActions = async () => {
      try {
        const actions = await getPendingActions();
        setPendingActions(actions.length);
      } catch (error) {
        console.error("Error checking pending actions:", error);
      }
    };

    checkPendingActions();
  }, []);

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Syncing your changes...",
      });
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description:
          "Changes will be saved locally and synced when you're back online.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  // Function to sync data when back online
  const syncData = useCallback(async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    try {
      const result = await processActionQueue();

      if (result.success > 0) {
        toast({
          title: "Sync complete",
          description: `Successfully synced ${result.success} actions.`,
        });
      }

      if (result.failed > 0) {
        toast({
          title: "Some actions failed to sync",
          description: `${result.failed} actions couldn't be synced. They will be retried later.`,
          variant: "destructive",
        });
        setPendingActions(result.failed);
      } else {
        setPendingActions(0);
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      toast({
        title: "Sync failed",
        description:
          "There was an error syncing your data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, toast]);

  // Function to manually retry failed actions
  const retrySync = useCallback(async () => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Please connect to the internet to sync your data.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await retryFailedActions();

      if (result.success > 0) {
        toast({
          title: "Retry complete",
          description: `Successfully synced ${result.success} actions.`,
        });
      }

      if (result.failed > 0) {
        toast({
          title: "Some actions still failed",
          description: `${result.failed} actions couldn't be synced.`,
          variant: "destructive",
        });
        setPendingActions(result.failed);
      } else {
        setPendingActions(0);
      }
    } catch (error) {
      console.error("Error retrying sync:", error);
      toast({
        title: "Retry failed",
        description:
          "There was an error retrying the sync. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, toast]);

  return {
    isOnline,
    isSyncing,
    pendingActions,
    syncData,
    retrySync,
  };
}
