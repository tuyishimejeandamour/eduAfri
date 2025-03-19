import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

const resourceLinks = [
  { title: "All Courses", href: "/courses" },
  { title: "Mathematics", href: "/courses?subject=mathematics" },
  { title: "Science", href: "/courses?subject=science" },
  { title: "History", href: "/courses?subject=history" },
  { title: "Languages", href: "/courses?subject=languages" },
  { title: "Programming", href: "/courses?subject=programming" },
];

const aboutLinks = [
  { title: "About us", href: "/about" },
  { title: "Our Mission", href: "/mission" },
  { title: "Blog", href: "/blog" },
  { title: "Partnerships", href: "/partners" },
  { title: "Careers", href: "/careers" },
  { title: "Sustainability", href: "/sustainability" },
];

const supportLinks = [
  { title: "Help Center", href: "/help" },
  { title: "Contact Us", href: "/contact" },
  { title: "Technical Support", href: "/tech-support" },
  { title: "Offline Access", href: "/offline-guide" },
  { title: "FAQs", href: "/faqs" },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className=" py-16">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <Link href="/" className="font-bold text-xl">
              EduAfri
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Empowering education across Africa through accessible learning
              resources.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Learning Resources
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
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
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              About EduAfri
            </h3>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
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
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
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
      <div className="border-t">
        <div className=" flex flex-col md:flex-row items-center justify-between gap-4 py-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>© EduAfri {new Date().getFullYear()}</span>
            <span className="hidden md:inline">·</span>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy policy
            </Link>
            <span className="hidden md:inline">·</span>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="https://instagram.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link
              href="https://facebook.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link
              href="https://twitter.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
