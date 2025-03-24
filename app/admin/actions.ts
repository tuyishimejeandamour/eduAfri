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
    throw new Error("Not authenticated")
  }

  // Verify user has admin role (you should add this check)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized. Admin access required.")
  }

  const { error } = await supabase.from("content").insert({
    title: formData.title,
    description: formData.description,
    type: formData.type,
    subject: formData.subject,
    grade_level: formData.grade_level,
    language: formData.language,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: user.id,
  })

  if (error) {
    console.error("Error creating course:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/courses")
}

export async function updateCourse(formData: any) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized. Admin access required.")
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
    throw new Error(error.message)
  }

  revalidatePath("/admin/courses")
}

export async function deleteCourse(formData: FormData) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Not authenticated")
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized. Admin access required.")
  }

  const id = formData.get("id") as string
  if (!id) {
    throw new Error("Course ID is required")
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
      throw new Error("Failed to delete associated questions")
    }

    // Delete the quizzes
    const { error: quizzesError } = await supabase
      .from("content")
      .delete()
      .in("id", quizIds)

    if (quizzesError) {
      console.error("Error deleting quizzes:", quizzesError)
      throw new Error("Failed to delete associated quizzes")
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
    throw new Error("Failed to delete associated lessons")
  }

  // Finally delete the course
  const { error } = await supabase.from("content").delete().eq("id", id)

  if (error) {
    console.error("Error deleting course:", error)
    throw new Error(error.message)
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

  const { error } = await supabase.from("content").insert({
    title: formData.title,
    description: formData.description,
    type: formData.type,
    course_id: formData.course_id,
    language: formData.language,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: user.id,
  })

  if (error) {
    console.error("Error creating quiz:", error)
    return { error: error.message }
  }

  revalidatePath(`/admin/courses/${formData.course_id}/quizzes`)
  return { success: true }
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
    throw new Error("Not authenticated")
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized. Admin access required.")
  }

  const id = formData.get("id") as string
  if (!id) {
    throw new Error("Quiz ID is required")
  }

  // First get the course_id for this quiz
  const { data: quiz } = await supabase
    .from("content")
    .select("course_id")
    .eq("id", id)
    .single()

  if (!quiz) {
    throw new Error("Quiz not found")
  }

  // Delete all questions for this quiz
  const { error: questionsError } = await supabase
    .from("questions")
    .delete()
    .eq("quiz_id", id)

  if (questionsError) {
    console.error("Error deleting questions:", questionsError)
    throw new Error("Failed to delete associated questions")
  }

  // Delete the quiz
  const { error } = await supabase.from("content").delete().eq("id", id)

  if (error) {
    console.error("Error deleting quiz:", error)
    throw new Error(error.message)
  }

  revalidatePath(`/admin/courses/${quiz?.course_id}/quizzes`)
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

  const { error } = await supabase.from("questions").insert({
    quiz_id: formData.quiz_id,
    question_text: formData.question_text,
    options: formData.options,
    correct_answer: formData.correct_answer,
    explanation: formData.explanation || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/courses/${formData.course_id}/quizzes/${formData.quiz_id}/questions`)
  return { success: true }
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
    throw new Error("Not authenticated")
  }

  // Verify user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized. Admin access required.")
  }

  const id = formData.get("id") as string
  const quizId = formData.get("quizId") as string
  const courseId = formData.get("courseId") as string

  if (!id || !quizId || !courseId) {
    throw new Error("Missing required fields")
  }

  const { error } = await supabase.from("questions").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/admin/courses/${courseId}/quizzes/${quizId}/questions`)
}

