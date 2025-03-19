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

  const { data, error } = await supabase
    .from("content")
    .insert({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      subject: formData.subject,
      grade_level: formData.grade_level,
      language: formData.language,
      creator_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true, id: data.id }
}

// Lesson actions
export async function createLesson(formData: any) {
  const supabase = await getServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("content")
    .insert({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      course_id: formData.course_id,
      content_html: formData.content_html,
      order_in_course: formData.order_in_course,
      creator_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/courses/${formData.course_id}`)
  return { success: true, id: data.id }
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

  // Start a transaction
  // First, create the quiz
  const { data: quiz, error: quizError } = await supabase
    .from("content")
    .insert({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      course_id: formData.course_id,
      language: formData.language,
      creator_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (quizError) {
    return { error: quizError.message }
  }

  // Then, create the questions
  const questions = formData.questions.map((question: any) => ({
    quiz_id: quiz.id,
    question_text: question.question_text,
    options: question.options,
    correct_answer: question.correct_answer,
    explanation: question.explanation || null,
  }))

  const { error: questionsError } = await supabase.from("questions").insert(questions)

  if (questionsError) {
    // If there's an error with the questions, we should delete the quiz
    await supabase.from("content").delete().eq("id", quiz.id)

    return { error: questionsError.message }
  }

  revalidatePath(`/dashboard/courses/${formData.course_id}`)
  return { success: true, id: quiz.id }
}

