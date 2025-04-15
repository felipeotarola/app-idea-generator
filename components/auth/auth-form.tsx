"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Add this effect to prevent the loading state from getting stuck
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    if (loading) {
      // Set a timeout to reset loading state if it takes too long
      timeoutId = setTimeout(() => {
        setLoading(false)
        toast({
          title: "Login timeout",
          description: "Please try again or refresh the page.",
          variant: "destructive",
        })
      }, 10000) // 10 seconds timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [loading, toast])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: email.split("@")[0], // Default name from email
          },
        },
      })

      if (error) throw error

      toast({
        title: "Account created!",
        description: "Please check your email for the confirmation link.",
      })

      // If auto-confirm is enabled in Supabase
      if (data.user) {
        // Use direct navigation instead of router
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      // Force a refresh of the session
      await supabase.auth.getSession()

      console.log("Login successful, redirecting to dashboard...")

      // Use direct navigation instead of router for more reliable redirect
      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-black/30 border-purple-500/30 backdrop-blur-sm">
      <Tabs defaultValue="signin">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2 bg-black/20">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/20 border-white/10 text-white"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/20 border-white/10 text-white"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Sign In
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-white/70"
                onClick={handlePasswordReset}
                disabled={loading || !email}
              >
                Forgot password?
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/20 border-white/10 text-white"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/20 border-white/10 text-white"
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  )
}
