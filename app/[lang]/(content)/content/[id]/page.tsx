import { getDictionary } from '@/get-dictionary';
import ContentClient from './content-client';
import { Locale } from '@/i18n-config';

export default async function ContentPage({
  params
}: {
  params: Promise<{ lang: Locale; id: string }>
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return (
    <ContentClient dictionary={dictionary.content} />
  );
}
