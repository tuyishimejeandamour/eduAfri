import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import PersonalDashboard from "./components/dashboard";


export default async function DashboardPage({
  params
}: {
  params: Promise<{ lang: Locale }>
}) {

  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <PersonalDashboard dictionary={dict.dashboard} />
  );
}
