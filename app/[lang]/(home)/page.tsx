import Navbar from "./components/navbar";
import DetailsSection from "./components/details";
import FeaturedCourses from "./components/featuredCourse";
import HeroSection from "./components/hero";
import OfflineFeature from "./components/offilneFeature";
import StatsSection from "./components/stats";
import { SiteFooter } from "@/app/[lang]/components/site-footer";
import React from "react";
import { getDictionary } from '@/get-dictionary';
import { Locale } from "@/i18n-config";

export default async function Home({
  params
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div
      className="min-h-screen bg-white"
    >
      <Navbar dictionary={dict.home.navbar} />
      <main
        className="mt-8"
      >
        <HeroSection dictionary={dict.home.hero} />
        <FeaturedCourses dictionary={dict.home.featuredCourses} />
        <StatsSection dictionary={dict.home.stats} />
        <OfflineFeature dictionary={dict.home.offlineFeature} />
        <DetailsSection dictionary={dict.home.details} />
      </main>
      <SiteFooter />
    </div>
  );
}
