import { getServerSupabaseClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { CourseForm } from "@/app/admin/components/course-form"

export default async function CreateCoursePage() {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth")
  }

  // Fetch languages for the dropdown
  const { data: languages } = await supabase.from("languages").select("*").order("name", { ascending: true })

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Create New Course</h1>
      <CourseForm languages={languages || []} />
    </div>
  )
}

