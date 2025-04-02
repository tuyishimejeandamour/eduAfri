# EduAfri Learning Platform

An educational platform built with Next.js and Supabase, featuring multilingual support, offline access, and interactive learning content.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [pnpm](https://pnpm.io/installation) (preferred package manager)
- [Supabase](https://supabase.com/) account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd summartive
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Set Up Supabase Project

1. Create a new project at [Supabase](https://supabase.com/)
2. Get your project URL and API keys from the Supabase dashboard
3. Set up the database schema by running: sql code from [eduafri-schema](./eduafri-schema.sql)
in sql editor supabase


This script will create all required tables and security policies for the application.

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### 6. Build for Production

When you're ready to deploy:

```bash
pnpm build
pnpm start
```

## Features

- **Multilingual Support**: Available in English, French, Kinyarwanda, and Swahili
- **Offline Access**: Download courses for offline learning
- **Interactive Quizzes**: Test knowledge with interactive quizzes
- **Progress Tracking**: Track course and lesson completion
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

- `/app/[lang]` - Internationalized routes
- `/app/[lang]/(content)` - Main content pages
- `/app/[lang]/(home)` - Home page components
- `/app/[lang]/admin` - Admin dashboard
- `/dictionaries` - Language translation files
- `/hooks` - Custom React hooks
- `/lib` - Utility functions and services
- `/public` - Static assets

## Database Schema

The application uses the following main database tables:

- `profiles` - User profiles and preferences
- `content` - Course, lesson, and quiz content
- `questions` - Quiz questions and answers
- `user_progress` - User learning progress
- `downloaded_content` - User's downloaded content
- `user_quiz_results` - Quiz attempt results
- `languages` - Supported languages

## Authentication

Authentication is handled through Supabase Auth. The application supports:

- Email/password authentication
- OAuth providers (if configured in Supabase)
- Offline authentication when internet is unavailable

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
