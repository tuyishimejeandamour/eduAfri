"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/app/[lang]/components/ui/button";

interface AdminSidebarProps {
  className?: string;
}

type NavigationItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
};

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const routes: NavigationItem[] = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      href: "/admin/dashboard",
      active: pathname === "/admin/dashboard",
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: "Courses",
      href: "/admin/courses",
      active: pathname === "/admin/courses" || pathname.startsWith("/admin/courses/"),
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: "Quizzes",
      href: "/admin/quizzes",
      active: pathname === "/admin/quizzes" || pathname.startsWith("/admin/quizzes/"),
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Content",
      href: "/admin/content",
      active: pathname === "/admin/content" || pathname.startsWith("/admin/content/"),
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      href: "/admin/users",
      active: pathname === "/admin/users",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/admin/settings",
      active: pathname === "/admin/settings",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border relative transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[250px]",
        className
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <Link href="/admin/dashboard" className={cn("flex items-center", collapsed && "justify-center")}>
          <span className={cn("font-bold text-xl", collapsed && "sr-only")}>EduAfri</span>
          {collapsed && <BookOpen className="h-6 w-6" />}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 py-6 space-y-1 overflow-y-auto">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              route.active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              collapsed && "justify-center px-0"
            )}
          >
            <div className={cn("min-w-[32px] flex justify-center")}>
              {route.icon}
            </div>
            <span className={cn("ml-3 text-sm", collapsed && "sr-only")}>{route.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <Link
          href="/auth/logout"
          className={cn(
            "flex items-center px-4 py-2 text-sm text-sidebar-foreground rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5" />
          <span className={cn("ml-3", collapsed && "sr-only")}>Logout</span>
        </Link>
      </div>
    </div>
  );
}