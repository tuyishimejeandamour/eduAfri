"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useOfflineAuth } from "@/lib/offline-auth"
import { useOffline } from "@/hooks/use-offline"
import { Button } from "@/app/[lang]/components/ui/button"
import { Input } from "@/app/[lang]/components/ui/input"
import { Label } from "@/app/[lang]/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/[lang]/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/[lang]/components/ui/tabs"
import { toast } from "sonner"
import { WifiOff } from "lucide-react"
import { type getDictionary } from "@/get-dictionary"

interface AuthFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["auth"]
}

export function AuthForm({ dictionary }: AuthFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [offlineMode, setOfflineMode] = useState(false)
  const { signIn, signUp, loading } = useAuth()
  const { offlineSignIn, offlineSignUp } = useOfflineAuth()
  const { isOnline } = useOffline()
  
  // Check online status when component mounts
  useEffect(() => {
    setOfflineMode(!isOnline)
  }, [isOnline])
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (offlineMode) {
      // Use offline authentication
      const success = await offlineSignIn(email, password)
      if (success) {
        toast.success(dictionary.signIn.offlineSuccessMessage)
        window.location.href = "/dashboard" // Redirect to dashboard
      } else {
        toast.error(dictionary.signIn.failureMessage)
      }
    } else {
      // Use online authentication
      signIn(email, password)
    }
  }
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (offlineMode) {
      // Use offline authentication
      const success = await offlineSignUp(email, password, username)
      if (success) {
        toast.success(dictionary.signUp.offlineSuccessMessage)
        window.location.href = "/dashboard" // Redirect to dashboard
      } else {
        toast.error(dictionary.signUp.failureMessage)
      }
    } else {
      // Use online authentication
      signUp(email, password)
    }
  }
  
  return (
    <Card className="w-full max-w-md mx-auto animate-bounce-in">
      <Tabs defaultValue="signin">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{dictionary.title}</CardTitle>
          <CardDescription className="text-center">{dictionary.description}</CardDescription>
          {offlineMode && (
            <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-amber-100 text-amber-800 rounded-md text-sm">
              <WifiOff className="h-4 w-4" />
              <span>{dictionary.offlineMode}</span>
            </div>
          )}
          <div className="mt-4 flex justify-between items-center">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{dictionary.signIn.tab}</TabsTrigger>
              <TabsTrigger value="signup">{dictionary.signUp.tab}</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <TabsContent value="signin">
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">{dictionary.signIn.emailLabel}</Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder={dictionary.signIn.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">{dictionary.signIn.passwordLabel}</Label>
                <Input
                  id="password-signin"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="link"
                  className="ml-auto p-0 h-auto text-xs"
                  onClick={() => setOfflineMode(!offlineMode)}
                >
                  {offlineMode ? dictionary.signIn.useOnlineMode : dictionary.signIn.useOfflineMode}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading && !offlineMode}>
                {loading && !offlineMode ? dictionary.signIn.buttonLoading : offlineMode ? dictionary.signIn.buttonOffline : dictionary.signIn.button}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">{dictionary.signUp.emailLabel}</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder={dictionary.signUp.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {offlineMode && (
                <div className="space-y-2">
                  <Label htmlFor="username-signup">{dictionary.signUp.usernameLabel}</Label>
                  <Input
                    id="username-signup"
                    type="text"
                    placeholder={dictionary.signUp.usernamePlaceholder}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password-signup">{dictionary.signUp.passwordLabel}</Label>
                <Input
                  id="password-signup"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="link"
                  className="ml-auto p-0 h-auto text-xs"
                  onClick={() => setOfflineMode(!offlineMode)}
                >
                  {offlineMode ? dictionary.signUp.useOnlineMode : dictionary.signUp.useOfflineMode}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading && !offlineMode}>
                {loading && !offlineMode ? dictionary.signUp.buttonLoading : offlineMode ? dictionary.signUp.buttonOffline : dictionary.signUp.button}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

