"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi, Download } from "lucide-react";
import { useOffline } from "@/hooks/use-offline";
import { useDownloads } from "@/hooks/use-downloads";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const OfflineBannerContent = ({
  isOnline,
  isVisible,
  downloadCount,
  isDownloadsPage,
}: {
  isOnline: boolean;
  isVisible: boolean;
  downloadCount: number;
  isDownloadsPage: boolean;
}) => {
  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isOnline ? "bg-green-500" : "bg-amber-500",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="py-2 px-4">
        <div className="flex items-center justify-center gap-2 text-white">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>You&apos;re back online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              {isDownloadsPage ? (
                <span>
                  You&apos;re offline. You can access your {downloadCount}{" "}
                  downloaded items below.
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span>You&apos;re offline.</span>
                  {downloadCount > 0 ? (
                    <Link 
                      href="/downloads" 
                      className="flex items-center gap-1 underline hover:text-white/90"
                    >
                      <Download className="h-4 w-4" />
                      <span>Access your {downloadCount} downloaded items</span>
                    </Link>
                  ) : (
                    <span>Download content to access it offline.</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function OfflineBannerWithHook() {
  const { isOnline } = useOffline();
  const { downloadCount } = useDownloads();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isDownloadsPage = pathname === "/downloads";

  // Handle visibility with animation
  useEffect(() => {
    // Skip the initial animation when the component first mounts
    if (isInitialLoad) {
      setIsInitialLoad(false);
      if (!isOnline) setIsVisible(true);
      return;
    }

    if (!isOnline) {
      setIsVisible(true);
    } else {
      // When going back online, delay hiding to show the "back online" message briefly
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isInitialLoad]);

  if (!isVisible && isOnline) return null;

  return (
    <OfflineBannerContent 
      isOnline={isOnline} 
      isVisible={isVisible} 
      downloadCount={downloadCount}
      isDownloadsPage={isDownloadsPage}
    />
  );
}

// Export a dynamically imported version with no SSR
export const OfflineBanner = dynamic(
  () => Promise.resolve(OfflineBannerWithHook),
  {
    ssr: false,
  }
);
