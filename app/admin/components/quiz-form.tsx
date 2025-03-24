"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createQuiz, updateQuiz } from "@/app/admin/actions"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Define the form schema
const quizFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  language: z.string().min(1, "Language is required"),
})

type QuizFormValues = z.infer<typeof quizFormSchema>

interface QuizFormProps {
  quiz?: any
  courseId: string
  languages: { code: string; name: string }[]
}

export function QuizForm({ quiz, courseId, languages }: QuizFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default values for the form
  const defaultValues: Partial<QuizFormValues> = {
    title: quiz?.title || "",
    description: quiz?.description || "",
    language: quiz?.language || "en",
  }

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues,
  })

  async function onSubmit(data: QuizFormValues) {
    setIsSubmitting(true)

    try {
      if (quiz) {
        // Update existing quiz
        const result = await updateQuiz({
          id: quiz.id,
          ...data,
        })

        if (result.error) {
          toast({
            variant: "destructive",
            title: "Error updating quiz",
            description: result.error,
          })
          throw new Error(result.error)
        }

        toast({
          title: "Quiz updated",
          description: "Your quiz has been updated successfully.",
        })

        router.push(`/admin/courses/${courseId}/quizzes`)
        router.refresh()
      } else {
        // Create new quiz
        const result = await createQuiz({
          ...data,
          type: "quiz",
          course_id: courseId,
        })

        if (result.error) {
          toast({
            variant: "destructive",
            title: "Error creating quiz",
            description: result.error,
          })
          throw new Error(result.error)
        }

        toast({
          title: "Quiz created",
          description: "Your quiz has been created successfully.",
        })

        router.push(`/admin/courses/${courseId}/quizzes`)
        router.refresh()
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
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
                  <FormLabel>Quiz Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Basic Math Quiz" {...field} />
                  </FormControl>
                  <FormDescription>The name of your quiz as it will appear to students.</FormDescription>
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
                      placeholder="Test your knowledge of basic mathematical concepts..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Provide a brief description of what this quiz covers.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>The primary language of the quiz content.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/courses/${courseId}/quizzes`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {quiz ? "Update Quiz" : "Create Quiz"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

