"use client"

import { useEffect, useState } from "react"
import { WifiOff, Wifi } from "lucide-react"
import { useOffline } from "@/hooks/use-offline"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Use dynamic import with no SSR to avoid hydration issues
const OfflineBannerContent = ({ isOnline, isVisible }: { isOnline: boolean; isVisible: boolean }) => {
  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isOnline ? "bg-green-500" : "bg-amber-500",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="container py-2 px-4">
        <div className="flex items-center justify-center gap-2 text-white">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>You're back online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>You're currently offline. Some features may be limited.</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function OfflineBannerWithHook() {
  const { isOnline } = useOffline()
  const [isVisible, setIsVisible] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Handle visibility with animation
  useEffect(() => {
    // Skip the initial animation when the component first mounts
    if (isInitialLoad) {
      setIsInitialLoad(false)
      if (!isOnline) setIsVisible(true)
      return
    }

    if (!isOnline) {
      setIsVisible(true)
    } else {
      // When going back online, delay hiding to show the "back online" message briefly
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, isInitialLoad])

  if (!isVisible && isOnline) return null

  return <OfflineBannerContent isOnline={isOnline} isVisible={isVisible} />
}

// Export a dynamically imported version with no SSR
export const OfflineBanner = dynamic(() => Promise.resolve(OfflineBannerWithHook), {
  ssr: false,
})

