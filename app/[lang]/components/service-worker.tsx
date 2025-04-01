"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          // Check if there's an update available
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New service worker is installed and ready to take over
                  toast.info("App update available", {
                    description: "Reload the page to update the app",
                    action: {
                      label: "Reload",
                      onClick: () => window.location.reload(),
                    },
                  });
                }
              });
            }
          });

          // Handle offline/online transitions
          window.addEventListener("online", () => {
            // Check if we're on a non-downloads page when coming back online
            if (window.location.pathname !== "/downloads") {
              toast.success("You're back online!", {
                description: "Your content will now sync with the cloud.",
              });
            }
          });

          window.addEventListener("offline", () => {
            // When going offline, check if we have downloaded content
            navigator.serviceWorker.controller?.postMessage({
              type: "CHECK_DOWNLOADS",
            });
          });

          // Listen for messages from the service worker
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data && event.data.type === "HAS_DOWNLOADS") {
              // If we have downloads and we're not on the downloads page, suggest navigating there
              if (window.location.pathname !== "/downloads") {
                toast.info("You're offline", {
                  description: "View your downloaded content to continue learning",
                  action: {
                    label: "View Downloads",
                    onClick: () => window.location.href = "/downloads",
                  },
                });
              }
            }
          });
        })
        .catch((error) => {
          console.error("Service worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
