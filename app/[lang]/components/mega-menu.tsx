"use client";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const courseCategories = [
  { title: "courses ", href: "/courses" },
  { title: "New arrivals", href: "/courses?sort=new" },
  { title: "Best Courses", href: "/courses?sort=popular" },
  { title: "Bundles", href: "/courses?type=bundle" },
];

const courseLinks = [
  { title: "Mathematics", href: "/courses?subject=mathematics" },
  { title: "Science", href: "/courses?subject=science" },
  { title: "History", href: "/courses?subject=history" },
  { title: "Languages", href: "/courses?subject=languages" },
  { title: "Programming", href: "/courses?subject=programming" },
];

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group" onMouseLeave={() => setIsOpen(false)}>
      <button
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors hover:text-primary"
        onMouseEnter={() => setIsOpen(true)}
      >
        Browse
      </button>

      <div
        className={cn(
          "absolute left-0 w-screen bg-background border-b",
          "opacity-0 invisible translate-y-2 transition-all duration-200",
          isOpen && "opacity-100 visible translate-y-0"
        )}
      >
        <div className=" py-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Sort by</h3>
              <ul className="space-y-2">
                {courseCategories.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Subjects</h3>
              <ul className="space-y-2">
                {courseLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
