"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bell, Menu, X, Globe } from "lucide-react";
import { Button } from "@/app/[lang]/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { type getDictionary } from "@/get-dictionary";
import { useParams, useRouter } from "next/navigation";
import { i18n, Locale } from "@/i18n-config";

interface NavbarProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["home"]["navbar"];
}

const Navbar = ({ dictionary }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const currentLang = params.lang as Locale;

  // Handle language change
  const changeLanguage = (locale: Locale) => {
    // Replace the current URL's language segment with the new locale
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${currentLang}`, `/${locale}`);
    router.push(newPath);
    setIsLanguageMenuOpen(false);
  };

  // Keyboard shortcut for language switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        // Cycle through languages
        const currentIndex = i18n.locales.indexOf(currentLang);
        const nextIndex = (currentIndex + 1) % i18n.locales.length;
        changeLanguage(i18n.locales[nextIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentLang]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8 py-3",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.1 }} className="text-2xl font-bold">
          <Link href="/">{dictionary.brand}</Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <Link href="/courses">{dictionary.courses}</Link>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <Link href="#features">{dictionary.features}</Link>
          </motion.button>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {/* Language Selector */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex px-2 items-center justify-center"
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              title="Change language (Ctrl+X)"
            >
              <Globe size={20} />
              <span className="ml-1 text-xs font-bold uppercase">{currentLang}</span>
            </Button>
            
            {isLanguageMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in">
                {i18n.locales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => changeLanguage(locale)}
                    className={cn(
                      "block w-full text-left px-4 py-2 text-sm hover:bg-gray-100",
                      locale === currentLang ? "font-bold bg-gray-50" : ""
                    )}
                  >
                    {locale === "en" && "English"}
                    {locale === "fr" && "Français"}
                    {locale === "rw" && "Kinyarwanda"}
                    {locale === "sw" && "Kiswahili"}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="outline" className="rounded-full">
          <Link href={"/auth"}>{dictionary.signIn}</Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-sidebar-accent-foreground hover:bg-accent-foreground"
          >
            <Link href={"/auth"}>{dictionary.joinNow}</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md p-4 z-50 animate-fade-in">
          <nav className="flex flex-col space-y-4 py-2">
            <a
              href="#courses"
              className="text-eduscape-text hover:text-eduscape py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {dictionary.courses}
            </a>
            <a
              href="#features"
              className="text-eduscape-text hover:text-eduscape py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {dictionary.features}
            </a>
            <a
              href="#testimonials"
              className="text-eduscape-text hover:text-eduscape py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {dictionary.testimonials}
            </a>
            <a
              href="#pricing"
              className="text-eduscape-text hover:text-eduscape py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {dictionary.pricing}
            </a>
            
            {/* Language Selector for Mobile */}
            <div className="py-2 border-t">
              <p className="text-sm text-gray-500 mb-2">Language:</p>
              <div className="flex flex-wrap gap-2">
                {i18n.locales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => changeLanguage(locale)}
                    className={cn(
                      "px-3 py-1 rounded-md text-sm",
                      locale === currentLang 
                        ? "bg-sidebar-accent-foreground text-white" 
                        : "bg-gray-100 hover:bg-gray-200"
                    )}
                  >
                    {locale.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Press Ctrl+X to cycle languages</p>
            </div>
            
            <div className="pt-4 flex flex-col space-y-3">
              <Button variant="outline" className="w-full rounded-full">
                {dictionary.signIn}
              </Button>
              <Button className="w-full rounded-full bg-eduscape hover:bg-eduscape-dark">
                {dictionary.joinNow}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
