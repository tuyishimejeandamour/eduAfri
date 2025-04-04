"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/[lang]/components/ui/card";
import { Button } from "@/app/[lang]/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/app/[lang]/components/ui/radio-group";
import { Label } from "@/app/[lang]/components/ui/label";
import { submitQuizResult } from "@/app/[lang]/actions";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getDictionary } from "@/get-dictionary";

interface QuizPageProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["quiz"]
}

export default function QuizPageClient({ dictionary }: QuizPageProps) {
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { id, lang } = useParams();
  
  // Use the language parameter from the URL
  const currentLanguage = Array.isArray(lang) ? lang[0] : (lang || 'en');

  // Helper function to get the correct language for navigation
  const getLanguagePath = () => {
    // Extract language from path as backup
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const pathLang = pathParts[1];
      return ['en', 'fr', 'rw', 'sw'].includes(pathLang) ? pathLang : currentLanguage;
    }
    return currentLanguage;
  };

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const { data: quizData, error: quizError } = await supabase
          .from("content")
          .select("*")
          .eq("id", id)
          .single();

        if (quizError) throw quizError;
        setQuiz(quizData);

        const { data: questionsData, error: questionsError } = await supabase
          .from("questions")
          .select("*")
          .eq("quiz_id", id)
          .order("id", { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast.error("Failed to load quiz. Please try again.");
        router.push(`/${getLanguagePath()}/courses`);
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [id, router, supabase]);

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    const quizResults = questions.map((question) => {
      const selectedOption = answers[question.id] !== undefined ? answers[question.id] : -1;
      const isCorrect = selectedOption === question.correct_answer;
      if (isCorrect) correctAnswers++;

      return {
        question_id: question.id,
        selected_option: selectedOption,
        is_correct: isCorrect,
      };
    });

    const finalScore = (correctAnswers / questions.length) * 100;
    setScore(finalScore);
    submitQuizResult(id as string, finalScore, quizResults);
  };

  const handleFinish = () => {
    router.push(`/${getLanguagePath()}/courses`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-lg mb-4">{dictionary.notFound}</p>
        <Button onClick={() => router.push(`/${getLanguagePath()}/courses`)}>
          {dictionary.backToCourses}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight animate-fade-in">
          {quiz.title}
        </h1>
        <div className="text-sm text-muted-foreground">
          {dictionary.questionCounter.replace('{current}', (currentQuestion + 1).toString()).replace('{total}', questions.length.toString())}
        </div>
      </div>

      {!showResults ? (
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>{dictionary.questionNumber.replace('{number}', (currentQuestion + 1).toString())}</CardTitle>
            <CardDescription>
              {questions[currentQuestion]?.question_text}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[questions[currentQuestion]?.id]?.toString()}
              onValueChange={(value) =>
                handleAnswer(
                  questions[currentQuestion]?.id,
                  Number.parseInt(value)
                )
              }
              className="space-y-3"
            >
              {questions[currentQuestion]?.options.map(
                (option: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 animate-bounce-in"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                    />
                    <Label htmlFor={`option-${index}`} className="flex-1">
                      {option}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> {dictionary.previous}
            </Button>
            <Button
              onClick={handleNext}
              disabled={answers[questions[currentQuestion]?.id] === undefined}
              className="flex items-center gap-2"
            >
              {currentQuestion < questions.length - 1 ? (
                <>
                  {dictionary.next} <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                dictionary.finish
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="animate-bounce-in">
          <CardHeader>
            <CardTitle>{dictionary.results}</CardTitle>
            <CardDescription>
              {dictionary.scoreText.replace('{score}', score.toFixed(0))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">
                    {score.toFixed(0)}%
                  </span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="10"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray={`${score * 2.51} 251.2`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              {questions.map((question, index) => {
                const selectedOption =
                  answers[question.id] !== undefined ? answers[question.id] : -1;
                const isCorrect = selectedOption === question.correct_answer;

                return (
                  <div
                    key={question.id}
                    className="p-4 border rounded-md animate-fade-in"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium">{question.question_text}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedOption >= 0 ? (
                            <>Your answer: {question.options[selectedOption]}</>
                          ) : (
                            "Unanswered"
                          )}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            {dictionary.correctAnswer}{" "}
                            {question.options[question.correct_answer]}
                          </p>
                        )}
                        {question.explanation && (
                          <p className="text-sm mt-2 p-2 bg-muted rounded-md">
                            {dictionary.explanation}: {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleFinish} className="w-full">
              {dictionary.backToCourses}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}