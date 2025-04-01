"use client";

import type React from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/tanstack-query";
import { ServiceWorker } from "@/app/[lang]/components/service-worker";
import { ThemeProvider } from "next-themes";
import { Toaster } from "./ui/sonner";
import { OfflineAuthProvider } from "@/lib/offline-auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <OfflineAuthProvider>
          {children}
          <Toaster />
          <ServiceWorker />
        </OfflineAuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
