"use server"

import { revalidatePath } from "next/cache"
import { getServerSupabaseClient } from "@/lib/supabase"

// Course actions
export async function createCourse(formData: any) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user has admin role (you should add this check)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized. Admin access required." }
  }

  const courseData = {
    title: formData.title,
    description: formData.description,
    type: formData.type,
    subject: formData.subject,
    grade_level: formData.grade_level,
    language: formData.language,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from("content")
    .insert(courseData)
    .select()
    .single();

  if (error) {
    console.error("Error creating course:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/courses")
  revalidatePath("/admin/dashboard")
  return { success: true, id: data.id }
}

export async function updateCourse(formData: any) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized. Admin access required." }
  }

  const { error } = await supabase
    .from("content")
    .update({
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      grade_level: formData.grade_level,
      language: formData.language,
      updated_at: new Date().toISOString(),
    })
    .eq("id", formData.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/courses")
  return { success: true }
}

export async function deleteCourse(formData: FormData) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized. Admin access required." }
  }

  const id = formData.get("id") as string
  if (!id) {
    return { error: "Course ID is required" }
  }

  // First delete all quizzes associated with this course
  const { data: quizzes } = await supabase
    .from("content")
    .select("id")
    .eq("type", "quiz")
    .eq("course_id", id)

  if (quizzes && quizzes.length > 0) {
    const quizIds = quizzes.map((quiz) => quiz.id)

    // Delete all questions for these quizzes
    const { error: questionsError } = await supabase
      .from("questions")
      .delete()
      .in("quiz_id", quizIds)

    if (questionsError) {
      console.error("Error deleting questions:", questionsError)
      return { error: "Failed to delete associated questions" }
    }

    // Delete the quizzes
    const { error: quizzesError } = await supabase
      .from("content")
      .delete()
      .in("id", quizIds)

    if (quizzesError) {
      console.error("Error deleting quizzes:", quizzesError)
      return { error: "Failed to delete associated quizzes" }
    }
  }

  // Delete all lessons associated with this course
  const { error: lessonsError } = await supabase
    .from("content")
    .delete()
    .eq("type", "lesson")
    .eq("course_id", id)

  if (lessonsError) {
    console.error("Error deleting lessons:", lessonsError)
    return { error: "Failed to delete associated lessons" }
  }

  // Finally delete the course
  const { error } = await supabase.from("content").delete().eq("id", id)

  if (error) {
    console.error("Error deleting course:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/courses")
  return { success: true }
}

// Quiz actions
export async function createQuiz(formData: any) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized. Admin access required." }
  }

  const quizData = {
    title: formData.title,
    description: formData.description,
    type: formData.type,
    course_id: formData.course_id,
    language: formData.language,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Only include created_by if available and valid
    ...(user?.id && { created_by: user.id }),
  };

  const { data, error } = await supabase.from("content")
    .insert(quizData)
    .select()
    .single();

  if (error) {
    console.error("Error creating quiz:", error)
    return { error: error.message }
  }

  revalidatePath(`/admin/courses/${formData.course_id}/quizzes`)
  revalidatePath(`/admin/dashboard`)
  return { success: true, id: data.id }
}

export async function updateQuiz(formData: any) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized. Admin access required." }
  }

  const { error } = await supabase
    .from("content")
    .update({
      title: formData.title,
      description: formData.description,
      language: formData.language,
      updated_at: new Date().toISOString(),
    })
    .eq("id", formData.id)

  if (error) {
    return { error: error.message }
  }

  // Get the course_id for this quiz
  const { data: quiz } = await supabase.from("content").select("course_id").eq("id", formData.id).single()

  revalidatePath(`/admin/courses/${quiz?.course_id}/quizzes`)
  return { success: true }
}

export async function deleteQuiz(formData: FormData) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized. Admin access required." }
  }

  const id = formData.get("id") as string
  if (!id) {
    return { error: "Quiz ID is required" }
  }

  // First get the course_id for this quiz
  const { data: quiz } = await supabase
    .from("content")
    .select("course_id")
    .eq("id", id)
    .single()

  if (!quiz) {
    return { error: "Quiz not found" }
  }

  // Delete all questions for this quiz
  const { error: questionsError } = await supabase
    .from("questions")
    .delete()
    .eq("quiz_id", id)

  if (questionsError) {
    console.error("Error deleting questions:", questionsError)
    return { error: "Failed to delete associated questions" }
  }

  // Delete the quiz
  const { error } = await supabase.from("content").delete().eq("id", id)

  if (error) {
    console.error("Error deleting quiz:", error)
    return { error: error.message }
  }

  revalidatePath(`/admin/courses/${quiz?.course_id}/quizzes`)
  return { success: true }
}

// Question actions
export async function createQuestion(formData: any) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized. Admin access required." }
  }

  const { data, error } = await supabase.from("questions").insert({
    quiz_id: formData.quiz_id,
    question_text: formData.question_text,
    options: formData.options,
    correct_answer: formData.correct_answer,
    explanation: formData.explanation || null,
  }).select().single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/courses/${formData.course_id}/quizzes/${formData.quiz_id}/questions`)
  return { success: true, id: data.id }
}

export async function updateQuestion(formData: any) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized. Admin access required." }
  }

  const { error } = await supabase
    .from("questions")
    .update({
      question_text: formData.question_text,
      options: formData.options,
      correct_answer: formData.correct_answer,
      explanation: formData.explanation || null,
    })
    .eq("id", formData.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/courses/${formData.course_id}/quizzes/${formData.quiz_id}/questions`)
  return { success: true }
}

export async function deleteQuestion(formData: FormData) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized. Admin access required." }
  }

  const id = formData.get("id") as string
  const quizId = formData.get("quizId") as string
  const courseId = formData.get("courseId") as string

  if (!id || !quizId || !courseId) {
    return { error: "Missing required fields" }
  }

  const { error } = await supabase.from("questions").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/courses/${courseId}/quizzes/${quizId}/questions`)
  return { success: true }
}

// Admin role management
export async function setAdminRole(userId: string) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  // Update the user's role to admin
  const { error } = await supabase
    .from("profiles")
    .update({
      role: "admin",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin")
  return { success: true }
}

