import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import ProfileClient from "./profile-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);

  return <ProfileClient dictionary={dictionary.profile} />;
}
