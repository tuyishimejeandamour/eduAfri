import type React from "react";
import Link from "next/link";
import {
  Home,
  BookOpen,
  Search,
  Download,
  User,
  Menu,
  DownloadCloud,
} from "lucide-react";
import { Button } from "@/app/[lang]/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/app/[lang]/components/ui/sheet";
import { cn } from "@/lib/utils";
import { OfflineDetector } from "@/app/[lang]/components/offline-detector";
import { AnnouncementBar } from "@/app/[lang]/components/announcement-bar";
import { MegaMenu } from "@/app/[lang]/components/mega-menu";
import { SiteFooter } from "@/app/[lang]/components/site-footer";
import { OfflineBanner } from "@/app/[lang]/components/offline-banner";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex w-full min-h-screen flex-col">
      <OfflineBanner />
      <OfflineDetector />
      <AnnouncementBar />
      <header className="sticky w-full top-0 z-40 bg-background border-b">
        <div className=" flex h-16 max-w-7xl mx-auto items-center justify-between">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-4 py-4">
                <MobileNav />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <MegaMenu />
            <Link
              href="/search"
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
          </div>

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <span className="font-bold text-xl">EduAfri</span>
          </Link>

          {/* Right Side Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/downloads" className="flex items-center gap-1">
              <Button variant="ghost" size="icon">
                <DownloadCloud className="h-5 w-5" />
                <span className="sr-only">Downloads</span>
              </Button>
              <span className="text-xs font-medium">0</span>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto  py-6 animate-fade-in">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

function MobileNav({ className }: { className?: string }) {
  return (
    <nav className={cn("flex items-center justify-between", className)}>
      <Link
        href="/dashboard"
        className="flex flex-col items-center gap-1 text-xs font-medium"
      >
        <Home className="h-5 w-5" />
        Dashboard
      </Link>
      <Link
        href="/courses"
        className="flex flex-col items-center gap-1 text-xs font-medium"
      >
        <BookOpen className="h-5 w-5" />
        Courses
      </Link>
      <Link
        href="/search"
        className="flex flex-col items-center gap-1 text-xs font-medium"
      >
        <Search className="h-5 w-5" />
        Search
      </Link>
      <Link
        href="/downloads"
        className="flex flex-col items-center gap-1 text-xs font-medium"
      >
        <Download className="h-5 w-5" />
        Downloads
      </Link>
      <Link
        href="/profile"
        className="flex flex-col items-center gap-1 text-xs font-medium"
      >
        <User className="h-5 w-5" />
        Profile
      </Link>
    </nav>
  );
}
