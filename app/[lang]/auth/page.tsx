import { AuthForm } from "@/app/[lang]/components/auth-form";
import { getDictionary } from '@/get-dictionary';
import { Locale } from "@/i18n-config";

export default async function AuthPage({
  params
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <AuthForm dictionary={dict.auth} />
    </div>
  );
}
