"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDownloads } from "@/hooks/use-downloads";
import { useOffline } from "@/hooks/use-offline";
import { WifiOff, Download, Globe, RefreshCw } from "lucide-react";
import { AppShell } from "@/app/[lang]/components/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/[lang]/components/ui/card";
import { Input } from "@/app/[lang]/components/ui/input";
import { Label } from "@/app/[lang]/components/ui/label";
import { Button } from "@/app/[lang]/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[lang]/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/app/[lang]/components/ui/radio-group";
import { type getDictionary } from "@/get-dictionary";

// Hardcoded languages for now, could be fetched from API
const availableLanguages = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "sw", name: "Swahili" },
  { code: "rw", name: "Kinyarwanda" },
];

interface ProfileClientProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["profile"];
}

export default function ProfileClient({ dictionary }: ProfileClientProps) {
  const router = useRouter();
  const { session, profile, isAuthenticated, updateProfile, logout } = useAuth();
  const { clearDownloads } = useDownloads();
  const { isOnline, isSyncing, syncData } = useOffline();

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

  const handleLogout = () => {
    logout();
    router.push("/"); // Explicitly redirect to home page after logout
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
              {dictionary.title}
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
            {dictionary.description}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle>{dictionary.actions.title}</CardTitle>
              <CardDescription>
                {dictionary.actions.description}
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
                  {dictionary.saveButton}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                {dictionary.actions.description}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{dictionary.preferences.language}</Label>
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
                  <Label>{dictionary.preferences.downloadPreference}</Label>
                  <RadioGroup
                    name="download_preference"
                    defaultValue={
                      profile?.profile?.download_preference || "wifi_only"
                    }
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wifi_only" id="wifi_only" />
                      <Label htmlFor="wifi_only">
                        {dictionary.preferences.wifiOnly}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="any_network" id="any_network" />
                      <Label htmlFor="any_network">
                        {dictionary.preferences.anyNetwork}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={!isOnline}>
                  {dictionary.saveButton}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle>{dictionary.actions.title}</CardTitle>
            <CardDescription>{dictionary.actions.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center p-4 border rounded-md">
                <div className="mr-4">
                  <Download className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">
                    {dictionary.actions.clearDownloads.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {dictionary.actions.clearDownloads.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearDownloads()}
                  disabled={!isOnline}
                >
                  {dictionary.actions.clearDownloads.button}
                </Button>
              </div>
              <div className="flex items-center p-4 border rounded-md">
                <div className="mr-4">
                  <Globe className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">
                    {dictionary.actions.syncData.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {dictionary.actions.syncData.description}
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
                      {dictionary.actions.syncData.syncing}
                    </>
                  ) : (
                    dictionary.actions.syncData.button
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              {dictionary.logoutButton}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}