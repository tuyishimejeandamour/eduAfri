"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useOfflineAuth } from "@/lib/offline-auth"
import { useOffline } from "@/hooks/use-offline"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { WifiOff } from "lucide-react"

export function AuthForm() {
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
        toast.success("Signed in offline successfully")
        window.location.href = "/dashboard" // Redirect to dashboard
      } else {
        toast.error("Offline sign in failed. Check your credentials or create an offline account.")
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
        toast.success("Offline account created successfully")
        window.location.href = "/dashboard" // Redirect to dashboard
      } else {
        toast.error("Failed to create offline account. Email may already be in use.")
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
          <CardTitle className="text-2xl text-center">EduAfri</CardTitle>
          <CardDescription className="text-center">Access educational content offline across Africa</CardDescription>
          {offlineMode && (
            <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-amber-100 text-amber-800 rounded-md text-sm">
              <WifiOff className="h-4 w-4" />
              <span>Offline Mode</span>
            </div>
          )}
          <div className="mt-4 flex justify-between items-center">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <TabsContent value="signin">
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
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
                  {offlineMode ? "Try online sign in" : "Use offline mode"}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading && !offlineMode}>
                {loading && !offlineMode ? "Signing in..." : offlineMode ? "Sign In Offline" : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {offlineMode && (
                <div className="space-y-2">
                  <Label htmlFor="username-signup">Username (Optional)</Label>
                  <Input
                    id="username-signup"
                    type="text"
                    placeholder="Your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
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
                  {offlineMode ? "Try online sign up" : "Use offline mode"}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading && !offlineMode}>
                {loading && !offlineMode ? "Signing up..." : offlineMode ? "Sign Up Offline" : "Sign Up"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

