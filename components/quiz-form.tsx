"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createQuiz } from "@/lib/actions"
import { Loader2, Plus, Trash2 } from "lucide-react"

// Define the form schema
const quizFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  language: z.string().min(1, "Language is required"),
  questions: z
    .array(
      z.object({
        question_text: z.string().min(3, "Question must be at least 3 characters"),
        options: z.array(z.string().min(1, "Option cannot be empty")).min(2, "At least 2 options are required"),
        correct_answer: z.number().min(0, "Please select the correct answer"),
        explanation: z.string().optional(),
      }),
    )
    .min(1, "At least one question is required"),
})

type QuizFormValues = z.infer<typeof quizFormSchema>

interface QuizFormProps {
  quiz?: any
  courseId: string
  languages: { code: string; name: string }[]
}

export function QuizForm({ quiz, courseId, languages }: QuizFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Default values for the form
  const defaultValues: Partial<QuizFormValues> = {
    title: quiz?.title || "",
    description: quiz?.description || "",
    language: quiz?.language || "en",
    questions: quiz?.questions || [
      {
        question_text: "",
        options: ["", ""],
        correct_answer: 0,
        explanation: "",
      },
    ],
  }

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  })

  async function onSubmit(data: QuizFormValues) {
    setIsSubmitting(true)

    try {
      // Create new quiz
      const result = await createQuiz({
        ...data,
        type: "quiz",
        course_id: courseId,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // Redirect to the course detail page
      router.push(`/dashboard/courses/${courseId}`)
      router.refresh()
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
                      className="min-h-[80px]"
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

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Questions</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      question_text: "",
                      options: ["", ""],
                      correct_answer: 0,
                      explanation: "",
                    })
                  }
                  className="h-8 gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Question
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Question {index + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="h-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove question</span>
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`questions.${index}.question_text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Textarea placeholder="What is 5 + 7?" className="min-h-[80px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel>Answer Options</FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentOptions = form.getValues(`questions.${index}.options`) || []
                            form.setValue(`questions.${index}.options`, [...currentOptions, ""])
                          }}
                          className="h-8 gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Option
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`questions.${index}.correct_answer`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => field.onChange(Number.parseInt(value))}
                                value={field.value.toString()}
                                className="space-y-3"
                              >
                                {form.watch(`questions.${index}.options`)?.map((_, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2">
                                    <RadioGroupItem
                                      value={optionIndex.toString()}
                                      id={`q${index}-option-${optionIndex}`}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`questions.${index}.options.${optionIndex}`}
                                      render={({ field: optionField }) => (
                                        <FormItem className="flex-grow">
                                          <div className="flex items-center gap-2">
                                            <FormControl>
                                              <Input placeholder={`Option ${optionIndex + 1}`} {...optionField} />
                                            </FormControl>
                                            {form.watch(`questions.${index}.options`).length > 2 && (
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                  const currentOptions = [
                                                    ...form.getValues(`questions.${index}.options`),
                                                  ]
                                                  currentOptions.splice(optionIndex, 1)
                                                  form.setValue(`questions.${index}.options`, currentOptions)

                                                  // If we're removing the correct answer or an option before it, adjust the correct answer
                                                  const currentCorrectAnswer = form.getValues(
                                                    `questions.${index}.correct_answer`,
                                                  )
                                                  if (optionIndex === currentCorrectAnswer) {
                                                    form.setValue(`questions.${index}.correct_answer`, 0)
                                                  } else if (optionIndex < currentCorrectAnswer) {
                                                    form.setValue(
                                                      `questions.${index}.correct_answer`,
                                                      currentCorrectAnswer - 1,
                                                    )
                                                  }
                                                }}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormDescription>Select the correct answer.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`questions.${index}.explanation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Explanation (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="The sum of 5 and 7 is 12." className="min-h-[80px]" {...field} />
                          </FormControl>
                          <FormDescription>Provide an explanation for the correct answer.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              ))}

              {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">No questions added yet</p>
                  <Button
                    type="button"
                    onClick={() =>
                      append({
                        question_text: "",
                        options: ["", ""],
                        correct_answer: 0,
                        explanation: "",
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Question
                  </Button>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/courses/${courseId}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Quiz
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

