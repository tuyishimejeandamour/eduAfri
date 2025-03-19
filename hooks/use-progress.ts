"use client"

import { useQuery } from "@tanstack/react-query"

export function useProgress() {
  const {
    data: progress,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const response = await fetch("/api/progress")
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch progress")
      }
      const data = await response.json()
      return data.data
    },
  })

  return {
    progress,
    isLoading,
    error,
  }
}

