"use client";

import { useOffline } from "@/hooks/use-offline";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function OfflineDetector() {
  const { isOnline, isSyncing, pendingActions, retrySync } = useOffline();

  // Only show when online but with pending actions
  if (!isOnline || pendingActions === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-amber-500 transform translate-y-10">
      <div className=" py-2 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <span>You have {pendingActions} pending changes to sync</span>
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
