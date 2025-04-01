import type React from "react"
import Link from "next/link"
import { Badge } from "@/app/[lang]/components/ui/badge"
import { Card, CardContent } from "@/app/[lang]/components/ui/card"
import { cn } from "@/lib/utils"

interface FeaturedCourseCardProps {
  title: string
  description: string
  image: string
  href: string
  badge?: string
  className?: string
  style?: React.CSSProperties
}

export function FeaturedCourseCard({
  title,
  description,
  image,
  href,
  badge,
  className,
  style,
}: FeaturedCourseCardProps) {
  return (
    <Link href={href}>
      <Card
        className={cn("group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl", className)}
        style={style}
      >
        {badge && (
          <Badge className="absolute right-4 top-4 bg-white/90 text-black hover:bg-white/70" variant="secondary">
            {badge}
          </Badge>
        )}
        <CardContent className="p-0">
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image || "/placeholder.svg"}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

