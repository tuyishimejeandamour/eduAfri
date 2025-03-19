"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const announcements = [
  "Subscribe and save 20%",
  "Free shipping in European Union over 100€",
  "Save more on quantity 6+ refills 10% off",
]

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-black text-white py-2 relative">
      <div className="container flex items-center justify-center">
        <div className="flex-1" />
        <p className="text-sm text-center animate-fade-in">{announcements[currentIndex]}</p>
        <div className="flex-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-white hover:text-white/80"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1">
        {announcements.map((_, index) => (
          <button
            key={index}
            className={`h-1 w-6 rounded-full transition-colors ${index === currentIndex ? "bg-white" : "bg-white/30"}`}
            onClick={() => setCurrentIndex(index)}
          >
            <span className="sr-only">Announcement {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

