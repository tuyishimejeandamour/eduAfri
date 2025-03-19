import Link from "next/link";
import { Layout, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeaturedCourseCard } from "@/components/featured-course-card";
import { OfflineBanner } from "@/components/offline-banner";
import { NewsletterForm } from "@/components/newsletter-form";

const featuredCourses = [
  {
    title: "Mathematics Mastery",
    description: "Comprehensive math course from basics to advanced concepts",
    image: "/placeholder.svg?height=400&width=600",
    href: "/courses?subject=mathematics",
    badge: "NEW",
  },
  {
    title: "Science Explorer",
    description: "Interactive science lessons with real-world applications",
    image: "/placeholder.svg?height=400&width=600",
    href: "/courses?subject=science",
    badge: "BESTSELLER",
  },
  {
    title: "African History",
    description: "Discover the rich history of the African continent",
    image: "/placeholder.svg?height=400&width=600",
    href: "/courses?subject=history",
    badge: "FEATURED",
  },
];

export default function Home() {
  return (
    <div className="flex max-w-7xl flex-col items-center justify-center w-full h-full">
      <OfflineBanner />
      <section className="relative rounded-lg  w-full  bg-[#E6E8F5] overflow-hidden">
        <div className=" relative py-6  px-6 z-10 flex  items-center">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  EduAfri
                  <span className="block text-2xl sm:text-3xl lg:text-4xl text-muted-foreground mt-2">
                    Your learning companion.
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-[600px]">
                  Access quality education offline across Africa. Your gateway
                  to knowledge, anytime, anywhere.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Layout className="h-5 w-5" />
                  <span className="text-sm">Multiple formats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Learn together</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Learning
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Sign up free
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="relative h-[500px] w-[600px]">
                  {featuredCourses.map((course, index) => (
                    <div
                      key={course.title}
                      className="absolute transition-all duration-500"
                      style={{
                        top: `${index * 40}px`,
                        right: `${index * 40}px`,
                        zIndex: 3 - index,
                        transform: `rotate(${index * 2}deg)`,
                      }}
                    >
                      <FeaturedCourseCard
                        {...course}
                        className="w-[300px] shadow-2xl"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Featured Courses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start your learning journey with our most popular courses
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <FeaturedCourseCard key={course.title} {...course} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/courses">
              <Button size="lg" variant="outline">
                View All Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Render the NewsletterForm client-side only */}
      <NewsletterForm />
    </div>
  );
}
