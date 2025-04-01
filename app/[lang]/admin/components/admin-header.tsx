"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bell, User, Search } from "lucide-react";
import { Button } from "@/app/[lang]/components/ui/button";
import Link from "next/link";

interface AdminHeaderProps {
  className?: string;
}

export function AdminHeader({ className }: AdminHeaderProps) {
  const [searchVisible, setSearchVisible] = useState(false);
  
  return (
    <header className={cn("h-16 px-4 lg:px-6 border-b bg-background flex items-center", className)}>
      <div className="flex-1"></div> {/* Spacer */}
      
      <div className="flex items-center space-x-2">
        {searchVisible && (
          <div className="relative mr-2">
            <input 
              type="text" 
              placeholder="Search..." 
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>  
        )}
        
        <Button variant="ghost" size="icon" onClick={() => setSearchVisible(!searchVisible)}>
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        
        <Link href="/admin/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}