"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { processActionQueue, retryFailedActions } from "@/lib/sync-service";
import { getPendingActions } from "@/lib/indexeddb";
import { toast } from "sonner";

// Safe client-side only hook
export function useOffline() {
  const isBrowser = typeof window !== "undefined";

  const [isOnline, setIsOnline] = useState(isBrowser ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  const isMounted = useRef(true);
  const initDone = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Check for pending actions on mount - only in browser
  useEffect(() => {
    if (!isBrowser) return;

    // Avoid running multiple times
    if (initDone.current) return;
    initDone.current = true;

    const checkPendingActions = async () => {
      try {
        if (!isMounted.current) return;

        // Add a small delay to let IndexedDB initialize properly
        await new Promise((resolve) => setTimeout(resolve, 500));

        const actions = await getPendingActions();

        if (!isMounted.current) return;
        setPendingActions(actions.length);
      } catch (error) {
        console.error("Error checking pending actions:", error);
      }
    };

    checkPendingActions();

    // Set up interval to check for pending actions
    const intervalId = setInterval(async () => {
      if (!isMounted.current) return;

      try {
        const actions = await getPendingActions();
        if (!isMounted.current) return;
        setPendingActions(actions.length);
      } catch (error) {
        console.error("Error checking pending actions in interval:", error);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [isBrowser]);

  // Function to sync data when back online
  const syncData = useCallback(async () => {
    if (!isBrowser || !isOnline || !isMounted.current) return;

    setIsSyncing(true);
    try {
      const result = await processActionQueue();

      if (!isMounted.current) return;

      if (result.success > 0) {
        toast.success("Sync complete", {
          description: `Successfully synced ${result.success} actions.`,
        });
      }

      if (result.failed > 0) {
        toast.error("Some actions failed to sync", {
          description: `${result.failed} actions couldn't be synced. They will be retried later.`,
        });
        setPendingActions(result.failed);
      } else {
        setPendingActions(0);
      }
    } catch (error) {
      if (!isMounted.current) return;
      console.error("Error syncing data:", error);
      toast.error("Sync failed", {
        description:
          "There was an error syncing your data. Please try again later.",
      });
    } finally {
      if (isMounted.current) {
        setIsSyncing(false);
      }
    }
  }, [isBrowser, isOnline]);

  // Function to manually retry failed actions
  const retrySync = useCallback(async () => {
    if (!isBrowser || !isMounted.current) return;

    if (!isOnline) {
      toast.error("You're offline", {
        description: "Please connect to the internet to sync your data.",
      });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await retryFailedActions();

      if (!isMounted.current) return;

      if (result.success > 0) {
        toast.success("Retry complete", {
          description: `Successfully synced ${result.success} actions.`,
        });
      }

      if (result.failed > 0) {
        toast.error("Some actions still failed", {
          description: `${result.failed} actions couldn't be synced.`,
        });
        setPendingActions(result.failed);
      } else {
        setPendingActions(0);
      }
    } catch (error) {
      if (!isMounted.current) return;
      console.error("Error retrying sync:", error);
      toast.error("Retry failed", {
        description:
          "There was an error retrying the sync. Please try again later.",
      });
    } finally {
      if (isMounted.current) {
        setIsSyncing(false);
      }
    }
  }, [isBrowser, isOnline]);

  // Update online status - only in browser
  useEffect(() => {
    if (!isBrowser) return;

    const handleOnline = () => {
      if (!isMounted.current) return;
      setIsOnline(true);
      toast.success("You're back online", {
        description: "Syncing your changes...",
      });

      // Add a small delay before syncing to ensure browser is really online
      setTimeout(() => {
        if (isMounted.current) {
          syncData();
        }
      }, 1000);
    };

    const handleOffline = () => {
      if (!isMounted.current) return;
      setIsOnline(false);
      toast.error("You're offline", {
        description:
          "Changes will be saved locally and synced when you're back online.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isBrowser, syncData]);

  // If not in browser, return safe defaults
  if (!isBrowser) {
    return {
      isOnline: true,
      isSyncing: false,
      pendingActions: 0,
      syncData: () => Promise.resolve(),
      retrySync: () => Promise.resolve(),
    };
  }

  return {
    isOnline,
    isSyncing,
    pendingActions,
    syncData,
    retrySync,
  };
}
