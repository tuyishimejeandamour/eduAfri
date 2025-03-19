"use server"

import { supabaseAdmin } from "@/lib/supabase"
import type { Content } from "@/lib/types"

// Fallback data for featured courses
const FALLBACK_COURSES = [
  {
    id: "fallback-1",
    title: "Mathematics Mastery",
    description: "Comprehensive math course from basics to advanced concepts",
    type: "course",
    language: "en",
    subject: "Mathematics",
    grade_level: "5-8",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-2",
    title: "Science Explorer",
    description: "Interactive science lessons with real-world applications",
    type: "course",
    language: "en",
    subject: "Science",
    grade_level: "5-8",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "fallback-3",
    title: "African History",
    description: "Discover the rich history of the African continent",
    type: "course",
    language: "en",
    subject: "History",
    grade_level: "5-8",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
] as Content[]

// Fallback subjects
const FALLBACK_SUBJECTS = [
  { title: "Mathematics", href: "/courses?subject=mathematics" },
  { title: "Science", href: "/courses?subject=science" },
  { title: "History", href: "/courses?subject=history" },
  { title: "Languages", href: "/courses?subject=languages" },
  { title: "Programming", href: "/courses?subject=programming" },
]

export async function getFeaturedCourses(limit = 3) {
  try {
    // Use admin client to avoid rate limiting issues
    const { data, error } = await supabaseAdmin
      .from("content")
      .select("*")
      .eq("type", "course")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching featured courses:", error)
      return FALLBACK_COURSES
    }

    return data.length > 0 ? (data as Content[]) : FALLBACK_COURSES
  } catch (error) {
    console.error("Error in getFeaturedCourses:", error)
    return FALLBACK_COURSES
  }
}

export async function getSubjects() {
  // Just return fallback subjects to avoid rate limiting
  return FALLBACK_SUBJECTS
}

export async function getFooterLinks() {
  // Use fallback data to avoid rate limiting issues
  const resourceLinks = [{ title: "All Courses", href: "/courses" }, ...FALLBACK_SUBJECTS]

  const aboutLinks = [
    { title: "About us", href: "/about" },
    { title: "Our Mission", href: "/mission" },
    { title: "Blog", href: "/blog" },
    { title: "Partnerships", href: "/partners" },
    { title: "Careers", href: "/careers" },
  ]

  const supportLinks = [
    { title: "Help Center", href: "/help" },
    { title: "Contact Us", href: "/contact" },
    { title: "Technical Support", href: "/tech-support" },
    { title: "Offline Access", href: "/offline-guide" },
    { title: "FAQs", href: "/faqs" },
  ]

  return {
    resourceLinks,
    aboutLinks,
    supportLinks,
  }
}

