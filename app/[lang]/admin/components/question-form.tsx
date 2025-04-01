"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray, FieldValues } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/app/[lang]/components/ui/button"
import { Card, CardContent, CardFooter } from "@/app/[lang]/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/app/[lang]/components/ui/form"
import { Input } from "@/app/[lang]/components/ui/input"
import { Textarea } from "@/app/[lang]/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/app/[lang]/components/ui/radio-group"
import { createQuestion, updateQuestion } from "@/app/[lang]/admin/actions"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Type for an option field
type OptionField = string;

// Define the form schema
const questionFormSchema = z.object({
  question_text: z.string().min(3, "Question must be at least 3 characters"),
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  correct_answer: z.string().min(0, "Please select the correct answer"),
  explanation: z.string().optional(),
})

type QuestionFormValues = z.infer<typeof questionFormSchema> & FieldValues

interface QuestionFormProps {
  question?: any
  quizId: string
  courseId: string
}

export function QuestionForm({ question, quizId, courseId }: QuestionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      question_text: question?.question_text || "",
      options: question?.options || ["", ""],
      correct_answer: question?.correct_answer?.toString() || "0",
      explanation: question?.explanation || "",
    },
  })

  const { fields, append, remove } = useFieldArray<QuestionFormValues>({
    name: "options",
    control: form.control,
  })

  // Update the append button to use an empty array item
  const addEmptyOption = () => {
    append("")
  }

  async function onSubmit(data: QuestionFormValues) {
    setIsSubmitting(true)

    try {
      const formattedData = {
        ...data,
        correct_answer: Number.parseInt(data.correct_answer, 10),
      }

      if (question) {
        // Update existing question
        const result = await updateQuestion({
          id: question.id,
          ...formattedData,
          quiz_id: quizId,
        })

        if (result.error) {
          toast.error("Error updating question", {
            description: result.error,
          });
          throw new Error(result.error)
        }

        toast.success("Question updated", {
          description: "Your question has been updated successfully.",
        })
      } else {
        // Create new question
        const result = await createQuestion({
          ...formattedData,
          quiz_id: quizId,
        })

        if (result.error) {
          toast.error("Error creating question", {
            description: result.error,
          });
          throw new Error(result.error)
        }

        toast.success("Question created", {
          description: "Your question has been created successfully.",
        })
      }

      router.push(`/admin/courses/${courseId}/quizzes/${quizId}/questions`)
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      // Handle error (could add toast notification here)
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
              name="question_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is 5 + 7?" className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormDescription>Enter the question text.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Answer Options</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addEmptyOption} className="h-8 gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Add Option
                </Button>
              </div>

              <FormField
                control={form.control}
                name="correct_answer"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                        {fields.map((item, index) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <FormField
                              control={form.control}
                              name={`options.${index}`}
                              render={({ field: optionField }) => (
                                <FormItem className="flex-grow">
                                  <div className="flex items-center gap-2">
                                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                    <FormControl>
                                      <Input placeholder={`Option ${index + 1}`} {...optionField} />
                                    </FormControl>
                                    {fields.length > 2 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => remove(index)}
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
              name="explanation"
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

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/courses/${courseId}/quizzes/${quizId}/questions`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {question ? "Update Question" : "Add Question"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

