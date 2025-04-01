"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/app/[lang]/components/ui/button"
import { Card, CardContent, CardFooter } from "@/app/[lang]/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/[lang]/components/ui/form"
import { Input } from "@/app/[lang]/components/ui/input"
import { Textarea } from "@/app/[lang]/components/ui/textarea"
import { createLesson } from "@/lib/actions"
import { Loader2 } from "lucide-react"

// Define the form schema
const lessonFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content_html: z.string().min(10, "Content must be at least 10 characters"),
  order_in_course: z.number().int().positive(),
})

type LessonFormValues = z.infer<typeof lessonFormSchema>

interface LessonFormProps {
  lesson?: any
  courseId: string
  nextOrder: number
}

export function LessonForm({ lesson, courseId, nextOrder }: LessonFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createAnother, setCreateAnother] = useState(false)

  // Default values for the form
  const defaultValues: Partial<LessonFormValues> = {
    title: lesson?.title || "",
    description: lesson?.description || "",
    content_html: lesson?.content_html || "",
    order_in_course: lesson?.order_in_course || nextOrder,
  }

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues,
  })

  async function onSubmit(data: LessonFormValues) {
    setIsSubmitting(true)

    try {
      // Create new lesson
      const result = await createLesson({
        ...data,
        type: "lesson",
        course_id: courseId,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      if (createAnother) {
        // Reset form and stay on the page to create another lesson
        form.reset({
          title: "",
          description: "",
          content_html: "",
          order_in_course: nextOrder + 1,
        })
        setIsSubmitting(false)
      } else {
        // Redirect to the course detail page
        router.push(`/dashboard/courses/${courseId}`)
        router.refresh()
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduction to Numbers" {...field} />
                  </FormControl>
                  <FormDescription>The title of this lesson.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief introduction to numbers and counting..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>A short description of what this lesson covers.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content_html"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="<h1>Introduction to Numbers</h1><p>In this lesson, we will learn about numbers and how to count.</p>"
                      className="min-h-[200px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>The main content of the lesson in HTML format.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order_in_course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>The order of this lesson in the course.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/courses/${courseId}`)}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-1 sm:order-2">
              <Button type="submit" disabled={isSubmitting} onClick={() => setCreateAnother(false)} className="w-full">
                {isSubmitting && !createAnother && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Lesson
              </Button>

              <Button
                type="submit"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => setCreateAnother(true)}
                className="w-full"
              >
                {isSubmitting && createAnother && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Add Another
              </Button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

