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

  const { error } = await supabase.from("content").insert({
    title: formData.title,
    description: formData.description,
    type: formData.type,
    subject: formData.subject,
    grade_level: formData.grade_level,
    language: formData.language,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/courses")
  return { success: true }
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

  const id = formData.get("id") as string

  // First delete all quizzes associated with this course
  const { data: quizzes } = await supabase.from("content").select("id").eq("type", "quiz").eq("course_id", id)

  if (quizzes && quizzes.length > 0) {
    const quizIds = quizzes.map((quiz) => quiz.id)

    // Delete all questions for these quizzes
    await supabase.from("questions").delete().in("quiz_id", quizIds)

    // Delete the quizzes
    await supabase.from("content").delete().in("id", quizIds)
  }

  // Delete all lessons associated with this course
  await supabase.from("content").delete().eq("type", "lesson").eq("course_id", id)

  // Finally delete the course
  const { error } = await supabase.from("content").delete().eq("id", id)

  if (error) {
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

  const { error } = await supabase.from("content").insert({
    title: formData.title,
    description: formData.description,
    type: formData.type,
    course_id: formData.course_id,
    language: formData.language,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) {
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
    return { error: "Not authenticated" }
  }

  const id = formData.get("id") as string

  // First get the course_id for this quiz
  const { data: quiz } = await supabase.from("content").select("course_id").eq("id", id).single()

  // Delete all questions for this quiz
  await supabase.from("questions").delete().eq("quiz_id", id)

  // Delete the quiz
  const { error } = await supabase.from("content").delete().eq("id", id)

  if (error) {
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
    return { error: "Not authenticated" }
  }

  const id = formData.get("id") as string
  const quizId = formData.get("quizId") as string
  const courseId = formData.get("courseId") as string

  const { error } = await supabase.from("questions").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/courses/${courseId}/quizzes/${quizId}/questions`)
  return { success: true }
}

