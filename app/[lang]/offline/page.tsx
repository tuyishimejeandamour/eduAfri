"use client";

import { Button } from "@/app/[lang]/components/ui/button";
import { WifiOff, Home, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto text-center space-y-6">
        <div className="bg-muted/30 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight">Youre offline</h1>
        
        <p className="text-muted-foreground">
          It looks like you're not connected to the internet. Check your connection and try again.
        </p>
        
        <div className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            You can still access any content you've downloaded for offline use.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = "/downloads"}
            >
              <span>View Downloads</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Connection</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => window.location.href = "/"}
            >
              <Home className="h-4 w-4" />
              <span>Go Home</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}