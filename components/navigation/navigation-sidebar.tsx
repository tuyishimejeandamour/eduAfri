"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  Compass, 
  Download, 
  FileQuestion, 
  Home, 
  LayoutDashboard, 
  Search, 
  User 
} from "lucide-react";

type NavigationItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
  requiresOnline?: boolean;
};

interface NavigationSidebarProps {
  isOffline?: boolean;
}

export const NavigationSidebar = ({ isOffline = false }: NavigationSidebarProps) => {
  const pathname = usePathname();

  const routes: NavigationItem[] = [
    {
      icon: <Home className="h-4 w-4 mr-2" />,
      label: "Home",
      href: "/",
      active: pathname === "/",
      requiresOnline: false,
    },
    {
      icon: <LayoutDashboard className="h-4 w-4 mr-2" />,
      label: "Dashboard",
      href: "/dashboard",
      active: pathname === "/dashboard",
      requiresOnline: true,
    },
    {
      icon: <Compass className="h-4 w-4 mr-2" />,
      label: "Browse",
      href: "/courses",
      active: pathname === "/courses",
      requiresOnline: false,
    },
    {
      icon: <Search className="h-4 w-4 mr-2" />,
      label: "Search",
      href: "/search",
      active: pathname === "/search",
      requiresOnline: true,
    },
    {
      icon: <BookOpen className="h-4 w-4 mr-2" />,
      label: "My Learning",
      href: "/dashboard/courses",
      active: pathname === "/dashboard/courses",
      requiresOnline: true,
    },
    {
      icon: <FileQuestion className="h-4 w-4 mr-2" />,
      label: "Quizzes",
      href: "/quiz",
      active: pathname.startsWith("/quiz"),
      requiresOnline: false,
    },
    {
      icon: <Download className="h-4 w-4 mr-2" />,
      label: "Offline",
      href: "/offline",
      active: pathname === "/offline",
      requiresOnline: false,
    },
    {
      icon: <User className="h-4 w-4 mr-2" />,
      label: "Profile",
      href: "/profile",
      active: pathname === "/profile",
      requiresOnline: true,
    },
  ];

  // Filter routes based on online/offline status
  const availableRoutes = isOffline 
    ? routes.filter(route => !route.requiresOnline) 
    : routes;

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-white shadow-sm">
      <div className="p-6">
        <Link href="/">
          <h1 className="text-2xl font-bold">
            Learning Platform
          </h1>
          {isOffline && (
            <p className="text-sm text-muted-foreground mt-1">Offline Mode</p>
          )}
        </Link>
      </div>
      <div className="flex flex-col w-full">
        {availableRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={`
              flex items-center gap-x-2 text-sm font-medium p-3 hover:text-primary hover:bg-slate-100/50
              ${route.active ? "text-primary bg-sky-100/50" : "text-slate-500"}
            `}
          >
            {route.icon}
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
};