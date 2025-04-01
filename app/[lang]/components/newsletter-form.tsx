"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/app/[lang]/components/ui/button"
import { Input } from "@/app/[lang]/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/[lang]/components/ui/card"

export function NewsletterForm() {
  const [isVisible, setIsVisible] = useState(true)
  const [email, setEmail] = useState("")

  if (!isVisible) return null

  return (
    <Card className="fixed bottom-4 right-4 w-[400px] max-w-[calc(100vw-2rem)] animate-slide-up bg-[#FFE4C8] border-none z-50">
      <CardHeader className="relative pb-2">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 hover:bg-black/10"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <CardTitle className="text-xl">Get 20% off your first course.</CardTitle>
        <CardDescription className="text-muted-foreground">
          Subscribe and unlock a discount when you enroll in your first course. It is that simple.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            // Handle form submission here
            console.log("Subscribed with email:", email)
            setIsVisible(false)
          }}
        >
          <Input
            type="email"
            placeholder="Your email address"
            className="bg-white/80 border-0"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="bg-black text-white hover:bg-black/90">
            Subscribe
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

