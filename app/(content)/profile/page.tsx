"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDownloads } from "@/hooks/use-downloads";
import { useOffline } from "@/hooks/use-offline";
import { Globe, Download, LogOut, WifiOff, RefreshCw } from "lucide-react";

// Hardcoded languages for now, could be fetched from API
const availableLanguages = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "sw", name: "Swahili" },
  { code: "am", name: "Amharic" },
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yoruba" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { session, profile, isAuthenticated, updateProfile, logout } =
    useAuth();
  const { clearDownloads } = useDownloads();
  const { isOnline, isSyncing, pendingActions, syncData } = useOffline();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  if (!profile) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-center">
            <p className="text-lg">Loading profile...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const language_preference = formData.get("language_preference") as string;
    const download_preference = formData.get("download_preference") as string;

    updateProfile({
      username,
      language_preference,
      download_preference,
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
              Profile Settings
            </h1>
            {!isOnline && (
              <div className="flex items-center text-amber-500 text-sm">
                <WifiOff className="h-4 w-4 mr-1" /> Offline Mode
              </div>
            )}
          </div>
          <p
            className="text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Manage your account preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={session?.user?.email || ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={
                      profile?.profile?.username ||
                      session?.user?.email?.split("@")[0] ||
                      ""
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={!isOnline}>
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language Preference</Label>
                  <Select
                    name="language_preference"
                    defaultValue={profile?.profile?.language_preference || "en"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLanguages.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Download Preference</Label>
                  <RadioGroup
                    name="download_preference"
                    defaultValue={
                      profile?.profile?.download_preference || "wifi_only"
                    }
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wifi_only" id="wifi_only" />
                      <Label htmlFor="wifi_only">Download on Wi-Fi only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="any_network" id="any_network" />
                      <Label htmlFor="any_network">
                        Download on any network
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={!isOnline}>
                  Save Preferences
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center p-4 border rounded-md">
                <div className="mr-4">
                  <Download className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">
                    Clear Downloaded Content
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Remove all downloaded content to free up space
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearDownloads()}
                  disabled={!isOnline}
                >
                  Clear
                </Button>
              </div>
              <div className="flex items-center p-4 border rounded-md">
                <div className="mr-4">
                  <Globe className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">Sync Content</h3>
                  <p className="text-xs text-muted-foreground">
                    Synchronize your progress and download new content
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncData()}
                  disabled={!isOnline || isSyncing}
                  className="min-w-[80px]"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />{" "}
                      Syncing...
                    </>
                  ) : (
                    <>Sync {pendingActions > 0 && `(${pendingActions})`}</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              className="w-full flex items-center gap-2"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
