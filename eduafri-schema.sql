-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT,
  language_preference TEXT DEFAULT 'en',
  download_preference TEXT DEFAULT 'wifi_only',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create content table
CREATE TABLE IF NOT EXISTS public.content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('course', 'lesson', 'quiz')),
  language TEXT DEFAULT 'en',
  subject TEXT,
  grade_level TEXT,
  course_id UUID REFERENCES public.content(id),
  lesson_id UUID REFERENCES public.content(id),
  order_in_course INTEGER,
  content_html TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  progress_percentage INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Create downloaded_content table
CREATE TABLE IF NOT EXISTS public.downloaded_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  size_bytes INTEGER DEFAULT 0,
  UNIQUE(user_id, content_id)
);

-- Create user_quiz_results table
CREATE TABLE IF NOT EXISTS public.user_quiz_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES public.content(id) ON DELETE CASCADE NOT NULL,
  score NUMERIC NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  answers JSONB NOT NULL
);

-- Create languages table
CREATE TABLE IF NOT EXISTS public.languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloaded_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Content: Anyone can read content
CREATE POLICY "Anyone can read content" 
  ON public.content FOR SELECT USING (true);

-- Questions: Anyone can read questions
CREATE POLICY "Anyone can read questions" 
  ON public.questions FOR SELECT USING (true);

-- User Progress: Users can only read/update their own progress
CREATE POLICY "Users can view their own progress" 
  ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- Downloaded Content: Users can only read/update their own downloads
CREATE POLICY "Users can view their own downloads" 
  ON public.downloaded_content FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own downloads" 
  ON public.downloaded_content FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own downloads" 
  ON public.downloaded_content FOR DELETE USING (auth.uid() = user_id);

-- Quiz Results: Users can only read/update their own results
CREATE POLICY "Users can view their own quiz results" 
  ON public.user_quiz_results FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own quiz results" 
  ON public.user_quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Languages: Anyone can read languages
CREATE POLICY "Anyone can read languages" 
  ON public.languages FOR SELECT USING (true);

-- Create trigger to create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

