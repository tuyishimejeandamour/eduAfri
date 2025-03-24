"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOffline } from "@/hooks/use-offline";
import { useDownloads } from "@/hooks/use-downloads";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw, 
  WifiOff, 
  ArrowUpFromLine, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { processActionQueue } from "@/lib/sync-service";

export function OfflineDetector() {
  const { isOnline, isSyncing, pendingActions, retrySync } = useOffline();
  const { downloadCount } = useDownloads();
  const router = useRouter();
  const [lastOnlineStatus, setLastOnlineStatus] = useState(true);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  
  // Track online status changes to show notifications
  useEffect(() => {
    if (isOnline !== lastOnlineStatus) {
      if (isOnline) {
        toast.success("You're back online", {
          description: "Your content and progress will sync automatically",
          icon: <CheckCircle2 className="h-4 w-4" />
        });
        
        // Auto-sync when coming back online
        if (pendingActions > 0) {
          setTimeout(() => {
            retrySync();
          }, 2000);
        }
      } else {
        toast.warning("You're offline", {
          description: "Content you've downloaded is still available",
          icon: <WifiOff className="h-4 w-4" />
        });
      }
      setLastOnlineStatus(isOnline);
    }
  }, [isOnline, lastOnlineStatus, pendingActions, retrySync]);
  
  // Listen for sync completion
  useEffect(() => {
    const handleSyncComplete = () => {
      setShowSyncSuccess(true);
      setTimeout(() => {
        setShowSyncSuccess(false);
      }, 3000);
    };
    
    window.addEventListener('sync-completed', handleSyncComplete);
    return () => {
      window.removeEventListener('sync-completed', handleSyncComplete);
    };
  }, []);
  
  // Handle offline redirects to downloads page
  useEffect(() => {
    const handleOffline = () => {
      // Don't redirect if we're already on the downloads page
      if (window.location.pathname === "/downloads") {
        return;
      }

      // Check if the current page is part of downloaded content
      const isDownloadedContent = checkIsDownloadedContent();
      
      // Only redirect to downloads if we have downloads and the current content isn't downloaded
      if (downloadCount > 0 && !isDownloadedContent) {
        router.push("/downloads");
      }
    };

    // Register the handler for offline events
    window.addEventListener("offline", handleOffline);
    
    // If we start in offline mode, run the check immediately
    if (!isOnline) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOnline, downloadCount, router]);
  
  // Show nothing when online with no pending actions and no success message
  if (isOnline && pendingActions === 0 && !showSyncSuccess) return null;
  
  // Show offline banner
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-amber-500">
        <div className="container py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <WifiOff className="h-4 w-4" />
            <span>You're offline - Downloaded content is still available</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="bg-white text-amber-500 hover:bg-white/90 hover:text-amber-600"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }
  
  // Show sync success message
  if (showSyncSuccess) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-green-500 animate-fade-in-down">
        <div className="container py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <CheckCircle2 className="h-4 w-4" />
            <span>All changes synced successfully</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-green-600"
            onClick={() => setShowSyncSuccess(false)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    );
  }
  
  // Show pending actions banner
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-amber-500 animate-fade-in-down">
      <div className="container py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <ArrowUpFromLine className="h-4 w-4" />
          <span>You have {pendingActions} pending {pendingActions === 1 ? 'change' : 'changes'} to sync</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="bg-white text-amber-500 hover:bg-white/90 hover:text-amber-600"
          onClick={retrySync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Syncing...
            </>
          ) : (
            "Sync Now"
          )}
        </Button>
      </div>
    </div>
  );
}

// Helper function to check if current content is downloaded
function checkIsDownloadedContent() {
  // This will be handled by the service worker cache matching
  // We don't need to implement the logic here as the service worker
  // will handle routing to the offline page if needed
  return false;
}

