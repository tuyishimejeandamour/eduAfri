import { getDictionary } from '@/get-dictionary'
import { Locale } from '@/i18n-config'
import QuizClient from './quiz-client'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <QuizClient dictionary={dictionary.quiz} />
  );
}
