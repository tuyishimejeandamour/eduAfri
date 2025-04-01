import Navbar from "./components/navbar";
import DetailsSection from "./components/details";
import FeaturedCourses from "./components/featuredCourse";
import HeroSection from "./components/hero";
import OfflineFeature from "./components/offilneFeature";
import StatsSection from "./components/stats";
import { SiteFooter } from "@/app/[lang]/components/site-footer";
import React from "react";

export default function Home() {
 

  return (
    <div
      className="min-h-screen bg-white"
    >
      <Navbar />
      <main
        className="mt-8"
      >
        <HeroSection />
        <FeaturedCourses />
        <StatsSection />
        <OfflineFeature />
        <DetailsSection />
      </main>
      <SiteFooter />
    </div>
  );
}
