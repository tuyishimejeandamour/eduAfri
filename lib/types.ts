export type User = {
  id: string;
  email: string;
  username: string;
  language_preference: string;
  download_preference: "wifi_only" | "any_network";
  created_at: string;
  updated_at: string;
};

export type Content = {
  id: string;
  title: string;
  description: string;
  type: "course" | "lesson" | "quiz";
  language: string;
  subject?: string;
  grade_level?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
};

export type Course = Content & {
  subject: string;
  grade_level: string;
  lessons: string[]; // Array of lesson IDs
};

export type Lesson = Content & {
  course_id: string;
  content_html: string;
  order_in_course: number;
};

export type Quiz = Content & {
  lesson_id?: string;
  course_id?: string;
  questions: Question[];
};

export type Question = {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: number; // Index of the correct option
  explanation?: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  content_id: string;
  progress_percentage: number;
  completed: boolean;
  last_accessed: string;
};

export type DownloadedContent = {
  id: string;
  user_id: string;
  content_id: string;
  downloaded_at: string;
  size_bytes: number;
};

export type UserQuizResult = {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  completed_at: string;
  answers: Answers[];
};

export type Answers = {
  question_id: string;
  selected_option: number;
  is_correct: boolean;
};
