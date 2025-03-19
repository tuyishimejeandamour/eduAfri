"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register the service worker from the public folder
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;

            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  toast("Update available", {
                    description:
                      "A new version of the app is available. Refresh to update.",
                    action: {
                      label: "Refresh",
                      onClick: () => {
                        window.location.reload();
                      },
                    },
                  });
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
          toast("Offline mode limited", {
            description:
              "Some offline features may not be available in this browser.",
          });
        });

      // Listen for controller change
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker controller changed");
      });
    }
  }, []);

  return null;
}
