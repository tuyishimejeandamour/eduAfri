"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <WifiOff className="h-16 w-16 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-2">You&apos;re offline</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        It looks like you&apos;re not connected to the internet. Don&apos;t
        worry, you can still access your downloaded content.
      </p>
      <div className="space-y-4">
        <Link href="/downloads">
          <Button size="lg">View Downloaded Content</Button>
        </Link>
        <div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
