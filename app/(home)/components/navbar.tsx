import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <Link href="/">EduAfri</Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <Link href="/courses">Courses</Link>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <Link href="#features">Features</Link>
          </motion.button>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 bg-eduscape rounded-full"></span>
          </Button>
          <Button variant="outline" className="rounded-full">
          <Link href={"/auth"}>Sign in</Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-sidebar-accent-foreground hover:bg-accent-foreground"
          >
            <Link href={"/auth"}>Join Now</Link>
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
              Courses
            </a>
            <a
              href="#features"
              className="text-eduscape-text hover:text-eduscape py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-eduscape-text hover:text-eduscape py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="text-eduscape-text hover:text-eduscape py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="pt-4 flex flex-col space-y-3">
              <Button variant="outline" className="w-full rounded-full">
                Sign In
              </Button>
              <Button className="w-full rounded-full bg-eduscape hover:bg-eduscape-dark">
                Join Now
              </Button>
            </div>
          </nav>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
