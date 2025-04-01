"use client";

import Navbar from "./components/navbar";
import { useEffect } from "react";
import DetailsSection from "./components/details";
import FeaturedCourses from "./components/featuredCourse";
import HeroSection from "./components/hero";
import OfflineFeature from "./components/offilneFeature";
import StatsSection from "./components/stats";
import { SiteFooter } from "@/app/[lang]/components/site-footer";
import React from "react";
import { motion } from "framer-motion";

export default function Home() {
  useEffect(() => {
    // Smooth scroll implementation for section navigation
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = (e.currentTarget as HTMLAnchorElement).getAttribute(
          "href"
        );
        if (targetId && targetId !== "#") {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
            });
          }
        }
      });
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <Navbar />
      <motion.main
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8"
      >
        <HeroSection />
        <FeaturedCourses />
        <StatsSection />
        <OfflineFeature />
        <DetailsSection />
      </motion.main>
      <SiteFooter />
    </motion.div>
  );
}
