import { Locale } from "@/i18n-config";
import Downloads from "./components/downloadPage";
import { getDictionary } from "@/get-dictionary";

export default async function DownloadsPage({
  params
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params;
    const dict = await getDictionary(lang);
  
  return (
    <Downloads dictionary={dict.downloads} />
  );
}
