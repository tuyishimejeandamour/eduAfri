"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOffline } from "@/hooks/use-offline";
import { useDownloads } from "@/hooks/use-downloads";
import { Button } from "@/app/[lang]/components/ui/button";
import { 
  RefreshCw, 
  WifiOff, 
  ArrowUpFromLine, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { getDownloadByContentId } from "@/lib/indexeddb";

export function OfflineDetector() {
  const { isOnline, isSyncing, pendingActions, retrySync } = useOffline();
  const { downloadCount } = useDownloads();
  const router = useRouter();
  const pathname = usePathname();
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
        
        // Handle returning to online mode
        handleOnlineReturn();
      } else {
        toast.warning("You're offline", {
          description: "Content you've downloaded is still available",
          icon: <WifiOff className="h-4 w-4" />
        });

        // Check current path and handle routing
        handleOfflineRouting();
      }
      setLastOnlineStatus(isOnline);
    }
  }, [isOnline, lastOnlineStatus, pendingActions, retrySync, pathname]);
  
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
  
  // Handle returning to online mode
  const handleOnlineReturn = () => {
    // If we're on an offline content page, redirect to the regular content view
    if (pathname.startsWith('/offline/content/')) {
      const contentId = pathname.split('/').pop();
      if (contentId) {
        // Redirect to the normal content page
        router.push(`/content/${contentId}`);
        // Force reload to ensure fresh content is fetched (and not from cache)
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } else if (pathname === '/offline' || pathname === '/downloads') {
      // If on the offline page or downloads page, redirect to dashboard
      router.push('/dashboard');
    }
  };
  
  // Handle offline routing
  const handleOfflineRouting = async () => {
    const path = window.location.pathname;
    
    // Already on offline page or downloads page, no need to redirect
    if (path.startsWith('/offline/') || path === '/downloads') {
      return;
    }

    // Check if current page is content
    const contentMatch = path.match(/\/content\/([^\/]+)/);
    if (contentMatch) {
      const contentId = contentMatch[1];
      const isDownloaded = await getDownloadByContentId(contentId);
      
      if (isDownloaded) {
        // If content is downloaded, redirect to offline view
        router.push(`/offline/content/${contentId}`);
      } else if (downloadCount > 0) {
        // If content not downloaded but user has other downloads, show them
        toast.error("This content isn't available offline", {
          description: "Redirecting to your downloads...",
          icon: <AlertCircle className="h-4 w-4" />
        });
        router.push('/downloads');
      }
      return;
    }

    // For other pages, if user has downloads, show them their downloads
    if (downloadCount > 0) {
      router.push('/downloads');
    }
  };
  
  // Show nothing when online with no pending actions and no success message
  if (isOnline && pendingActions === 0 && !showSyncSuccess) return null;
  
  // Show offline banner
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-amber-500">
        <div className="container py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <WifiOff className="h-4 w-4" />
            <span>You're offline</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 bg-white hover:bg-white/90"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
            
            {downloadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-white hover:bg-white/90"
                onClick={() => router.push('/downloads')}
              >
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                View Downloads
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Show sync status banner
  if (isSyncing || showSyncSuccess) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-blue-500">
        <div className="container py-2 px-4 text-white">
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Syncing your changes...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>All changes synced successfully</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Show pending actions banner
  if (pendingActions > 0) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 bg-blue-500">
        <div className="container py-2 px-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{pendingActions} changes pending sync</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-white hover:bg-white/90 text-blue-500"
            onClick={retrySync}
          >
            Sync Now
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

